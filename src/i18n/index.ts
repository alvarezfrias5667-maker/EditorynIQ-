import { useState, useEffect } from 'react';
import { InterfaceLanguage } from '../domain/bookProjectTypes';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

export type TranslationDictionary = typeof en;

const dictionaries: Record<InterfaceLanguage, TranslationDictionary> = {
  en,
  es,
  fr,
};

const LANGUAGE_STORAGE_KEY = 'editoryniq_interface_language';

export function getStoredLanguage(): InterfaceLanguage {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as InterfaceLanguage;
  if (saved && ['en', 'es', 'fr'].includes(saved)) {
    return saved;
  }
  // Default to EN
  return 'en';
}

export function setStoredLanguage(lang: InterfaceLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent('editoryniq_language_change', { detail: lang }));
  }
}

export function useI18n() {
  const [lang, setLangState] = useState<InterfaceLanguage>(getStoredLanguage());

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<InterfaceLanguage>;
      if (customEvent.detail) {
        setLangState(customEvent.detail);
      }
    };

    window.addEventListener('editoryniq_language_change', handleLangChange);
    return () => {
      window.removeEventListener('editoryniq_language_change', handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang: InterfaceLanguage) => {
    setStoredLanguage(newLang);
    setLangState(newLang);
  };

  const t = dictionaries[lang] || dictionaries.en;

  return {
    lang,
    changeLanguage,
    t,
  };
}

/**
 * Utility function to nested key lookups (e.g. t['validation']['titleRequired'])
 */
export function getTranslationKey(dict: TranslationDictionary, keyPath: string): string {
  const parts = keyPath.split('.');
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return keyPath;
    }
  }
  return typeof current === 'string' ? current : keyPath;
}
