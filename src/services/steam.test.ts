import { assertEquals, assertExists } from "@std/assert";
import { getPlayerSummary, resolveVanityUrl } from "./steam.ts";

Deno.test("resolveVanityUrl - valid vanity name", async () => {
    const steamId = await resolveVanityUrl("gabelogannewell");
    assertExists(steamId);
});
Deno.test("resolveVanityUrl - invalid vanity name", async () => {
    const steamId = await resolveVanityUrl("this-vanity-url-definitely-does-not-exist-12345");
    assertEquals(steamId, null);
});
Deno.test("resolveVanityUrl - URL", async () => {
    const steamId = await resolveVanityUrl("https://steamcommunity.com/id/gabelogannewell");
    assertEquals(steamId, null);
});
Deno.test("resolveVanityUrl - invalid vanity URL", async () => {
    const steamId = await resolveVanityUrl(
        "https://steamcommunity.com/id/this-vanity-url-definitely-does-not-exist-12345",
    );
    assertEquals(steamId, null);
});
Deno.test("resolveVanityUrl - empty string", async () => {
    const steamId = await resolveVanityUrl("");
    assertEquals(steamId, null);
});
Deno.test("resolveVanityUrl - steamID", async () => {
    const steamId = await resolveVanityUrl("76561197960287930");
    assertEquals(steamId, null);
});

Deno.test("getPlayerSummary - valid steamID", async () => {
    const summary = await getPlayerSummary("76561197960287930");
    assertExists(summary);
    assertEquals(summary?.personaname, "Rabscuttle");
});
Deno.test("getPlayerSummary - non-existent steamID", async () => {
    const summary = await getPlayerSummary("1234567890");
    assertEquals(summary, null);
});
Deno.test("getPlayerSummary - invalid steamID", async () => {
    const summary = await getPlayerSummary("invalid-steamid-12345");
    assertEquals(summary, null);
});
Deno.test("getPlayerSummary - empty string", async () => {
    const summary = await getPlayerSummary("");
    assertEquals(summary, null);
});
