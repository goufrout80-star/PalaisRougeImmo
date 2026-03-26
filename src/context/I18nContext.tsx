'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fr from '@/locales/fr.json';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Language = 'fr' | 'en' | 'ar';
type Currency = 'MAD' | 'USD' | 'EUR';

interface I18nContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, from?: Currency, to?: Currency) => number;
  formatNumber: (num: number) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, unknown>> = { fr, en, ar };

const EXCHANGE_RATES: Record<string, number> = {
  'MAD_USD': 0.10,
  'MAD_EUR': 0.092,
  'USD_MAD': 10.0,
  'EUR_MAD': 10.87,
  'USD_EUR': 0.92,
  'EUR_USD': 1.087,
  'MAD_MAD': 1,
  'USD_USD': 1,
  'EUR_EUR': 1,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MAD: 'DH',
  USD: '$',
  EUR: '€',
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [currency, setCurrencyState] = useState<Currency>('MAD');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    const savedCurr = localStorage.getItem('currency') as Currency | null;
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) setLanguageState(savedLang);
    if (savedCurr && ['MAD', 'USD', 'EUR'].includes(savedCurr)) setCurrencyState(savedCurr);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[language] as Record<string, unknown>, key);
  }, [language]);

  const convertCurrency = useCallback((amount: number, from: Currency = 'MAD', to?: Currency): number => {
    const target = to || currency;
    if (from === target) return amount;
    const rate = EXCHANGE_RATES[`${from}_${target}`] || 1;
    return amount * rate;
  }, [currency]);

  const formatCurrency = useCallback((amount: number): string => {
    const converted = convertCurrency(amount, 'MAD', currency);
    const symbol = CURRENCY_SYMBOLS[currency];

    let rounded = converted;
    if (currency === 'MAD' && converted > 700) {
      rounded = Math.round(converted / 1000) * 1000;
    }

    const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-FR', {
      maximumFractionDigits: 0,
    }).format(rounded);

    if (currency === 'MAD') return `${formatted} ${symbol}`;
    return `${symbol}${formatted}`;
  }, [currency, language, convertCurrency]);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-FR').format(num);
  }, [language]);

  const isRTL = language === 'ar';

  return (
    <I18nContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        t,
        formatCurrency,
        convertCurrency,
        formatNumber,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
