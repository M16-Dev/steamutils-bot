import { z } from "zod";

const rawConfig = {
    token: Deno.env.get("TOKEN") as string | undefined,
    clientId: Deno.env.get("CLIENT_ID") as string | undefined,
    guildId: Deno.env.get("GUILD_ID") as string | undefined,
    apiKey: Deno.env.get("API_KEY") as string | undefined,
    apiUrl: Deno.env.get("API_URL") as string | undefined,
    steamApiKey: Deno.env.get("STEAM_API_KEY") as string | undefined,
};

const ConfigSchema = z.object({
    token: z.string(),
    clientId: z.string().regex(/^\d+$/),
    guildId: z.string().regex(/^\d+$/).optional().nullable(),
    apiKey: z.string(),
    apiUrl: z.string().url().regex(/^https?:\/\/.+/),
    steamApiKey: z.string(),
});

const parseResult = ConfigSchema.safeParse(rawConfig);
if (!parseResult.success) {
    console.error("❌ CRITICAL ERROR: Invalid or missing configuration:");
    console.error(parseResult.error.format());
    Deno.exit(1);
}

export const config = parseResult.data;
export default config;
