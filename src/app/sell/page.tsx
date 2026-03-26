'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Users, Clock, Send, CheckCircle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SellPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'Page Vendre' }),
      });
    } catch { /* email API optional */ }

    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const benefits = [
    { icon: TrendingUp, title: 'Estimation gratuite', desc: 'Obtenez une estimation précise de votre bien basée sur le marché actuel.' },
    { icon: Shield, title: 'Accompagnement complet', desc: 'De l\'estimation à la signature, nous gérons toutes les étapes.' },
    { icon: Users, title: 'Réseau d\'acheteurs', desc: 'Accédez à notre large base de données d\'acheteurs qualifiés.' },
    { icon: Clock, title: 'Vente rapide', desc: 'Nos propriétés se vendent en moyenne 40% plus vite que le marché.' },
  ];

  return (
    <div className="pt-32 pb-20 bg-[var(--parchment)] min-h-screen">
      {/* Hero */}
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-[var(--noir)] mb-4">{t('sell.title')}</h1>
            <p className="text-lg text-[var(--stone)] max-w-xl mx-auto">{t('sell.subtitle')}</p>
            <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
          </motion.div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="card-elegant p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-[var(--parchment)] flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-[var(--gold-light)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--noir)] mb-2">{item.title}</h3>
                    <p className="text-xs text-[var(--stone)] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
              <h2 className="font-display text-2xl font-bold text-[var(--noir)] mb-6 text-center">{t('sell.requestValuation')}</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-[var(--noir)] font-medium">{t('contact.success')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.name')}</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-luxury" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.phone')}</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-luxury" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.email')}</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-luxury" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.message')}</label>
                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-luxury min-h-[100px]" placeholder="Décrivez votre bien (type, surface, quartier, etc.)" required />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {t('sell.requestValuation')}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
