import { Command } from "../types/command.ts";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { create, getNumericDate } from "djwt";
import { config } from "../../config.ts";
import { linkAccountsComponent } from "../utils/components.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
);

export default {
    data: new SlashCommandBuilder()
        .setName("linkaccounts")
        .setDescription("Link your Discord account with your Steam account"),
    async execute(interaction) {
        const token = await create(
            { alg: "HS256", typ: "JWT" },
            {
                discordId: interaction.user.id,
                guildId: interaction.guildId,
                exp: getNumericDate(10 * 60),
            },
            key,
        );

        await interaction.reply({
            components: [linkAccountsComponent(token)],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
} satisfies Command<ChatInputCommandInteraction>;
