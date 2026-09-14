// ============================================================================
//  I18N CONFIG
// ============================================================================

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'mg'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'fr';

export const LANGUAGE_STORAGE_KEY = 'odc-language';

export const LANGUAGES_METADATA: Record<Language, { label: string; flag: string; native: string }> = {
  fr: { label: 'Français', flag: '🇫🇷', native: 'Français' },
  en: { label: 'English', flag: '🇬🇧', native: 'English' },
  mg: { label: 'Malagasy', flag: '🇲🇬', native: 'Malagasy' },
};

export function isSupportedLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) return stored;
    return DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function getBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const browserLang = navigator.language.split('-')[0];
  return isSupportedLanguage(browserLang) ? browserLang : DEFAULT_LANGUAGE;
}