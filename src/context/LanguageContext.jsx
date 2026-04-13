import React, { createContext, useState, useContext, useEffect } from 'react';
import { ru } from '../locales/ru';
import { kz } from '../locales/kz';
import { en } from '../locales/en';

const LanguageContext = createContext({
  language: 'ru',
  setLanguage: () => {},
  t: (key) => key
});

const translations = { ru, kz, en };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('appLang') || 'ru');

  useEffect(() => {
    localStorage.setItem('appLang', language);
  }, [language]);

  const t = (key) => {
    const translationSet = translations[language] || translations['ru'];
    return translationSet[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
