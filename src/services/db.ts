const kv = await Deno.openKv();

export interface GuildConfig {
    verifiedRoleId?: string;
}

export interface TrackedServer {
    guildId: string;
    channelId: string;
    messageId: string;
    ip: string;
    port: number;
}

export interface ServerHistoryEntry {
    players: number;
    maxPlayers: number;
    timestamp: number;
}

export const db = {
    kv,

    async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
        const result = await kv.get<GuildConfig>(["guild_config", guildId]);
        return result.value;
    },

    async setVerifiedRole(guildId: string, roleId: string | undefined): Promise<void> {
        const config = await this.getGuildConfig(guildId) || {};
        config.verifiedRoleId = roleId;
        await kv.set(["guild_config", guildId], config);
    },

    async getVerifiedRole(guildId: string): Promise<string | undefined> {
        const config = await this.getGuildConfig(guildId);
        return config?.verifiedRoleId;
    },

    async trackServer(serverData: TrackedServer): Promise<void> {
        await kv.set(["tracked_servers", serverData.guildId, serverData.messageId], serverData);
    },

    async untrackServer(guildId: string, messageId: string): Promise<void> {
        await kv.delete(["tracked_servers", guildId, messageId]);
    },

    async getAllTrackedServers(): Promise<TrackedServer[]> {
        const servers: TrackedServer[] = [];
        const entries = kv.list<TrackedServer>({ prefix: ["tracked_servers"] });
        for await (const entry of entries) {
            servers.push(entry.value);
        }
        return servers;
    },

    async getTrackedServersForGuild(guildId: string): Promise<TrackedServer[]> {
        const servers: TrackedServer[] = [];
        const entries = kv.list<TrackedServer>({ prefix: ["tracked_servers", guildId] });
        for await (const entry of entries) {
            servers.push(entry.value);
        }
        return servers;
    },

    async addServerHistory(ip: string, port: number, players: number, maxPlayers: number): Promise<void> {
        const timestamp = Date.now();
        await kv.set(["server_history", `${ip}:${port}`, timestamp], { players, maxPlayers, timestamp });

        // Cleanup old history > 24h
        const oldTimestamp = timestamp - (24 * 60 * 60 * 1000);
        const entries = kv.list({ prefix: ["server_history", `${ip}:${port}`], end: ["server_history", `${ip}:${port}`, oldTimestamp] });
        for await (const entry of entries) {
            await kv.delete(entry.key);
        }
    },

    async getServerHistory(ip: string, port: number, sinceTimestamp: number): Promise<ServerHistoryEntry[]> {
        const history: ServerHistoryEntry[] = [];
        const entries = kv.list<ServerHistoryEntry>({
            prefix: ["server_history", `${ip}:${port}`],
            start: ["server_history", `${ip}:${port}`, sinceTimestamp],
        });
        for await (const entry of entries) {
            history.push(entry.value);
        }
        return history;
    },
};
