import { BaseGuildTextChannel, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { manageGameServersComponent, steamConnectComponent } from "../utils/components.ts";
import { config } from "../../config.ts";
import client from "../services/backendClient.ts";
import { t } from "../utils/i18n.ts";

export const createSteamConnectHandler = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const ip = interaction.options.getString("ip", true);
    const port = interaction.options.getInteger("port", true);
    const password = interaction.options.getString("password", false);
    const text = interaction.options.getString("text", false) ?? undefined;
    const res = await client.api.v1.codes.$post({
        json: { guildId: interaction.guildId!, ip, port, password: password ?? null },
    });
    const data = await res.json();

    if ((res.status as number) === 400) {
        await interaction.reply({
            content: t("steamConnect.invalidInput", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (res.status === 402) {
        await interaction.reply({
            content: (data as { error: string }).error,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!res.ok) {
        await interaction.reply({
            content: t("steamConnect.error.create", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!(interaction.channel instanceof BaseGuildTextChannel)) return;

    await interaction.channel.send({
        components: [steamConnectComponent((data as { code: string }).code, interaction.guildLocale ?? interaction.locale, text)],
        flags: MessageFlags.IsComponentsV2,
    });
    await interaction.reply({
        content: t("steamConnect.create.success", interaction.locale),
        flags: MessageFlags.Ephemeral,
    });
};

export const manageSteamConnectHandler = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const response = await client.api.v1.codes.guild[":guildId"].$get({
        param: { guildId: interaction.guildId! },
    }, {
        headers: { "Authorization": `Bearer ${config.apiKey}` },
    });

    if (!response.ok) {
        await interaction.reply({
            content: t("steamConnect.error.fetch", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const codes: { code: string; ip: string; port: number; password: string | null }[] = (await response.json()).data;

    await interaction.reply({
        components: [await manageGameServersComponent(interaction, codes)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
