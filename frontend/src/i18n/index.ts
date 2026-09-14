import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_LANGUAGE,
  getBrowserLanguage,
  getStoredLanguage,
  setStoredLanguage,
  SUPPORTED_LANGUAGES,
} from './config';

import type { Language } from './config';

import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';
import mgTranslations from './locales/mg.json';

// ============================================================================
//  TRANSLATIONS
// ============================================================================

const translations: Record<Language, any> = {
  fr: frTranslations,
  en: enTranslations,
  mg: mgTranslations,
};

// ============================================================================
//  TYPES
// ============================================================================

type TranslationKey = string;

// ============================================================================
//  I18N HOOK
// ============================================================================

let currentLanguage: Language = getStoredLanguage();
const listeners = new Set<(lang: Language) => void>();

export function changeLanguage(lang: Language): void {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  currentLanguage = lang;
  setStoredLanguage(lang);
  listeners.forEach((listener) => listener(lang));
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(currentLanguage);

  useEffect(() => {
    const listener = (lang: Language) => setLanguage(lang);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const keys = key.split('.');
      let value: any = translations[language];

      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }

      if (typeof value === 'string') return value;
      if (fallback) return fallback;
      return key;
    },
    [language]
  );

  const tObject = useCallback(
    (key: string): any => {
      const keys = key.split('.');
      let value: any = translations[language];

      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }

      return value;
    },
    [language]
  );

  return {
    t,
    tObject,
    language,
    changeLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
  };
}

// ============================================================================
//  INIT
// ============================================================================

export function initializeI18n(): void {
  const stored = getStoredLanguage();
  const browser = getBrowserLanguage();
  currentLanguage = stored || browser || DEFAULT_LANGUAGE;
}

export default { useTranslation, changeLanguage, getCurrentLanguage, initializeI18n };