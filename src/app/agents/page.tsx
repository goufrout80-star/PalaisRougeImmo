'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface AgentProfile {
  id: string;
  full_name: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default function AgentsPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('agent_profiles')
      .select('id, full_name, phone, bio, avatar_url')
      .then(({ data }) => {
        setAgents(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = agents.filter(agent =>
    agent.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('agents.title')}</h1>
          <p className="text-[var(--stone)]">{t('agents.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-light)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('agents.searchPlaceholder')}
            className="input-luxury pl-11"
          />
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--linen)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--linen)] rounded w-3/4" />
                    <div className="h-3 bg-[var(--linen)] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--stone)]">{t('common.noResults')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((agent, i) => {
              const initials = agent.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="card-elegant p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--noir)] flex items-center justify-center shrink-0 overflow-hidden">
                        {agent.avatar_url ? (
                          <Image src={agent.avatar_url} alt={agent.full_name} width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">{initials}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-bold text-[var(--noir)]">{agent.full_name}</h3>
                        <p className="text-sm text-[var(--gold-light)] font-medium">Agent Immobilier</p>
                      </div>
                    </div>

                    {agent.bio && (
                      <p className="text-sm text-[var(--stone)] mt-4 leading-relaxed">{agent.bio}</p>
                    )}

                    {agent.phone && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <a href={`tel:${agent.phone}`}>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Phone className="w-3 h-3 mr-1" />
                            {t('agents.contactAgent')}
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
