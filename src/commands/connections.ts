import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createConnectionHandler } from "../interactionHandlers/connectionsHandler.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("connections")
        .setDescription("Manage your linked accounts")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Link your Discord account with your Steam account")
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                await createConnectionHandler(interaction);
                return;
            default:
                return;
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
