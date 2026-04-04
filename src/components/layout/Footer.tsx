'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Linkedin, Twitter, Facebook, Send, MapPin, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import { useI18n } from '@/context/I18nContext';
import { createClient } from '@/lib/supabase/client';

export default function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
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

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/agent');
  if (isAdminRoute) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--noir)] text-white relative">
      {/* Gold accent bar */}
      <div className="h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--gold)] to-[var(--gold)]" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="Palais Rouge Immo" width={36} height={36} />
              <div>
                <div className="font-display text-lg font-bold leading-tight">Palais Rouge Immo</div>
                <div className="text-[10px] text-[var(--gold)] font-semibold tracking-[0.2em] uppercase">Marrakech</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: settings.instagram || 'https://instagram.com/palaisrougeimmo' },
                { icon: Linkedin, href: settings.linkedin || 'https://linkedin.com/company/palaisrougeimmo' },
                { icon: Twitter, href: settings.twitter || 'https://twitter.com/palaisrougeimmo' },
                { icon: Facebook, href: settings.facebook || 'https://facebook.com/palaisrougeimmo' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[var(--gold)] transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--gold)]">{t('footer.quickLinks')}</h4>
            <div className="space-y-2.5">
              {[
                { label: t('footer.allProperties'), href: '/properties' },
                { label: t('footer.forSale'), href: '/properties?listingType=BUY' },
                { label: t('footer.forRent'), href: '/properties?listingType=RENT' },
                { label: t('common.search'), href: '/search' },
              ].map((link, i) => (
                <Link key={i} href={link.href} className="block text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--gold)]">{t('footer.propertyTypes')}</h4>
            <div className="space-y-2.5">
              {[
                { label: t('property.house'), href: '/properties?propertyType=HOUSE' },
                { label: t('property.apartment'), href: '/properties?propertyType=APARTMENT' },
                { label: t('property.villa'), href: '/properties?propertyType=VILLA' },
                { label: t('property.commercial'), href: '/properties?propertyType=COMMERCIAL' },
                { label: t('property.land'), href: '/properties?propertyType=LAND' },
              ].map((link, i) => (
                <Link key={i} href={link.href} className="block text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company + Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-[var(--gold)]">{t('footer.company')}</h4>
            <div className="space-y-2.5 mb-6">
              {[
                { label: t('common.agents'), href: '/agents' },
                { label: t('common.contact'), href: '/contact' },
                { label: t('common.faq'), href: '/faq' },
                { label: t('nav.blog'), href: '/resources' },
                { label: t('footer.rentingGuide'), href: '/guide/renting' },
                { label: t('footer.sellingGuide'), href: '/guide/selling' },
              ].map((link, i) => (
                <Link key={i} href={link.href} className="block text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-sm text-white mb-1">{t('footer.newsletter')}</h4>
              <p className="text-xs text-gray-400">{t('footer.newsletterText')}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gold)] w-full md:w-64"
              />
              <button
                onClick={async () => {
                  if (!email || !email.includes('@')) return;
                  try {
                    await fetch('/api/newsletter', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                  } catch { /* optional */ }
                  setEmail('');
                }}
                className="px-4 py-2.5 bg-[var(--gold)] text-white rounded-lg hover:bg-[#9A7820] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
              {settings.agency_address || 'Bd Abdelkrim Al Khattabi, Marrakech 40000'}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
              {settings.agency_phone || '+212 524 43 00 00'}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--gold)]" />
              {settings.agency_email || 'contact@palaisrouge.online'}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {t('footer.copyright').replace('{year}', currentYear.toString())}
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">{t('footer.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
