import {
    APIButtonComponent,
    APIButtonComponentWithCustomId,
    APIContainerComponent,
    APISectionComponent,
    ButtonInteraction,
    ButtonStyle,
    GuildMemberRoleManager,
    MessageFlags,
} from "discord.js";
import { Component } from "../../types/component.ts";
import { db } from "../../services/db.ts";
import client from "../../services/backendClient.ts";

export default {
    customId: "delete_connection_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        const [, guildId] = interaction.customId.split(";");

        const response = await client.api.v1.connections.$delete({
            json: { discordId: interaction.user.id, guildId },
        });

        if (!response.ok) {
            await interaction.reply({
                content: `Failed to delete the connection. Please try again later.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const verifiedRoleId = await db.getVerifiedRole(guildId);
        if (verifiedRoleId && interaction.member?.roles instanceof GuildMemberRoleManager) {
            await interaction.member.roles.remove(verifiedRoleId).catch(() => {});
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
