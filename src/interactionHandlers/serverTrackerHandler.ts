import { AttachmentBuilder, ChatInputCommandInteraction, MessageFlags, TextChannel } from "discord.js";
import { Buffer } from "node:buffer";
import { db } from "../services/db.ts";
import { querySteamServer } from "../services/serverQuery.ts";
import { generateChartBuffer } from "../services/chart.ts";
import { createTrackedServerComponent, manageTrackedServersComponent } from "../ui/serverTracker.ts";
import { t } from "../utils/i18n.ts";
import { logger } from "../utils/logger.ts";

export const createServerTrackerHandler = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const channel = interaction.channel;
    if (!channel || !(channel instanceof TextChannel)) {
        await interaction.editReply(t("common.error", interaction.locale));
        return;
    }

    const ip = interaction.options.getString("ip", true);
    const port = interaction.options.getNumber("port", true);

    const currentSettings = await db.getTrackedServersForGuild(interaction.guildId!);
    if (currentSettings.some((s) => s.ip === ip && s.port === port)) {
        await interaction.editReply(t("serverTracker.create.alreadyTracked", interaction.locale));
        return;
    }

    const limit = 2;
    if (currentSettings.length >= limit) {
        await interaction.editReply(t("serverTracker.create.limitReached", interaction.locale, { limit }));
        return;
    }

    const serverInfo = await querySteamServer(ip, port);

    if (!serverInfo || serverInfo.name === "Offline") {
        await interaction.editReply(t("serverTracker.create.error", interaction.locale));
        return;
    }

    const chartBuffer = await generateChartBuffer([], serverInfo.maxPlayers);
    const files = [];
    if (chartBuffer) {
        files.push(new AttachmentBuilder(Buffer.from(chartBuffer), { name: "chart.png" }));
    }

    const message = await channel.send({
        components: [createTrackedServerComponent(serverInfo, interaction.locale)],
        files,
        flags: MessageFlags.IsComponentsV2,
    });

    await interaction.editReply(t("serverTracker.create.success", interaction.locale, { ip, port }));

    await db.trackServer({
        guildId: interaction.guildId!,
        channelId: interaction.channelId,
        messageId: message.id,
        ip: ip,
        port: port,
    });

    logger.info(`Started tracking server ${ip}:${port} for guild ${interaction.guildId}`);
};

export const manageServerTrackerHandler = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const servers = await db.getTrackedServersForGuild(interaction.guildId!);

    await interaction.reply({
        components: [await manageTrackedServersComponent(interaction, servers)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
