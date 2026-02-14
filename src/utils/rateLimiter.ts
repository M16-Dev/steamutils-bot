import { Collection, CommandInteraction, MessageComponentInteraction, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { config } from "../../config.ts";
import { t } from "./i18n.ts";

type RepliableInteraction = MessageComponentInteraction | ModalSubmitInteraction | CommandInteraction;

class RateLimiter {
    private history: Collection<string, number[]> = new Collection();
    private windowSize: number;
    private maxRequests: number;

    constructor(windowSize: number, maxRequests: number, cleanupInterval: number = 5 * 60 * 1000) {
        this.windowSize = windowSize;
        this.maxRequests = maxRequests;

        setInterval(() => this.clearOldEntries(), cleanupInterval);
    }

    async handleRateLimit(interaction: RepliableInteraction): Promise<boolean> {
        const rateLimit = this.isRateLimited(interaction.user.id);
        if (rateLimit.limited) {
            await this.replyWithRateLimitInfo(interaction, rateLimit.retryTimestamp!);
            return true;
        }
        return false;
    }

    isRateLimited(userId: string, addToHistory: boolean = true): { limited: boolean; retryTimestamp?: number } {
        const userHistory = this.getUserHistory(userId);
        if (userHistory.length >= this.maxRequests) {
            const retryTimestamp = Math.ceil((userHistory[0] + this.windowSize) / 1000);
            return { limited: true, retryTimestamp };
        }
        if (addToHistory) {
            userHistory.push(Date.now());
            this.history.set(userId, userHistory);
        }
        return { limited: false };
    }

    async replyWithRateLimitInfo(interaction: RepliableInteraction, retryTimestamp: number) {
        await interaction.reply({
            content: t("rateLimit.exceeded", interaction.locale, { retryTimestamp }),
            flags: MessageFlags.Ephemeral,
        });
    }

    clearOldEntries() {
        const now = Date.now();
        const windowStart = now - this.windowSize;
        this.history.sweep((timestamps) => timestamps[timestamps.length - 1] < windowStart);
    }

    private getUserHistory(userId: string): number[] {
        const now = Date.now();
        const windowStart = now - this.windowSize;
        const userHistory = this.history.get(userId) || [];
        if (userHistory.length > 0 && userHistory[0] < windowStart) {
            return userHistory.filter((timestamp) => timestamp > windowStart);
        }
        return userHistory;
    }
}

export default new RateLimiter(config.rateLimitWindow, config.rateLimitMax);
