'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import GoogleMap from '@/components/GoogleMap';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function ContactPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(({ key, value }: { key: string; value: string }) => { map[key] = value; });
        setSettings(map);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'Page Contact' }),
      });
    } catch (err) {
      console.warn('Contact API unavailable.');
    }

    setSubmitted(true);
    trackEvent('form_submit', 'lead', 'contact_form');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    { icon: MapPin, label: t('contact.address'), value: settings.agency_address || 'Bd Abdelkrim Al Khattabi, Marrakech 40000, Morocco' },
    { icon: Phone, label: t('contact.phone'), value: settings.agency_phone || '+212 524 43 00 00' },
    { icon: Mail, label: t('contact.email'), value: settings.agency_email || 'contact@palaisrouge.online' },
    { icon: Clock, label: t('contact.officeHours'), value: t('contact.officeHoursValue') },
  ];

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('contact.title')}</h1>
          <p className="text-[var(--stone)] max-w-lg mx-auto">{t('contact.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-[var(--noir)] mb-2">{t('contact.success')}</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.name')}</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-luxury"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.email')}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-luxury"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.phone')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-luxury"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">{t('contact.message')}</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-luxury min-h-[140px] resize-y"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {t('contact.send')}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="space-y-4">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <div key={i} className="card-elegant p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--parchment)] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[var(--gold-light)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--stone)] uppercase tracking-wider mb-1">{info.label}</div>
                      <div className="text-sm text-[var(--noir)]">{info.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map */}
            <div className="mt-6">
              <GoogleMap
                latitude={31.6295}
                longitude={-7.9811}
                address="Bd Abdelkrim Al Khattabi, Marrakech"
                className="h-64 w-full rounded-2xl border border-[var(--border)]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
