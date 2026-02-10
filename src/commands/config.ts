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
import RateLimiter from "../utils/rateLimiter.ts";
import Client from "../services/backendClient.ts";
import { config } from "../../config.ts";

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
            { type: 14 },
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: "### Tokens",
                    },
                ],
                accessory: {
                    type: 2,
                    style: 2,
                    label: "Manage Tokens",
                    custom_id: "$manage_tokens",
                },
            },
        ],
    };
};

const tokensComponent = async (guildId: string) => {
    const res = await Client.api.v1.tokens[":guildId"].$get({ param: { guildId } });
    const tokens = await res.json();

    return {
        type: 17,
        components: [
            { type: 10, content: "# Manage Tokens" },
            { type: 14 },
            ...(tokens.length === 0 ? [{ type: 10, content: "You have no tokens." }] : tokens.map((token) => ({
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `\`${token}\``,
                    },
                ],
                accessory: {
                    type: 2,
                    style: 4,
                    label: "Delete",
                    custom_id: `$delete_token;${token}`,
                },
            }))),
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3,
                        label: tokens.length >= config.maxTokensPerGuild ? "Max Tokens Reached" : "Create New Token",
                        custom_id: "$create_token",
                        disabled: tokens.length >= config.maxTokensPerGuild,
                    },
                ],
            },
        ],
    };
};

const handleManageTokensInterface = async (interaction: MessageComponentInteraction) => {
    const response = await interaction.reply({
        components: [await tokensComponent(interaction.guildId as string)],
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

    response.resource.message.createMessageComponentCollector({
        filter: async (i) => !(await RateLimiter.handleRateLimit(i)),
    }).on("collect", async (componentInteraction: MessageComponentInteraction) => {
        const [action, token] = componentInteraction.customId.split(";");
        switch (action) {
            case "$delete_token": {
                const res = await Client.api.v1.tokens[":token"].$delete({ param: { token } });
                if (!res.ok) {
                    await componentInteraction.reply({
                        content: "Failed to delete token. Please try again later.",
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                await componentInteraction.update({ components: [await tokensComponent(interaction.guildId as string)] });
                break;
            }
            case "$create_token": {
                const res = await Client.api.v1.tokens.$post({ json: { guildId: interaction.guildId as string } });
                if (!res.ok) {
                    await componentInteraction.reply({
                        content: "Failed to create token. Please try again later.",
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                await componentInteraction.update({ components: [await tokensComponent(interaction.guildId as string)] });
                break;
            }
        }
    });
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

        response.resource.message.createMessageComponentCollector({
            filter: async (i) => !(await RateLimiter.handleRateLimit(i)),
        }).on("collect", async (componentInteraction: MessageComponentInteraction) => {
            switch (componentInteraction.customId) {
                case "$config_verified_role": {
                    const selectedRoleId = (componentInteraction as RoleSelectMenuInteraction).values[0];
                    db.setVerifiedRole(interaction.guildId as string, selectedRoleId);
                    await componentInteraction.deferUpdate();
                    break;
                }
                case "$manage_tokens": {
                    await handleManageTokensInterface(componentInteraction);
                    break;
                }
            }
        });
    },
} satisfies Command<ChatInputCommandInteraction>;
