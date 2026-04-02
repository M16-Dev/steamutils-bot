import {
    type APIActionRowComponent,
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
    type APIComponentInContainer,
    type APIContainerComponent,
    type APISectionComponent,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    BaseInteraction,
    ButtonStyle,
} from "discord.js";
import client from "../services/backendClient.ts";
import { getPlayerSummary } from "../services/steam.ts";
import { t } from "../utils/i18n.ts";

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

export type Connection = {
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