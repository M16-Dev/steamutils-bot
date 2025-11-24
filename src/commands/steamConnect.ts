import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command.ts";
import { steamConnectComponent } from "../utils/components.ts";
import { config } from "../../config.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("steamconnect")
        .setDescription("Creates a Steam connect button for your server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("ip")
                .setDescription("The IP of your server")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("port")
                .setDescription("The port number of the server")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("password")
                .setDescription("The password for the server (if any)")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("Custom label next to the button. Psst... you can use markdown here!")
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const ip = interaction.options.getString("ip", true);
        const port = interaction.options.getInteger("port", true);
        const password = interaction.options.getString("password", false);
        const text = interaction.options.getString("text", false) ?? undefined;
        const res = await fetch(`${config.apiUrl}/codes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({ guildId: interaction.guildId, ip, port, password }),
        });
        const data = await res.json();

        if (res.status === 400) {
            await interaction.reply({
                content: `❌ Provided data is invalid.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (res.status === 402) {
            await interaction.reply({
                content: `❌ ${data.error}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!res.ok) {
            await interaction.reply({
                content: "❌ Failed to create connect code. Please try again later.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.reply({
            components: [steamConnectComponent(data.code, text)],
            flags: MessageFlags.IsComponentsV2,
        });
    },
} satisfies Command<ChatInputCommandInteraction>;
