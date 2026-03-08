import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { createServerTrackerHandler, manageServerTrackerHandler } from "../interactionHandlers/serverTrackerHandler.ts";
import { getLocalizations, t } from "../utils/i18n.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("servertracker")
        .setDescription(t("commands.servertracker.description", "en"))
        .setNameLocalizations(getLocalizations("commands.servertracker.name"))
        .setDescriptionLocalizations(getLocalizations("commands.servertracker.description"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription(t("commands.servertracker.sub.create.description", "en"))
                .setNameLocalizations(getLocalizations("commands.servertracker.sub.create.name"))
                .setDescriptionLocalizations(getLocalizations("commands.servertracker.sub.create.description"))
                .addStringOption((option) =>
                    option
                        .setName("ip")
                        .setDescription(t("commands.servertracker.sub.create.opt.ip.description", "en"))
                        .setNameLocalizations(getLocalizations("commands.servertracker.sub.create.opt.ip.name"))
                        .setDescriptionLocalizations(getLocalizations("commands.servertracker.sub.create.opt.ip.description"))
                        .setRequired(true)
                )
                .addNumberOption((option) =>
                    option
                        .setName("port")
                        .setDescription(t("commands.servertracker.sub.create.opt.port.description", "en"))
                        .setNameLocalizations(getLocalizations("commands.servertracker.sub.create.opt.port.name"))
                        .setDescriptionLocalizations(getLocalizations("commands.servertracker.sub.create.opt.port.description"))
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("manage")
                .setDescription(t("commands.servertracker.sub.manage.description", "en"))
                .setNameLocalizations(getLocalizations("commands.servertracker.sub.manage.name"))
                .setDescriptionLocalizations(getLocalizations("commands.servertracker.sub.manage.description"))
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                await createServerTrackerHandler(interaction);
                return;
            case "manage":
                await manageServerTrackerHandler(interaction);
                return;
            default:
                return;
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
