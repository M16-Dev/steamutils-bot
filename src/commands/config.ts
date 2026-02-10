import type { Command } from "../types/command.ts";
import {
    type ChatInputCommandInteraction,
    MessageComponentInteraction,
    MessageFlags,
    PermissionFlagsBits,
    RoleSelectMenuInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { db } from "../services/db.ts";

const configComponent = async (interaction: ChatInputCommandInteraction) => {
    const verifiedRole = await db.getVerifiedRole(interaction.guildId as string);

    return {
        type: 17,
        components: [
            { type: 10, content: "# Config" },
            { type: 14 },
            {
                type: 10,
                content: "### Role for verified users",
            },
            {
                type: 1,
                components: [
                    {
                        type: 6,
                        placeholder: "Select a role or leave blank",
                        custom_id: "$config_verified_role",
                        min_values: 0,
                        max_values: 1,
                        default_values: verifiedRole ? [{ id: verifiedRole, type: "role" }] : [],
                    },
                ],
            },
        ],
    };
};

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configure bot settings")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        const response = await interaction.reply({
            components: [await configComponent(interaction)],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            withResponse: true,
        });

        if (!response.resource?.message) {
            await interaction.followUp({
                content: "An error occurred while handling the configuration menu. Please try again later.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        response.resource.message.createMessageComponentCollector({}).on("collect", async (componentInteraction: MessageComponentInteraction) => {
            switch (componentInteraction.customId) {
                case "$config_verified_role": {
                    const selectedRoleId = (componentInteraction as RoleSelectMenuInteraction).values[0];
                    db.setVerifiedRole(interaction.guildId as string, selectedRoleId);
                    break;
                }
            }
            await componentInteraction.deferUpdate();
        });
    },
} satisfies Command<ChatInputCommandInteraction>;
