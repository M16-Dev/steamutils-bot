import type { SteamPlayer } from "../types/steam.ts";
import {
    type APIComponentInContainer,
    type APIContainerComponent,
    type APISectionComponent,
    type APISeparatorComponent,
    type APITextDisplayComponent,
    type APIThumbnailComponent,
    type APIUnfurledMediaItem,
} from "discord.js";
import SteamID from "steamid";
import { t } from "../utils/i18n.ts";

export const steamProfileComponent = (player: SteamPlayer, discordId: string | null, locale: string) => {
    const steamId = new SteamID(player.steamid);

    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `# [${player.personaname}](${player.profileurl})\n**${t("steamInfo.lastOnline.header", locale)}:** ${
                            player.lastlogoff ? `<t:${player.lastlogoff}:R>` : t("steamInfo.lastOnline.unknown", locale)
                        }\n**Discord:** ${discordId ? `<@${discordId}>` : t("steamInfo.discord.notLinked", locale)}`,
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