import type { CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface Command<T extends CommandInteraction = CommandInteraction> {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | ContextMenuCommandBuilder;
    execute: (interaction: T) => Promise<void>;
}
