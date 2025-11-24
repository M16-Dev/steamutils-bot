import type { SteamPlayer } from "../types/steam.ts";
import {
    type APIActionRowComponent,
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithURL,
    type APIComponentInContainer,
    type APIContainerComponent,
    type APISectionComponent,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    type APIThumbnailComponent,
    type APIUnfurledMediaItem,
    ButtonStyle,
} from "discord.js";
import SteamID from "steamid";
import { config } from "../../config.ts";

export const steamProfileComponent = (player: SteamPlayer) => {
    const steamId = new SteamID(player.steamid);

    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `# [${player.personaname}](${player.profileurl})\n**Last online:** <t:${player.lastlogoff}:R>`,
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 11,
                    media: { url: player.avatar } satisfies APIUnfurledMediaItem,
                } satisfies APIThumbnailComponent,
            } satisfies APISectionComponent,
            { type: 14, spacing: 2 } satisfies APISeparatorComponent,
            { type: 10, content: `### SteamID64\n\`\`\`${player.steamid}\`\`\`` } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            { type: 10, content: `### SteamID32\n\`\`\`${steamId.steam2()}\`\`\`` } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            { type: 10, content: `### SteamID3\n\`\`\`${steamId.steam3()}\`\`\`` } satisfies APITextDisplayComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const steamConnectComponent = (code: string, text?: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: text?.replace("\\n", "\n") ?? "### Connect to the server!",
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${config.apiUrl}/connect/${code}`,
                    label: "Connect",
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const createConnectionPersonalComponent = (token: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: "# Link your accounts!",
                    } satisfies APITextDisplayComponent,
                ] satisfies APITextDisplayComponent[],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${config.apiUrl}/connections/create?token=${encodeURIComponent(token)}`,
                    label: "Link Accounts",
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
            {
                type: 10,
                content: `>>> You will be redirected to Steam login page to give us your public steam ID.
Link is valid for 10 minutes.
Don't share this link! It contains your private token!`,
            } satisfies APITextDisplayComponent,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};

export const createConnectionPublicComponent = () => {
    return {
        type: 17,
        components: [
            {
                type: 10,
                content: "# Link your accounts!",
            } satisfies APITextDisplayComponent,
            { type: 14 } satisfies APISeparatorComponent,
            {
                type: 10,
                content: ">>> **Link your Discord and Steam account.**\nClick the button below to generate your personal link.",
            } satisfies APITextDisplayComponent,
            { type: 14, divider: false, spacing: 2 } satisfies APISeparatorComponent,
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: ButtonStyle.Success,
                        custom_id: `create_connection_button`,
                        label: "Link Accounts",
                        emoji: { name: "🔗" },
                    } satisfies APIButtonComponentWithCustomId,
                ] satisfies APIButtonComponentWithCustomId[],
            } satisfies APIActionRowComponent<APIButtonComponentWithCustomId>,
        ] satisfies APIComponentInContainer[],
    } satisfies APIContainerComponent;
};
