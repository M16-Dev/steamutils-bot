import {
    APIButtonComponent,
    APIButtonComponentWithCustomId,
    APIContainerComponent,
    APISectionComponent,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags,
} from "discord.js";
import { Component } from "../../types/component.ts";
import client from "../../services/backendClient.ts";
import { t } from "../../utils/i18n.ts";

export default {
    customId: "delete_game_server_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        const [, code] = interaction.customId.split(";");

        const response = await client.api.v1.codes[":code"].$delete({ param: { code } });

        if (!response.ok) {
            await interaction.reply({
                content: t("steamConnect.error.delete", interaction.locale, { code }),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const container = interaction.message.components[0].toJSON() as APIContainerComponent;

        const section = container.components.find((comp) =>
            comp.type === 9 &&
            "custom_id" in comp.accessory &&
            comp.accessory.custom_id === interaction.customId
        ) as APISectionComponent | undefined;

        if (section) {
            (section.accessory as APIButtonComponent).disabled = true;
            (section.accessory as APIButtonComponent).style = ButtonStyle.Secondary;
            (section.accessory as APIButtonComponentWithCustomId).label = t("common.deleted", interaction.locale);
        }

        await interaction.update({
            components: [container],
        });
    },
} satisfies Component<ButtonInteraction>;
