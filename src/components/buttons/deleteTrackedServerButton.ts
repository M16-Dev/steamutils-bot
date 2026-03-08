import { APIButtonComponent, APIButtonComponentWithCustomId, APIContainerComponent, APISectionComponent, ButtonInteraction, ButtonStyle } from "discord.js";
import { Component } from "../../types/component.ts";
import { t } from "../../utils/i18n.ts";
import { db } from "../../services/db.ts";

export default {
    customId: "delete_tracked_server_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        const [, channelId, messageId] = interaction.customId.split(";");

        await db.untrackServer(interaction.guildId!, messageId);

        const channel = await interaction.guild?.channels.fetch(channelId);
        if (channel?.isTextBased()) {
            const message = await channel.messages.fetch(messageId);
            await message.delete().catch(() => {/* Ignore errors */});
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
