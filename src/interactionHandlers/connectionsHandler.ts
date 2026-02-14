import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { create, getNumericDate } from "@wok/djwt";
import { createConnectionPersonalComponent, manageConnectionsComponent } from "../utils/components.ts";
import { config } from "../../config.ts";
import client from "../services/backendClient.ts";
import { t } from "../utils/i18n.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
);

export const createConnectionHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await client.api.v1.connections.$get({
        query: { discordId: interaction.user.id },
    });

    if (!response.ok) {
        await interaction.reply({
            content: t("connections.fetch.error", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const { connections } = await response.json() as { connections: ConnectionWithGuild[] };
    if (connections.length >= config.connectionsLimit) {
        await interaction.reply({
            content: t("connections.limitReached", interaction.locale, { limit: config.connectionsLimit }),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
            discordId: interaction.user.id,
            guildId: interaction.guildId,
            exp: getNumericDate(10 * 60),
        },
        key,
    );

    await interaction.reply({
        components: [createConnectionPersonalComponent(token, interaction.locale)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};

interface Connection {
    discord_id: string;
    steam_id: string;
    created_at: string;
}
interface ConnectionWithGuild extends Connection {
    guild_id: string;
}

export const manageConnectionsHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await client.api.v1.connections.$get({
        query: { discordId: interaction.user.id },
    });

    if (!response.ok) {
        await interaction.reply({
            content: t("connections.fetch.error", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    const { connections } = await response.json() as { connections: ConnectionWithGuild[] };

    await interaction.reply({
        components: [await manageConnectionsComponent(interaction, connections.map((con) => ({ guildId: con.guild_id, steamId: con.steam_id })))],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
