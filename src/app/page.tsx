'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Search, Home, Building2, Castle, Landmark, Store, ArrowRight, Shield, Users, Award } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import PropertyCard from '@/components/property/PropertyCard';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { PropertyCardSkeleton, StatSkeleton } from '@/components/ui/Skeleton';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <div ref={ref} className="font-display text-4xl md:text-5xl font-bold text-[var(--gold)]">
      {count}{suffix}
    </div>
  );
}

export default function HomePage() {
  const { t, formatCurrency } = useI18n();
  const { properties, isLoading, getFeaturedProperties } = useProperties();
  const [listingType, setListingType] = useState<'BUY' | 'RENT'>('BUY');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ properties: 0, cities: 0, satisfaction: 98 });
  const [loadingStats, setLoadingStats] = useState(true);
  const featuredProperties = getFeaturedProperties();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true).eq('status', 'available'),
      supabase.from('properties').select('city').eq('is_published', true).eq('status', 'available'),
    ]).then(([{ count }, { data: cityData }]) => {
      const uniqueCities = new Set(cityData?.map((p: { city: string }) => p.city).filter(Boolean)).size;
      setStats({ properties: count ?? 0, cities: uniqueCities, satisfaction: 98 });
      setLoadingStats(false);
    });
  }, []);

  const propertyTypes = [
    { icon: Home, label: t('property.house'), type: 'HOUSE' },
    { icon: Building2, label: t('property.apartment'), type: 'APARTMENT' },
    { icon: Castle, label: t('property.villa'), type: 'VILLA' },
    { icon: Store, label: t('property.commercial'), type: 'COMMERCIAL' },
    { icon: Landmark, label: t('property.land'), type: 'LAND' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 md:px-8 overflow-hidden bg-[var(--parchment)]">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--rouge)] leading-tight mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-[var(--stone)] mb-8 max-w-lg">
                {t('hero.subtitle')}
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-luxury-lg p-2 max-w-xl">
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => setListingType('BUY')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      listingType === 'BUY'
                        ? 'bg-[var(--rouge)] text-white'
                        : 'text-[var(--stone)] hover:bg-[var(--parchment)]'
                    }`}
                  >
                    {t('common.buy')}
                  </button>
                  <button
                    onClick={() => setListingType('RENT')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      listingType === 'RENT'
                        ? 'bg-[var(--rouge)] text-white'
                        : 'text-[var(--stone)] hover:bg-[var(--parchment)]'
                    }`}
                  >
                    {t('common.rent')}
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-light)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('hero.searchPlaceholder')}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <Link
                    href={`/properties?listingType=${listingType}&q=${searchQuery}`}
                    className="px-6 py-3 bg-[var(--gold)] text-white rounded-xl hover:bg-[#9A7820] transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Hero Images */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="img-zoom h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600"
                    alt="Luxury villa"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="img-zoom h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"
                    alt="Modern apartment"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="img-zoom h-72 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"
                    alt="Luxury property"
                    width={600}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--rouge)] mb-4">
              {t('property.browseByType')}
            </h2>
            <div className="w-16 h-0.5 bg-[var(--gold)] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {propertyTypes.map((type, i) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/properties?propertyType=${type.type}`}
                    className="card-elegant p-6 flex flex-col items-center gap-3 text-center group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[var(--parchment)] flex items-center justify-center group-hover:bg-[var(--rouge)] transition-colors">
                      <Icon className="w-6 h-6 text-[var(--gold)] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-[var(--rouge)]">{type.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4 md:px-8 bg-[var(--parchment)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--rouge)] mb-4">
                {t('property.featuredProperties')}
              </h2>
              <div className="w-16 h-0.5 bg-[var(--gold)]" />
            </div>
            <Link
              href="/properties"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--gold)] hover:text-[#9A7820] transition-colors"
            >
              {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : featuredProperties.slice(0, 6).map((property, i) => (
                <PropertyCard key={property.id} property={property} index={i} />
              ))
            }
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/properties">
              <Button variant="outline">{t('common.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--rouge)] mb-4">
              {t('whyUs.title')}
            </h2>
            <div className="w-16 h-0.5 bg-[var(--gold)] mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('whyUs.curated'), desc: t('whyUs.curatedDesc') },
              { icon: Users, title: t('whyUs.expert'), desc: t('whyUs.expertDesc') },
              { icon: Award, title: t('whyUs.trusted'), desc: t('whyUs.trustedDesc') },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="card-elegant p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[var(--parchment)] flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-[var(--gold)]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[var(--rouge)] mb-3">{item.title}</h3>
                  <p className="text-sm text-[var(--stone)] leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 md:px-8 bg-[var(--rouge)] relative overflow-hidden">
        <div className="absolute inset-0 noise-subtle" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {loadingStats ? (
              [0, 1, 2].map(i => <StatSkeleton key={i} />)
            ) : (
              <>
                <div>
                  <AnimatedCounter end={stats.properties} suffix="+" />
                  <div className="text-white/70 text-sm mt-2">{t('hero.propertiesListed')}</div>
                </div>
                <div>
                  <AnimatedCounter end={stats.cities} suffix="" />
                  <div className="text-white/70 text-sm mt-2">{t('hero.citiesCovered')}</div>
                </div>
                <div>
                  <AnimatedCounter end={stats.satisfaction} suffix="%" />
                  <div className="text-white/70 text-sm mt-2">{t('hero.clientSatisfaction')}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-[var(--rouge-dark)] relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-white/70 mb-8">{t('cta.subtitle')}</p>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                {t('cta.button')} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
