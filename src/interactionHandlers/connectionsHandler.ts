import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { create, getNumericDate } from "@wok/djwt";
import { createConnectionPersonalComponent, manageConnectionsComponent } from "../utils/components.ts";
import { config } from "../../config.ts";
import client from "../services/backendClient.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
);

export const createConnectionHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await client.api.v1.connections[":discordId"].$get({
        param: { discordId: interaction.user.id },
    });

    if (!response.ok) {
        await interaction.reply({
            content: `Failed to check existing connections. Please try again later.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const { connections } = await response.json();
    if (connections.length >= config.connectionsLimit) {
        await interaction.reply({
            content:
                `You have reached the maximum number of connections (${config.connectionsLimit}). Please manage your existing connections before creating a new one.`,
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
        components: [createConnectionPersonalComponent(token)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};

interface ConnectionRow {
    discord_id: string;
    steam_id: string;
    guild_id: string;
    created_at: string;
}
export const manageConnectionsHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await client.api.v1.connections[":discordId"].$get({
        param: { discordId: interaction.user.id },
    });

    if (!response.ok) {
        await interaction.reply({
            content: `Failed to fetch your connections. Please try again later.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    const connections: ConnectionRow[] = (await response.json()).connections;

    await interaction.reply({
        components: [await manageConnectionsComponent(interaction, connections.map((con) => ({ guildId: con.guild_id, steamId: con.steam_id })))],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
