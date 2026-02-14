import i18next from "@i18next/i18next";
import pl from "../locales/pl.json" with { type: "json" };
import en from "../locales/en.json" with { type: "json" };

await i18next.init({
    fallbackLng: "en",
    resources: {
        en: { translation: en },
        pl: { translation: pl },
    },
    interpolation: {
        escapeValue: false,
    },
});

export function t(key: string, locale: string, variables = {}): string {
    const lang = locale.split("-")[0];
    return i18next.t(key, { lng: lang, ...variables }) as string;
}
