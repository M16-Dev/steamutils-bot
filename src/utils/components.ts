import type { SteamPlayer } from "../types/steam.ts";
import type { APIContainerComponent } from "discord.js";
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
                    },
                ],
                accessory: {
                    type: 11,
                    media: { url: player.avatar },
                },
            },
            { type: 14, spacing: 2 },
            {
                type: 10,
                content: `### SteamID64\n\`\`\`${player.steamid}\`\`\``,
            },
            { type: 14 },
            {
                type: 10,
                content: `### SteamID32\n\`\`\`${steamId.steam2()}\`\`\``,
            },
            { type: 14 },
            {
                type: 10,
                content: `### SteamID3\n\`\`\`${steamId.steam3()}\`\`\``,
            },
        ],
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
                    },
                ],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${config.apiUrl}/connect/${code}`,
                    label: "Connect",
                },
            },
        ],
    } satisfies APIContainerComponent;
};
