import { Collection } from "discord.js";
import type { Event } from "../types/event.ts";
import type { Bot } from "../bot.ts";
import { logger } from "../utils/logger.ts";
import { config } from "../../config.ts";

const rateLimitHistory = new Collection<string, number[]>();

// Periodically clear old rate limit data
setInterval(() => {
    const now = Date.now();
    const windowStart = now - config.rateLimitWindow;
    // Remove users whose latest interaction is older than the window
    rateLimitHistory.sweep((timestamps) => timestamps[timestamps.length - 1] < windowStart);
}, 5 * 60 * 1000);

export default {
    name: "interactionCreate",

    async execute(interaction) {
        const client = interaction.client as Bot;

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn(`Unknown command: ${interaction.commandName}`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}`, error);

                const errorMessage = "There was an error while executing this command!";

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: errorMessage,
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: errorMessage,
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isModalSubmit() || interaction.isMessageComponent()) {
            // Rate limiting
            const now = Date.now();
            const windowStart = now - config.rateLimitWindow;

            const userHistory = rateLimitHistory.get(interaction.user.id) || [];
            const recentInteractions = userHistory.filter((t) => t > windowStart);

            if (recentInteractions.length >= config.rateLimitMax) {
                const oldestInteraction = recentInteractions[0];
                const expirationTime = Math.round((oldestInteraction + config.rateLimitWindow) / 1000);

                await interaction.reply({
                    content: `You are interacting too fast! Please wait and try again <t:${expirationTime}:R>.`,
                    ephemeral: true,
                });
                return;
            }

            recentInteractions.push(now);
            rateLimitHistory.set(interaction.user.id, recentInteractions);

            // Handle interaction
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
