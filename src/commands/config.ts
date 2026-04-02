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
import { getLocalizations, t } from "../utils/i18n.ts";
import { configComponent, tokensComponent } from "../ui/config.ts";

const fetchTokens = async (guildId: string) => {
    const res = await Client.api.v1.tokens[":guildId"].$get({ param: { guildId } });
    return await res.json() as string[];
};

const handleManageTokensInterface = async (interaction: MessageComponentInteraction) => {
    const tokens = await fetchTokens(interaction.guildId as string);

    const response = await interaction.reply({
        components: [tokensComponent(tokens, interaction.locale)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        withResponse: true,
    });

    if (!response.resource?.message) {
        await interaction.followUp({
            content: t("common.error", interaction.locale),
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
                        content: t("config.tokensPanel.delete.error", interaction.locale),
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                const updatedTokens = await fetchTokens(interaction.guildId as string);
                await componentInteraction.update({ components: [tokensComponent(updatedTokens, interaction.locale)] });
                break;
            }
            case "$create_token": {
                const res = await Client.api.v1.tokens.$post({ json: { guildId: interaction.guildId as string } });
                if (!res.ok) {
                    await componentInteraction.reply({
                        content: t("config.tokensPanel.create.error", interaction.locale),
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                const updatedTokens = await fetchTokens(interaction.guildId as string);
                await componentInteraction.update({ components: [tokensComponent(updatedTokens, interaction.locale)] });
                break;
            }
        }
    });
};

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription(t("commands.config.description", "en"))
        .setNameLocalizations(getLocalizations("commands.config.name"))
        .setDescriptionLocalizations(getLocalizations("commands.config.description"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        const verifiedRole = await db.getVerifiedRole(interaction.guildId as string);
        const response = await interaction.reply({
            components: [configComponent(verifiedRole, interaction.locale)],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            withResponse: true,
        });

        if (!response.resource?.message) {
            await interaction.followUp({
                content: t("common.error", interaction.locale),
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
