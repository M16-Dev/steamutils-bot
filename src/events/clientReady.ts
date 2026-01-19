import type { Event } from "../types/event.ts";
import { logger } from "../utils/logger.ts";

export default {
    name: "clientReady",
    once: true,
    execute(client) {
        logger.success(`Logged in as ${client.user.username}`);
        logger.info(`Ready in ${client.guilds.cache.size} guilds`);
    },
} satisfies Event<"clientReady">;
