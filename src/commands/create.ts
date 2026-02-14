import {
    APIContainerComponent,
    APITextDisplayComponent,
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../types/command.ts";
import { createConnectionPublicComponent } from "../utils/components.ts";
import { getLocalizations, t } from "../utils/i18n.ts";

const PanelContentMapping: { [key: string]: (locale: string) => (APIContainerComponent | APITextDisplayComponent)[] } = {
    "connections_panel": (locale) => [createConnectionPublicComponent(locale)],
};

export default {
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription(t("commands.create.description", "en"))
        .setNameLocalizations(getLocalizations("commands.create.name"))
        .setDescriptionLocalizations(getLocalizations("commands.create.description"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription(t("commands.create.opt.type.description", "en"))
                .setNameLocalizations(getLocalizations("commands.create.opt.type.name"))
                .setDescriptionLocalizations(getLocalizations("commands.create.opt.type.description"))
                .setRequired(true)
                .setChoices(
                    {
                        name: t("commands.create.opt.type.choices.connectionsPanel", "en"),
                        value: "connections_panel",
                        name_localizations: getLocalizations("commands.create.opt.type.choices.connectionsPanel"),
                    },
                )
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const panelType = interaction.options.getString("type", true);

        if (!(interaction.channel instanceof BaseGuildTextChannel)) return;

        const components = PanelContentMapping[panelType](interaction.guildLocale ?? interaction.locale);
        if (components) {
            await interaction.channel.send({ components, flags: MessageFlags.IsComponentsV2 });
            await interaction.reply({
                content: t("common.panelCreate.success", interaction.locale),
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: t("common.panelCreate.error", interaction.locale),
                flags: MessageFlags.Ephemeral,
            });
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
