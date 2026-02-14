import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getPlayerSummary, resolveVanityUrl } from "../services/steam.ts";
import { steamProfileComponent } from "../utils/components.ts";
import SteamID from "steamid";
import client from "../services/backendClient.ts";
import { t } from "../utils/i18n.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("steaminfo")
        .setDescription("Get information about a Steam user")
        .addStringOption((option) =>
            option
                .setName("steam")
                .setDescription("The Steam user to look up. Can be a username, SteamID or URL.")
                .setRequired(false)
        )
        .addUserOption((option) =>
            option
                .setName("discord")
                .setDescription("The Discord user to look up the linked Steam account for.")
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const steamInput = interaction.options.getString("steam");
        const discordUser = interaction.options.getUser("discord");

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!!steamInput === !!discordUser) {
            await interaction.editReply({
                content: t("steamInfo.invalidInput", interaction.locale),
            });
            return;
        }

        let targetSteamId64: string | null = null;
        let linkedDiscordId: string | null = null;

        if (discordUser) {
            const res = await client.api.v1.connections.$get({
                query: {
                    discordId: discordUser.id,
                    guildId: interaction.guildId!,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if ("steamId" in data && data.steamId) {
                    targetSteamId64 = data.steamId;
                    linkedDiscordId = discordUser.id;
                }
            }
        } else if (steamInput) {
            targetSteamId64 = await resolveSteamInput(steamInput);
        }

        if (!targetSteamId64) {
            const msg = discordUser
                ? t("steamInfo.error.noAccount", interaction.locale, { discordId: discordUser.id })
                : t("steamInfo.error.resolve", interaction.locale, { steamInput });

            await interaction.editReply({ content: msg });
            return;
        }

        if (!linkedDiscordId) {
            const res = await client.api.v1.connections.$get({
                query: {
                    steamId: targetSteamId64,
                    guildId: interaction.guildId!,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if ("discordId" in data && data.discordId) {
                    linkedDiscordId = data.discordId;
                }
            }
        }

        const profile = await getPlayerSummary(targetSteamId64);

        if (!profile) {
            await interaction.editReply({
                content: t("steamInfo.error.fetch", interaction.locale, { SteamId: targetSteamId64 }),
            });
            return;
        }

        await interaction.editReply({
            components: [steamProfileComponent(profile, linkedDiscordId, interaction.locale)],
            flags: MessageFlags.IsComponentsV2,
        });
    },
} satisfies Command<ChatInputCommandInteraction>;

async function resolveSteamInput(input: string): Promise<string | null> {
    // clean URL junk
    if (input.includes("steamcommunity.com/")) {
        const match = input.match(/steamcommunity\.com\/(?:id|profiles)\/([^\/]+)/);
        input = match?.[1] ?? input;
    }

    // try parsing as direct steamID
    try {
        const steamId = new SteamID(input);
        if (steamId.isValid()) return steamId.getSteamID64();
    } catch {
        // not a direct ID,  check vanity url
    }

    // resolve vanity url
    const resolvedId = await resolveVanityUrl(input);
    if (resolvedId) {
        try {
            const steamId = new SteamID(resolvedId);
            return steamId.isValid() ? steamId.getSteamID64() : null;
        } catch {
            return null;
        }
    }

    return null;
}
