import { type APIContainerComponent } from "discord.js";
import { config } from "../../config.ts";
import { t } from "../utils/i18n.ts";

export const configComponent = (verifiedRole: string | undefined, locale: string) => {
    return {
        type: 17,
        components: [
            { type: 10, content: `# ${t("config.header", locale)}` },
            { type: 14 },
            {
                type: 10,
                content: `### ${t("config.verifiedRole.header", locale)}`,
            },
            {
                type: 1,
                components: [
                    {
                        type: 6,
                        placeholder: t("config.verifiedRole.placeholder", locale),
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
                        content: `### ${t("config.tokens.header", locale)}`,
                    },
                ],
                accessory: {
                    type: 2,
                    style: 2,
                    label: t("config.tokensPanel.buttonLabel", locale),
                    custom_id: "$manage_tokens",
                },
            },
        ],
    };
};

export const tokensComponent = (tokens: string[], locale: string) => {
    return {
        type: 17,
        components: [
            { type: 10, content: `# ${t("config.tokensPanel.header", locale)}` },
            { type: 14 },
            ...(tokens.length === 0 ? [{ type: 10, content: t("config.tokensPanel.noTokens", locale) }] : tokens.map((token) => ({
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
                    label: t("common.delete", locale),
                    custom_id: `$delete_token;${token}`,
                },
            }))),
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3,
                        label: tokens.length >= config.maxTokensPerGuild
                            ? t("config.tokensPanel.create.disabled", locale)
                            : t("config.tokensPanel.create.label", locale),
                        custom_id: "$create_token",
                        disabled: tokens.length >= config.maxTokensPerGuild,
                    },
                ],
            },
        ],
    } satisfies APIContainerComponent;
};
