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
import { t } from "./i18n.ts";

export const steamProfileComponent = (player: SteamPlayer, discordId: string | null, locale: string) => {
    const steamId = new SteamID(player.steamid);

    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `# [${player.personaname}](${player.profileurl})\n**${t("steamInfo.lastOnline.header", locale)}:** ${
                            player.lastlogoff ? `<t:${player.lastlogoff}:R>` : t("steamInfo.lastOnline.unknown", locale)
                        }\n**Discord:** ${discordId ? `<@${discordId}>` : t("steamInfo.discord.notLinked", locale)}`,
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

export const steamConnectComponent = (code: string, locale: string, text?: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: text?.replace("\\n", "\n") ?? `### ${t("steamConnect.header", locale)}`,
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${client.connect[":code"].$url({ param: { code } })}`,
                    label: t("steamConnect.buttonLabel", locale),
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const createConnectionPersonalComponent = (token: string, locale: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `# ${t("connections.create.header", locale)}`,
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${client.connections.create.$url({ query: { token: encodeURIComponent(token) } })}`,
                    label: t("connections.create.buttonLabel", locale),
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
            {
                type: 10,
                content: `>>> ${t("connections.create.personalInfo", locale)}`,
            } satisfies APITextDisplayComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const createConnectionPublicComponent = (locale: string) => {
    return {
        type: 17,
        components: [
            {
                type: 10,
                content: `# ${t("connections.create.header", locale)}`,
            } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            {
                type: 10,
                content: `>>> ${t("connections.create.info", locale)}`,
            } satisfies APITextDisplayComponent,
            { type: 14, divider: false, spacing: 2 } satisfies APISeparatorComponent,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: ButtonStyle.Success,
                        custom_id: `create_connection_button`,
                        label: t("connections.create.buttonLabel", locale),
                        emoji: { name: "🔗" },
                    } satisfies APIButtonComponentWithCustomId,
                ] satisfies APIButtonComponentWithCustomId[],
            } satisfies APIActionRowComponent<APIButtonComponentWithCustomId>,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

const connectionComponent = (guildName: string | undefined, guildId: string, steamName: string | undefined, steamId: string, locale: string) => {
    return {
        type: 9,
        accessory: {
            type: 2,
            style: 4,
            label: t("common.delete", locale),
            custom_id: `delete_connection_button;${guildId}`,
        },
        components: [
            {
                type: 10,
                content: `>>> **${t("common.server", locale)}: [${guildName ?? "ID: " + guildId}](https://discord.com/channels/${guildId})**
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
                content: `## ${t("connections.manage.header", interaction.locale, { user: interaction.user.toString() })}`,
            },
            { type: 14, spacing: 2 },
            ...connections.length
                ? await Promise.all(connections.map(async (connection) =>
                    connectionComponent(
                        (await interaction.client.guilds.fetch(connection.guildId))?.name,
                        connection.guildId,
                        (await getPlayerSummary(connection.steamId))?.personaname,
                        connection.steamId,
                        interaction.locale,
                    )
                ))
                : [
                    {
                        type: 10,
                        content: t("connections.manage.noConnections", interaction.locale),
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
                                label: t("common.prevPage", interaction.locale),
                                disabled: true,
                                custom_id: "previous_page_manage_connections_button",
                            },
                            {
                                type: 2,
                                style: 2,
                                label: t("common.nextPage", interaction.locale),
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

const gameServerComponent = (server: GameServerData, locale: string) => {
    return {
        type: 9,
        accessory: {
            type: 2,
            style: 4,
            label: t("common.delete", locale),
            custom_id: `delete_game_server_button;${server.code}`,
        },
        components: [
            {
                type: 10,
                content: `>>> **${t("common.server", locale)}:** \`${server.ip}:${server.port}\`\n**${t("common.password", locale)}:** ${
                    server.password ? server.password : t("steamConnect.manage.noPassword", locale)
                }\n-# ${t("common.code", locale)}: \`${server.code}\``,
            },
        ],
    };
};

export const manageGameServersComponent = async (interaction: BaseInteraction, servers: GameServerData[]) => {
    return {
        type: 17,
        accent_color: null,
        spoiler: false,
        components: [
            {
                type: 10,
                content: `## ${t("steamConnect.manage.header", interaction.locale)}`,
            },
            { type: 14, spacing: 2 },
            ...servers.length ? await Promise.all(servers.map((server) => gameServerComponent(server, interaction.locale))) : [
                {
                    type: 10,
                    content: t("steamConnect.manage.noServers", interaction.locale),
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
                                label: t("common.prevPage", interaction.locale),
                                disabled: true,
                                custom_id: "previous_page_manage_game_servers_button",
                            },
                            {
                                type: 2,
                                style: 2,
                                label: t("common.nextPage", interaction.locale),
                                custom_id: "next_page_manage_game_servers_button",
                            },
                        ],
                    },
                ]
                : [],
        ],
    } satisfies APIContainerComponent;
};
