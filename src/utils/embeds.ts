import type { SteamPlayer } from "../types/steam.ts";
import type { APIEmbed } from "discord.js";
import SteamID from "steamid";

export const steamProfileEmbed = (player: SteamPlayer) => {
    const steamId = new SteamID(player.steamid);
    return {
        url: player.profileurl,
        title: player.personaname,
        description: `Last online: <t:${player.lastlogoff}:R>`,
        thumbnail: { url: player.avatar },
        fields: [
            {
                name: "SteamID64",
                value: "```" + player.steamid + "```",
            },
            {
                name: "SteamID32",
                value: "```" + steamId.steam2() + "```",
            },
            {
                name: "SteamID3",
                value: "```" + steamId.steam3() + "```",
            },
        ],
    } satisfies APIEmbed;
};
