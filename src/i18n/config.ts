// Locale configuration. Korean is the only populated locale today; adding a
// locale means adding a messages/<locale>.ts dictionary and (per docs/I18N.md)
// wiring the [lang] routing + per-locale content. See docs/I18N.md.
export const locales = ["ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";
