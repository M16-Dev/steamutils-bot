import type { MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

export type ComponentInteraction = MessageComponentInteraction | ModalSubmitInteraction;

export interface Component<T extends ComponentInteraction = ComponentInteraction> {
    customId: string;
    execute: (interaction: T) => Promise<void>;
}
