import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { create, getNumericDate } from "djwt";
import { createConnectionPersonalComponent } from "../utils/components.ts";
import { config } from "../../config.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
);

export const createConnectionHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
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
        components: [createConnectionPersonalComponent(token)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
