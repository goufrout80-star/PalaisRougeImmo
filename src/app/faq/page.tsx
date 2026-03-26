'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { createClient } from '@/lib/supabase/client';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FaqPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqData, setFaqData] = useState<FaqItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('faq_items')
      .select('id, question, answer, category')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setFaqData(data ?? []);
      });
  }, []);

  const categories = [
    { key: '', label: t('common.all') },
    { key: 'buying', label: t('faq.categories.buying') },
    { key: 'selling', label: t('faq.categories.selling') },
    { key: 'renting', label: t('faq.categories.renting') },
    { key: 'working', label: t('faq.categories.working') },
  ];

  const filtered = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = !activeCategory || faq.category === activeCategory;
      const matchesSearch = !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqData, activeCategory, searchQuery]);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('faq.title')}</h1>
          <p className="text-[var(--stone)]">{t('faq.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-light)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('faq.searchPlaceholder')}
            className="input-luxury pl-11"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-[var(--noir)] text-white'
                  : 'bg-white border border-[var(--border)] text-[var(--stone)] hover:border-[var(--gold-light)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-[var(--border)] overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="font-medium text-[var(--noir)] pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-[var(--gold-light)] shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-5 text-sm text-[var(--charcoal)] leading-relaxed border-t border-[var(--border)] pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
