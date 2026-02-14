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
import { t } from "../utils/i18n.ts";

const PanelContentMapping: { [key: string]: (locale: string) => (APIContainerComponent | APITextDisplayComponent)[] } = {
    "connections_panel": (locale) => [createConnectionPublicComponent(locale)],
};

export default {
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription("Creates a new panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of panel to create")
                .setRequired(true)
                .setChoices(
                    { name: "Link Account Panel", value: "connections_panel" },
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
