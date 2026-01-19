import { Bot } from "./bot.ts";
import { logger } from "./utils/logger.ts";
import { startApiServer } from "./services/api.ts";

const bot = new Bot();

try {
    startApiServer(bot);

    await bot.start();
} catch (error) {
    logger.error("Failed to start bot", error);
    Deno.exit(1);
}
