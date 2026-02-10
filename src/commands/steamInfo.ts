import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getPlayerSummary, resolveVanityUrl } from "../services/steam.ts";
import { steamProfileComponent } from "../utils/components.ts";
import SteamID from "steamid";
import client from "../services/backendClient.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("steaminfo")
        .setDescription("Get information about a Steam user")
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription("The Steam user to look up. Can be a username, SteamID or URL.")
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let input = interaction.options.getString("user", true);

        if (input.includes("steamcommunity.com/")) {
            const match = input.match(/steamcommunity\.com\/(?:id|profiles)\/([^\/]+)/);
            input = match?.[1] ?? input;
        }

        const tryParseSteamId = (id: string): SteamID | null => {
            try {
                const steamId = new SteamID(id);
                return steamId.isValid() ? steamId : null;
            } catch {
                return null;
            }
        };

        let steamId = tryParseSteamId(input);

        if (!steamId) {
            const resolvedId = await resolveVanityUrl(input);
            if (!resolvedId) {
                await interaction.reply({
                    content: `Could not find Steam user: ${input}`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            steamId = tryParseSteamId(resolvedId);
            if (!steamId) {
                await interaction.reply({
                    content: `Invalid Steam ID returned: ${resolvedId}`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        const profile = await getPlayerSummary(steamId.getSteamID64());
        if (!profile) {
            await interaction.reply({
                content: `Could not fetch profile for: ${input}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const discordId = await client.api.v1.connections.$get({
            query: {
                steamId: steamId.getSteamID64(),
                guildId: interaction.guildId!,
            },
        }).then(async (res) => {
            if (!res.ok) return null;
            const { discordId } = await res.json() as { discordId: string | null };
            return discordId;
        });

        await interaction.reply({
            components: [steamProfileComponent(profile, discordId)],
            flags: MessageFlags.IsComponentsV2,
        });
    },
} satisfies Command<ChatInputCommandInteraction>;
