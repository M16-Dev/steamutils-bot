import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createConnectionHandler, manageConnectionsHandler } from "../interactionHandlers/connectionsHandler.ts";
import { getLocalizations, t } from "../utils/i18n.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("connections")
        .setDescription(t("commands.connections.description", "en"))
        .setNameLocalizations(getLocalizations("commands.connections.name"))
        .setDescriptionLocalizations(getLocalizations("commands.connections.description"))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription(t("commands.connections.sub.create.description", "en"))
                .setNameLocalizations(getLocalizations("commands.connections.sub.create.name"))
                .setDescriptionLocalizations(getLocalizations("commands.connections.sub.create.description"))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("manage")
                .setDescription(t("commands.connections.sub.manage.description", "en"))
                .setNameLocalizations(getLocalizations("commands.connections.sub.manage.name"))
                .setDescriptionLocalizations(getLocalizations("commands.connections.sub.manage.description"))
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                await createConnectionHandler(interaction);
                return;
            case "manage":
                await manageConnectionsHandler(interaction);
                return;
            default:
                return;
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
