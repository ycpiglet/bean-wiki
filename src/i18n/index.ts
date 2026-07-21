import { defaultLocale, type Locale } from "./config";
import { ko, type Dictionary } from "./messages/ko";
import { en } from "./messages/en";

const dictionaries: Record<Locale, Dictionary> = { ko, en };

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type { Locale, Dictionary };
export { defaultLocale, locales } from "./config";
