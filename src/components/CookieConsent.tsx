'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

export default function CookieConsent() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        preferences: true,
        timestamp: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
        preferences: false,
        timestamp: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md bg-[var(--white)] rounded-xl shadow-luxury-lg border border-[var(--border)] p-5 z-50"
        >
          <button
            onClick={handleDecline}
            className="absolute top-3 right-3 text-[var(--stone)] hover:text-[var(--noir)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--parchment)] shrink-0">
              <Shield className="w-5 h-5 text-[var(--gold-light)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--noir)] mb-1">{t('cookie.title')}</h3>
              <p className="text-xs text-[var(--stone)] leading-relaxed">{t('cookie.message')}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--noir)] border border-[var(--border)] rounded-lg hover:bg-[var(--parchment)] transition-colors cursor-pointer"
            >
              {t('cookie.decline')}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--white)] bg-[var(--noir)] rounded-lg hover:bg-[var(--rouge)] transition-colors cursor-pointer"
            >
              {t('cookie.accept')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
