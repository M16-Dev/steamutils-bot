import { ButtonInteraction } from "discord.js";
import { createConnectionHandler } from "../../interactionHandlers/connectionsHandler.ts";
import { Component } from "../../types/component.ts";

export default {
    customId: "create_connection_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        await createConnectionHandler(interaction);
    },
} satisfies Component<ButtonInteraction>;
