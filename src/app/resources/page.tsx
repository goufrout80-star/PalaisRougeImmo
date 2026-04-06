'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Send } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { createClient } from '@/lib/supabase/client';
import { BlogCardSkeleton } from '@/components/ui/Skeleton';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function ResourcesPage() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setBlogs(data ?? []);
        setLoadingBlogs(false);
      });
  }, []);

  const handleSubscribe = async () => {
    if (!newsletterEmail) return;
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newsletterEmail }),
    });
    setSubscribed(true);
    trackEvent('newsletter_subscribe', 'engagement');
  };

  const categories = ['Tous', ...Array.from(new Set(blogs.map(p => p.category).filter(Boolean)))];
  const filtered = activeCategory === 'Tous' ? blogs : blogs.filter(p => p.category === activeCategory);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('resources.title')}</h1>
          <p className="text-[var(--stone)]">{t('resources.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat ? 'bg-[var(--noir)] text-white' : 'bg-white border border-[var(--border)] text-[var(--stone)] hover:border-[var(--gold-light)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {loadingBlogs
            ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : filtered.length === 0
            ? <div className="col-span-3 text-center py-16 text-[var(--stone)]">Aucun article pour le moment.</div>
            : filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/resources/${post.slug}`} className="block card-elegant overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title_fr ?? ''}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-48 bg-[var(--linen)] flex flex-col items-center justify-center gap-2">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)] opacity-40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        <span className="text-xs text-[var(--muted)] opacity-60">Aucune image</span>
                      </div>
                    )}
                    {post.category && <span className="absolute top-3 left-3 px-2.5 py-1 bg-[var(--gold-light)] text-white text-xs font-medium rounded-md">{post.category}</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-[var(--noir)] mb-2 line-clamp-2 group-hover:text-[var(--gold-light)] transition-colors">{post.title_fr}</h3>
                    <p className="text-sm text-[var(--stone)] line-clamp-2 mb-4">{post.excerpt_fr}</p>
                    <div className="flex items-center justify-between text-xs text-[var(--charcoal)]">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.published_at ?? post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          }
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[var(--noir)] rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">{t('resources.newsletter')}</h2>
          <p className="text-white/60 mb-6">{t('resources.newsletterSubtitle')}</p>
          {subscribed ? (
            <p className="text-white text-sm font-medium">Merci pour votre inscription !</p>
          ) : (
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('resources.emailPlaceholder')}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--gold-light)]"
              />
              <button onClick={handleSubscribe} className="px-5 py-3 bg-[var(--gold-light)] text-white rounded-xl hover:bg-[#9A7820] transition-colors cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
