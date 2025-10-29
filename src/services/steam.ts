import { logger } from "../utils/logger.ts";
import SteamID from "steamid";
import type { SteamPlayer } from "../types/steam.ts";

export async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
    if (!vanityUrl || vanityUrl.trim() === "") {
        logger.warn("Empty vanity URL provided");
        return null;
    }

    const response = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${Deno.env.get("STEAM_API_KEY")}&vanityurl=${encodeURIComponent(vanityUrl)}`,
    );

    if (!response.ok) {
        logger.error(`Failed to resolve vanity URL:`, response.statusText);
        return null;
    }

    const data = await response.json();

    if (data.response.success !== 1) {
        logger.warn(`Vanity URL not found: ${vanityUrl}. ${data.response.message}`);
        return null;
    }

    return data.response.steamid;
}

export async function getPlayerSummary(steamId: string): Promise<SteamPlayer | null> {
    try {
        steamId = new SteamID(steamId).getSteamID64();
    } catch {
        logger.warn(`Invalid SteamID provided: ${steamId}`);
        return null;
    }

    const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${Deno.env.get("STEAM_API_KEY")}&steamids=${steamId}`,
    );

    if (!response.ok) {
        logger.error(`Failed to get player summary:`, response.statusText);
        return null;
    }

    const data = await response.json();
    return data.response.players[0] as SteamPlayer ?? null;
}
