import React, { createContext, useContext, useState, useEffect } from 'react';
import { INDIAN_LANGUAGES, LanguageInfo, DEFAULT_LANGUAGE } from '../i18n/languages';
import { translations, LanguageDictionary } from '../i18n/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  currentLanguage: LanguageInfo;
  availableLanguages: LanguageInfo[];
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'fintrack_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && INDIAN_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
      // Check browser navigator language
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      if (INDIAN_LANGUAGES.some((l) => l.code === browserLang)) {
        return browserLang;
      }
    } catch {
      // ignore
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLang: string) => {
    if (INDIAN_LANGUAGES.some((l) => l.code === newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // ignore
      }
    }
  };

  const currentLanguage =
    INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = currentLanguage.dir || 'ltr';
  }, [currentLanguage]);

  const t = (key: string, fallback?: string): string => {
    if (!key) return '';

    const currentLangDict = (translations[language] || {}) as Record<string, string>;
    const enDict = (translations['en'] || {}) as Record<string, string>;
    const hiDict = (translations['hi'] || {}) as Record<string, string>;

    // 1. Direct match in current language
    if (currentLangDict[key]) {
      return currentLangDict[key];
    }

    // 2. If key is in English dictionary, see if that English value exists in current language
    const enVal = enDict[key];
    if (enVal && currentLangDict[enVal]) {
      return currentLangDict[enVal];
    }

    // 3. Reverse lookup: if key is an English string, find its key in enDict, then check current language
    const foundEnKey = Object.keys(enDict).find((k) => enDict[k] === key);
    if (foundEnKey && currentLangDict[foundEnKey]) {
      return currentLangDict[foundEnKey];
    }

    // 4. Case-insensitive lookup in current language
    const lowerKey = key.toLowerCase();
    const caseMatchKey = Object.keys(currentLangDict).find(
      (k) => k.toLowerCase() === lowerKey
    );
    if (caseMatchKey && currentLangDict[caseMatchKey]) {
      return currentLangDict[caseMatchKey];
    }

    // 5. If language is not English or Hindi, try Hindi fallback for better Indian context
    if (language !== 'en' && language !== 'hi') {
      if (hiDict[key]) return hiDict[key];
      if (enVal && hiDict[enVal]) return hiDict[enVal];
      if (foundEnKey && hiDict[foundEnKey]) return hiDict[foundEnKey];
    }

    // 6. Return user fallback or English dictionary match or original key
    if (fallback !== undefined) return fallback;
    if (enDict[key]) return enDict[key];
    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguage,
        availableLanguages: INDIAN_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
