import { REST, Routes } from "discord.js";
import { loadCommands } from "./loaders/command-loader.ts";
import { logger } from "./utils/logger.ts";
import { config } from "../config.ts";

logger.info("Loading commands...");
const commands = await loadCommands();
const commandsData = commands.map((command) => command.data.toJSON());
const rest = new REST().setToken(config.token);

try {
    console.log("Deploying commands...");
    if (config.guildId) {
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commandsData });
        console.log(`Deployed to guild ${config.guildId}`);
    } else {
        await rest.put(Routes.applicationCommands(config.clientId), { body: commandsData });
        console.log("Deployed globally");
    }
} catch (error) {
    logger.error("Failed to deploy commands", error);
    Deno.exit(1);
}
