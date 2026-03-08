import { GameDig } from "gamedig";
import { logger } from "../utils/logger.ts";

export interface ServerInfo {
    name: string;
    map: string;
    players: number;
    maxPlayers: number;
    ping: number;
    tags?: string[];
    isOnline: boolean;
}

export async function querySteamServer(ip: string, port: number): Promise<ServerInfo | null> {
    try {
        const state = await GameDig.query({
            type: "csgo", // A2S_INFO suitable for generic steam servers, standard for Source/GoldSrc etc.
            host: ip,
            port: port,
            maxAttempts: 3,
            socketTimeout: 3000,
        });

        return {
            name: state.name ?? "Unknown Server",
            map: state.map ?? "Unknown Map",
            players: state.players.length ?? state.raw.numplayers ?? 0,
            maxPlayers: state.maxplayers ?? 0,
            ping: state.ping ?? 0,
            tags: state.raw.tags ? (Array.isArray(state.raw.tags) ? state.raw.tags : String(state.raw.tags).split(",")) : undefined,
            isOnline: true,
        };
    } catch (e) {
        logger.error(`Failed to query server ${ip}:${port}`, e);
        return {
            name: "Offline",
            map: "-",
            players: 0,
            maxPlayers: 0,
            ping: 0,
            isOnline: false,
        };
    }
}
