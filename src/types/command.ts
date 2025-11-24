import type {
    CommandInteraction,
    ContextMenuCommandBuilder,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command<T extends CommandInteraction = CommandInteraction> {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: T) => Promise<void>;
}
