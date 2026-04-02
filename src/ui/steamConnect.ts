import {
    type APIButtonComponentWithURL,
    type APIComponentInContainer,
    type APIContainerComponent,
    type APISectionComponent,
    type APITextDisplayComponent,
    BaseInteraction,
} from "discord.js";
import client from "../services/backendClient.ts";
import { t } from "../utils/i18n.ts";

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

export type GameServerData = {
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