export interface Locale {
  code: string;
  label: string;
  direction: "ltr" | "rtl";
}

export type TranslationDict = Record<string, string>;

export type Translations = Record<string, TranslationDict>;

export const SUPPORTED_LOCALES: Locale[] = [
  { code: "en", label: "English", direction: "ltr" },
  { code: "ar", label: "العربية", direction: "rtl" },
];

export const DEFAULT_LOCALE = "en";
