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
import { config } from "../../../config.ts";

export default {
    customId: "delete_game_server_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        const [, code] = interaction.customId.split(";");

        const response = await fetch(`${config.apiUrl}/api/v1/codes/${code}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.apiKey}`,
            },
        });

        if (!response.ok) {
            await interaction.reply({
                content: `Failed to delete server code [\`${code}\`] and related resources. Please try again later.`,
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
            (section.accessory as APIButtonComponentWithCustomId).label = "Deleted";
        }

        await interaction.update({
            components: [container],
        });
    },
} satisfies Component<ButtonInteraction>;
