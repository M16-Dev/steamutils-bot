import i18next from "@i18next/i18next";
import pl from "../locales/pl.json" with { type: "json" };
import en from "../locales/en.json" with { type: "json" };
import de from "../locales/de.json" with { type: "json" };

await i18next.init({
    fallbackLng: "en",
    resources: {
        en: { translation: en },
        pl: { translation: pl },
        de: { translation: de },
    },
    interpolation: {
        escapeValue: false,
    },
});

export function t(key: string, locale: string, variables = {}): string {
    const lang = locale.split("-")[0];
    return i18next.t(key, { lng: lang, ...variables }) as string;
}

const supportedLocales: Record<string, string[]> = {
    "en": ["en-US", "en-GB"],
    "pl": ["pl"],
    "de": ["de"],
};

export function getLocalizations(key: string): Record<string, string> {
    const localizations: Record<string, string> = {};

    for (const [lang, locales] of Object.entries(supportedLocales)) {
        const value = i18next.t(key, { lng: lang });
        if (value && value !== key) {
            for (const locale of locales) {
                localizations[locale] = value;
            }
        }
    }

    return localizations;
}
