import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    // deno-lint-ignore no-explicit-any
    execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
}
