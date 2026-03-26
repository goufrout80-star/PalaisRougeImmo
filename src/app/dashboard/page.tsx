'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Heart, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function UserDashboardPage() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return <div className="pt-32 min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-light)]" /></div>;
  }

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-[var(--noir)] mb-2">{t('dashboard.title')}</h1>
          <p className="text-[var(--stone)] mb-8">{t('dashboard.welcome')}, {user.name}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Heart, label: t('dashboard.savedProperties'), value: '0', color: 'text-red-500' },
            { icon: MessageSquare, label: t('dashboard.inquiries'), value: '0', color: 'text-blue-500' },
            { icon: Clock, label: t('dashboard.recentActivity'), value: '0', color: 'text-orange-500' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-elegant p-6 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--parchment)] flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--noir)]">{stat.value}</div>
                  <div className="text-xs text-[var(--stone)]">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] p-12 text-center">
          <Home className="w-12 h-12 text-[var(--muted-light)] mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-[var(--noir)] mb-2">Commencez votre recherche</h3>
          <p className="text-sm text-[var(--stone)] mb-6">Parcourez nos propriétés et sauvegardez vos favoris.</p>
          <Link href="/properties">
            <Button>{t('common.properties')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
