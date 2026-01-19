const kv = await Deno.openKv();

export interface GuildConfig {
    verifiedRoleId?: string;
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
};
