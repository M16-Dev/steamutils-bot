import {
    type APIContainerComponent,
    type APIMediaGalleryComponent,
    type APIMediaGalleryItem,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    BaseInteraction,
    ButtonStyle,
} from "discord.js";
import { TrackedServer } from "../services/db.ts";
import { ServerInfo } from "../services/serverQuery.ts";
import { t } from "../utils/i18n.ts";

const trackedServerComponent = (server: TrackedServer, locale: string) => {
    return {
        type: 9,
        accessory: {
            type: 2,
            style: 4,
            label: t("common.delete", locale),
            custom_id: `delete_tracked_server_button;${server.channelId};${server.messageId}`,
        },
        components: [
            {
                type: 10,
                content: `>>> **${
                    t("common.server", locale)
                }:** \`${server.ip}:${server.port}\`\nhttps://discord.com/channels/${server.guildId}/${server.channelId}/${server.messageId}`,
            },
        ],
    };
};

export const manageTrackedServersComponent = async (interaction: BaseInteraction, servers: TrackedServer[]) => {
    return {
        type: 17,
        accent_color: 0x00FF00,
        components: [
            {
                type: 10,
                content: `## ${t("serverTracker.manage.header", interaction.locale)}`,
            },
            { type: 14, spacing: 2 },
            ...servers.length ? await Promise.all(servers.map((server) => trackedServerComponent(server, interaction.locale))) : [
                {
                    type: 10,
                    content: t("serverTracker.manage.noServers", interaction.locale),
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
                                custom_id: "previous_page_manage_tracked_servers_button",
                            },
                            {
                                type: 2,
                                style: 2,
                                label: t("common.nextPage", interaction.locale),
                                custom_id: "next_page_manage_tracked_servers_button",
                            },
                        ],
                    },
                ]
                : [],
        ],
    } satisfies APIContainerComponent;
};

export const createTrackedServerComponent = (serverInfo: ServerInfo, locale: string) => {
    return {
        type: 17,
        accent_color: serverInfo.isOnline ? 0x47EB7E : 0xF04242,
        components: [
            {
                type: 10,
                content: `# ${t("serverTracker.header", locale, { name: serverInfo.name })}`,
            } satisfies APITextDisplayComponent,
            { type: 14, divider: false, spacing: 1 } satisfies APISeparatorComponent,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: ButtonStyle.Secondary,
                        disabled: true,
                        custom_id: `status`,
                        emoji: {
                            id: serverInfo.isOnline ? "1480229588176080958" : "1480229590483075294",
                            name: serverInfo.isOnline ? "online" : "offline",
                        },
                    },
                    {
                        type: 2,
                        style: ButtonStyle.Secondary,
                        disabled: true,
                        custom_id: `map`,
                        label: `${serverInfo.map}`,
                    },
                    {
                        type: 2,
                        style: ButtonStyle.Secondary,
                        disabled: true,
                        custom_id: `players`,
                        label: `${serverInfo.players}/${serverInfo.maxPlayers}`,
                    },
                ],
            },
            { type: 14, spacing: 2 },
            {
                type: 12,
                items: [
                    { media: { url: `attachment://chart.png` } },
                ] satisfies APIMediaGalleryItem[],
            } satisfies APIMediaGalleryComponent,
            {
                type: 10,
                content: `-# ${t("serverTracker.lastUpdate", locale)}: ${new Date().toLocaleTimeString()}`,
            } satisfies APITextDisplayComponent,
        ],
    } satisfies APIContainerComponent;
};