import { Bot } from "../bot.ts";
import { config } from "../../config.ts";
import { logger } from "../utils/logger.ts";

export function startApiServer(bot: Bot) {
    Deno.serve({ port: config.internalApiPort, onListen: () => {} }, async (req) => {
        const url = new URL(req.url);

        const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (authHeader !== config.internalApiKey) {
            return new Response("Unauthorized", { status: 401 });
        }

        return new Response("Not Found", { status: 404 });
    });

    logger.info(`Internal API server listening on port ${config.internalApiPort}`);
}
