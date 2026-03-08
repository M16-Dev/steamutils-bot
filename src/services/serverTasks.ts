import { Bot } from "../bot.ts";
import { db } from "./db.ts";
import { querySteamServer } from "./serverQuery.ts";
import { generateChartBuffer } from "./chart.ts";
import { AttachmentBuilder, MessageFlags, TextChannel } from "discord.js";
import { Buffer } from "node:buffer";
import { logger } from "../utils/logger.ts";
import { createTrackedServerComponent } from "../utils/components.ts";

const UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const HISTORY_INTERVAL_MS = 15 * 60 * 1000;

export function startServerTasks(bot: Bot) {
    logger.info("Starting server monitoring tasks...");

    setInterval(async () => {
        try {
            await collectHistory();
        } catch (e) {
            logger.error("Error in collectHistory task", e);
        }
    }, HISTORY_INTERVAL_MS);

    setInterval(async () => {
        try {
            await updateMessages(bot);
        } catch (e) {
            logger.error("Error in updateMessages task", e);
        }
    }, UPDATE_INTERVAL_MS);

    setTimeout(() => collectHistory().then(() => updateMessages(bot)), 5000);
}

async function collectHistory() {
    const servers = await db.getAllTrackedServers();

    // Group unique servers to avoid querying same IP:PORT multiple times if tracked in multiple guilds
    const uniqueServers = new Map<string, { ip: string; port: number }>();
    servers.forEach((s) => {
        const key = `${s.ip}:${s.port}`;
        if (!uniqueServers.has(key)) {
            uniqueServers.set(key, { ip: s.ip, port: s.port });
        }
    });

    for (const [_, server] of uniqueServers) {
        const info = await querySteamServer(server.ip, server.port);
        if (info && info.isOnline) {
            await db.addServerHistory(server.ip, server.port, info.players, info.maxPlayers);
        }
    }
}

async function updateMessages(bot: Bot) {
    const servers = await db.getAllTrackedServers();

    for (const server of servers) {
        try {
            const channel = await bot.channels.fetch(server.channelId) as TextChannel;
            if (!channel) continue;

            const message = await channel.messages.fetch(server.messageId).catch(() => null);
            if (!message) {
                logger.warn(`Message ${server.messageId} missing, untracking ${server.ip}:${server.port}`);
                await db.untrackServer(server.guildId, server.messageId);
                continue;
            }

            const info = await querySteamServer(server.ip, server.port);
            if (!info) continue;

            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            const history = await db.getServerHistory(server.ip, server.port, oneDayAgo);
            const chartBuffer = await generateChartBuffer(history, info.maxPlayers);

            const files = [];
            if (chartBuffer) {
                files.push(new AttachmentBuilder(Buffer.from(chartBuffer), { name: "chart.png" }));
            }

            await message.edit({
                components: [createTrackedServerComponent(info, channel.guild.preferredLocale)],
                files,
                attachments: [],
                flags: MessageFlags.IsComponentsV2,
            });

            // tiny delay to strictly avoid rate limits
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (e) {
            logger.error(`Failed to update message for server ${server.ip}:${server.port}`, e);
        }
    }
}
