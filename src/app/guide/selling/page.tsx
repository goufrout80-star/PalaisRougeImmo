'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Camera, FileText, Users, Clock, CheckCircle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const SECTIONS = [
  { icon: TrendingUp, title: 'Estimer votre bien', content: 'La première étape est d\'obtenir une estimation précise. Nous analysons les ventes récentes dans votre quartier, l\'état du marché et les caractéristiques de votre bien pour vous proposer un prix juste et compétitif.' },
  { icon: Camera, title: 'Préparer la vente', content: 'Un bien bien présenté se vend plus vite et au meilleur prix. Nous organisons des photos professionnelles, rédigeons une description attractive et pouvons vous conseiller sur le home staging pour maximiser l\'attrait de votre propriété.' },
  { icon: FileText, title: 'Documents à préparer', content: 'Rassemblez votre titre foncier, certificat de propriété, plan cadastral, et tous les documents relatifs au bien (permis de construire, certificat de conformité, etc.). Notre équipe vous guide dans cette préparation.' },
  { icon: Users, title: 'Trouver les acheteurs', content: 'Grâce à notre réseau étendu d\'acheteurs nationaux et internationaux, votre bien bénéficie d\'une visibilité maximale. Nous organisons les visites, qualifions les acquéreurs et gérons les négociations.' },
  { icon: Clock, title: 'La négociation', content: 'Notre expérience nous permet de négocier au mieux de vos intérêts. Nous vous conseillons sur les offres reçues et vous aidons à prendre la meilleure décision.' },
  { icon: CheckCircle, title: 'Finaliser la vente', content: 'Nous coordonnons toutes les étapes jusqu\'à la signature chez le notaire : compromis de vente, conditions suspensives, et acte définitif. Vous êtes accompagné de bout en bout.' },
];

export default function SellingGuidePage() {
  const { t } = useI18n();

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('guide.selling.title')}</h1>
          <p className="text-[var(--stone)] max-w-lg mx-auto">{t('guide.selling.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
        </motion.div>

        <div className="space-y-6">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elegant p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--parchment)] flex items-center justify-center shrink-0 relative">
                  <Icon className="w-5 h-5 text-[var(--gold-light)]" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--noir)] text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--noir)] mb-2">{section.title}</h3>
                  <p className="text-sm text-[var(--charcoal)] leading-relaxed">{section.content}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/sell">
            <Button variant="primary">{t('sell.requestValuation')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
