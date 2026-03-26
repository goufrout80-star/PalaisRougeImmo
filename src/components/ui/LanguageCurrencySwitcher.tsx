'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

const LANGUAGES = [
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'ar' as const, label: 'العربية', flag: '🇲🇦' },
];

const CURRENCIES = [
  { code: 'MAD' as const, label: 'MAD (DH)', symbol: 'DH' },
  { code: 'USD' as const, label: 'USD ($)', symbol: '$' },
  { code: 'EUR' as const, label: 'EUR (€)', symbol: '€' },
];

export default function LanguageCurrencySwitcher() {
  const { language, currency, setLanguage, setCurrency } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === language);
  const currentCurr = CURRENCIES.find(c => c.code === currency);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[var(--text-color)] hover:text-[var(--text-color)] text-xs transition-colors cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
        <span className="text-[var(--text-color-40)]">|</span>
        <span>{currentCurr?.symbol}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-[var(--background-color)] rounded-lg shadow-luxury-lg border border-[var(--border)] py-2 min-w-[180px] z-50 animate-scale-in">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--stone)] uppercase tracking-wider">
            Langue
          </div>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--parchment)] transition-colors flex items-center gap-2 cursor-pointer ${
                language === lang.code ? 'text-[var(--gold-light)] font-medium' : 'text-[var(--noir)]'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
          <div className="divider-elegant my-1" />
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--stone)] uppercase tracking-wider">
            Devise
          </div>
          {CURRENCIES.map(curr => (
            <button
              key={curr.code}
              onClick={() => { setCurrency(curr.code); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--parchment)] transition-colors cursor-pointer ${
                currency === curr.code ? 'text-[var(--gold-light)] font-medium' : 'text-[var(--noir)]'
              }`}
            >
              {curr.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
