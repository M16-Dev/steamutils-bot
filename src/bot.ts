import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Command } from "./types/command.ts";
import type { Component } from "./types/component.ts";
import { loadCommands } from "./loaders/command-loader.ts";
import { loadEvents } from "./loaders/event-loader.ts";
import { loadComponents } from "./loaders/component-loader.ts";
import { logger } from "./utils/logger.ts";
import { config } from "../config.ts";

export class Bot extends Client {
    public commands: Collection<string, Command>;
    public components: Collection<string, Component>;

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds] });

        this.commands = new Collection();
        this.components = new Collection();
    }

    async initialize(): Promise<void> {
        logger.info("Initializing bot...");

        this.commands = await loadCommands();
        this.components = await loadComponents();
        await loadEvents(this);

        logger.success("Bot initialized successfully");
    }

    async start(): Promise<void> {
        await this.initialize();

        await this.login(config.token);
    }
}
