import { Bot } from "./bot.ts";
import { logger } from "./utils/logger.ts";
import { startApiServer } from "./services/api.ts";
import { startServerTasks } from "./services/serverTasks.ts";

const bot = new Bot();

try {
    await bot.start();

    startApiServer(bot);
    startServerTasks(bot);
} catch (error) {
    logger.error("Failed to start bot", error);
    Deno.exit(1);
}
