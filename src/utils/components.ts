import type { SteamPlayer } from "../types/steam.ts";
import {
    type APIActionRowComponent,
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
    type APIComponentInContainer,
    type APIContainerComponent,
    type APISectionComponent,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    type APIThumbnailComponent,
    type APIUnfurledMediaItem,
    BaseInteraction,
    ButtonStyle,
} from "discord.js";
import SteamID from "steamid";
import { getPlayerSummary } from "../services/steam.ts";
import client from "../services/backendClient.ts";

export const steamProfileComponent = (player: SteamPlayer) => {
    const steamId = new SteamID(player.steamid);

    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `# [${player.personaname}](${player.profileurl})\n**Last online:** <t:${player.lastlogoff}:R>`,
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 11,
                    media: { url: player.avatar } satisfies APIUnfurledMediaItem,
                } satisfies APIThumbnailComponent,
            } satisfies APISectionComponent,
            { type: 14, spacing: 2 } satisfies APISeparatorComponent,
            { type: 10, content: `### SteamID64\n\`\`\`${player.steamid}\`\`\`` } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            { type: 10, content: `### SteamID32\n\`\`\`${steamId.steam2()}\`\`\`` } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            { type: 10, content: `### SteamID3\n\`\`\`${steamId.steam3()}\`\`\`` } satisfies APITextDisplayComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const steamConnectComponent = (code: string, text?: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: text?.replace("\\n", "\n") ?? "### Connect to the server!",
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${client.connect[":code"].$url({ param: { code } })}`,
                    label: "Connect",
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const createConnectionPersonalComponent = (token: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: "# Link your accounts!",
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${client.connections.create.$url({ query: { token: encodeURIComponent(token) } })}`,
                    label: "Link Accounts",
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
            {
                type: 10,
                content: `>>> - You will be redirected to official Steam login page (steamcommunity.com)
- We only get your public Steam ID from Steam
- Link expires in 10 minutes. Do not share this link!`,
            } satisfies APITextDisplayComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const createConnectionPublicComponent = () => {
    return {
        type: 17,
        components: [
            {
                type: 10,
                content: "# Link your accounts!",
            } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            {
                type: 10,
                content: ">>> **Link your Discord and Steam account.**\nClick the button below to generate your personal link.",
            } satisfies APITextDisplayComponent,
            { type: 14, divider: false, spacing: 2 } satisfies APISeparatorComponent,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: ButtonStyle.Success,
                        custom_id: `create_connection_button`,
                        label: "Link Accounts",
                        emoji: { name: "🔗" },
                    } satisfies APIButtonComponentWithCustomId,
                ] satisfies APIButtonComponentWithCustomId[],
            } satisfies APIActionRowComponent<APIButtonComponentWithCustomId>,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

const connectionComponent = (guildName: string | undefined, guildId: string, steamName: string | undefined, steamId: string) => {
    return {
        type: 9,
        accessory: {
            type: 2,
            style: 4,
            label: "Delete",
            custom_id: `delete_connection_button;${guildId}`,
        },
        components: [
            {
                type: 10,
                content: `>>> **Server: [${guildName ?? "ID: " + guildId}](https://discord.com/channels/${guildId})**
**Steam: [${steamName ?? "ID: " + steamId}](https://steamcommunity.com/profiles/${steamId})**`,
            },
        ],
    };
};

type Connection = {
    guildId: string;
    steamId: string;
};

export const manageConnectionsComponent = async (interaction: BaseInteraction, connections: Connection[]) => {
    return {
        type: 17,
        accent_color: null,
        spoiler: false,
        components: [
            {
                type: 10,
                content: `## Connections for ${interaction.user}`,
            },
            { type: 14, spacing: 2 },
            ...connections.length
                ? await Promise.all(connections.map(async (connection) =>
                    connectionComponent(
                        (await interaction.client.guilds.fetch(connection.guildId))?.name,
                        connection.guildId,
                        (await getPlayerSummary(connection.steamId))?.personaname,
                        connection.steamId,
                    )
                ))
                : [
                    {
                        type: 10,
                        content: "You have no connections.",
                    },
                ],
            ...connections.length > 10
                ? [
                    { type: 14, divider: false },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Previous Page",
                                disabled: true,
                                custom_id: "previous_page_manage_connections_button",
                            },
                            {
                                type: 2,
                                style: 2,
                                label: "Next Page",
                                custom_id: "next_page_manage_connections_button",
                            },
                        ],
                    },
                ]
                : [],
        ],
    } satisfies APIContainerComponent;
};

type GameServerData = {
    code: string;
    ip: string;
    port: number;
    password: string | null;
};

const gameServerComponent = (server: GameServerData) => {
    return {
        type: 9,
        accessory: {
            type: 2,
            style: 4,
            label: "Delete",
            custom_id: `delete_game_server_button;${server.code}`,
        },
        components: [
            {
                type: 10,
                content: `>>> **Server:** \`${server.ip}:${server.port}\`\n**Password:** ${
                    server.password ? server.password : "No password set."
                }\n-# Code: \`${server.code}\``,
            },
        ],
    };
};

export const manageGameServersComponent = async (_interaction: BaseInteraction, servers: GameServerData[]) => {
    return {
        type: 17,
        accent_color: null,
        spoiler: false,
        components: [
            {
                type: 10,
                content: `## Game Servers registered for this guild:`,
            },
            { type: 14, spacing: 2 },
            ...servers.length ? await Promise.all(servers.map((server) => gameServerComponent(server))) : [
                {
                    type: 10,
                    content: "There are no game servers registered for this guild.",
                },
            ],
            ...servers.length > 10
                ? [
                    { type: 14, divider: false },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Previous Page",
                                disabled: true,
                                custom_id: "previous_page_manage_game_servers_button",
                            },
                            {
                                type: 2,
                                style: 2,
                                label: "Next Page",
                                custom_id: "next_page_manage_game_servers_button",
                            },
                        ],
                    },
                ]
                : [],
        ],
    } satisfies APIContainerComponent;
};
