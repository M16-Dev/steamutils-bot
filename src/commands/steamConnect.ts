import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command.ts";
import { createSteamConnectHandler, manageSteamConnectHandler } from "../interactionHandlers/steamConnectHandler.ts";
import { getLocalizations, t } from "../utils/i18n.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("steamconnect")
        .setDescription(t("commands.steamconnect.description", "en"))
        .setNameLocalizations(getLocalizations("commands.steamconnect.name"))
        .setDescriptionLocalizations(getLocalizations("commands.steamconnect.description"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription(t("commands.steamconnect.sub.create.description", "en"))
                .setNameLocalizations(getLocalizations("commands.steamconnect.sub.create.name"))
                .setDescriptionLocalizations(getLocalizations("commands.steamconnect.sub.create.description"))
                .addStringOption((option) =>
                    option
                        .setName("ip")
                        .setDescription(t("commands.steamconnect.sub.create.opt.ip.description", "en"))
                        .setNameLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.ip.name"))
                        .setDescriptionLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.ip.description"))
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("port")
                        .setDescription(t("commands.steamconnect.sub.create.opt.port.description", "en"))
                        .setNameLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.port.name"))
                        .setDescriptionLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.port.description"))
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("password")
                        .setDescription(t("commands.steamconnect.sub.create.opt.password.description", "en"))
                        .setNameLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.password.name"))
                        .setDescriptionLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.password.description"))
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription(t("commands.steamconnect.sub.create.opt.text.description", "en"))
                        .setNameLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.text.name"))
                        .setDescriptionLocalizations(getLocalizations("commands.steamconnect.sub.create.opt.text.description"))
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("manage")
                .setDescription(t("commands.steamconnect.sub.manage.description", "en"))
                .setNameLocalizations(getLocalizations("commands.steamconnect.sub.manage.name"))
                .setDescriptionLocalizations(getLocalizations("commands.steamconnect.sub.manage.description"))
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                await createSteamConnectHandler(interaction);
                break;
            case "manage":
                await manageSteamConnectHandler(interaction);
                break;
            default:
                return;
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
