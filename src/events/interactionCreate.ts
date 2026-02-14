import type { Event } from "../types/event.ts";
import type { Bot } from "../bot.ts";
import { logger } from "../utils/logger.ts";
import { InteractionReplyOptions, MessageFlags, MessagePayload } from "discord.js";
import RateLimiter from "../utils/rateLimiter.ts";
import { t } from "../utils/i18n.ts";

export default {
    name: "interactionCreate",

    async execute(interaction) {
        const client = interaction.client as Bot;

        if (interaction.isChatInputCommand()) {
            if (await RateLimiter.handleRateLimit(interaction)) return;

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn(`Unknown command: ${interaction.commandName}`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}`, error);

                const errorMessage = {
                    content: t("interaction.commandError", interaction.locale),
                    flags: MessageFlags.Ephemeral,
                } satisfies string | MessagePayload | InteractionReplyOptions;

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } else if (interaction.isModalSubmit() || interaction.isMessageComponent()) {
            if (interaction.customId.startsWith("$")) return;

            if (await RateLimiter.handleRateLimit(interaction)) return;

            const customId = interaction.customId.split(";")[0];
            const component = client.components.get(customId);

            if (!component) {
                logger.warn(`Unknown component: ${customId}`);
                return;
            }

            try {
                await component.execute(interaction);
            } catch (error) {
                logger.error(`Error executing component ${customId}`, error);
            }
        }
    },
} satisfies Event<"interactionCreate">;
