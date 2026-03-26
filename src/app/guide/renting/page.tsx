'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Home, DollarSign, Key, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const SECTIONS = [
  { icon: FileText, title: 'Documents nécessaires', content: 'Pour louer un bien à Marrakech, préparez votre pièce d\'identité (passeport pour les étrangers), une attestation de travail ou justificatif de revenus, et une caution bancaire. Certains propriétaires peuvent demander des fiches de paie des 3 derniers mois.' },
  { icon: DollarSign, title: 'Budget et coûts', content: 'Prévoyez en général 2 mois de caution et 1 mois de loyer d\'avance. Les charges (eau, électricité, syndic) sont souvent en plus. Les loyers à Marrakech varient de 5 000 DH pour un studio à 45 000 DH pour une villa de luxe.' },
  { icon: Shield, title: 'Vos droits', content: 'Le contrat de location doit être légalisé auprès des autorités locales. La durée minimum est généralement de 12 mois. Le propriétaire doit maintenir le bien en bon état. Les augmentations de loyer sont encadrées par la loi.' },
  { icon: Home, title: 'Choisir le bon quartier', content: 'Guéliz pour la vie urbaine et les commerces, Palmeraie pour le calme et le luxe, Agdal pour les familles, Hivernage pour le standing, et la Médina pour l\'authenticité. Chaque quartier a son caractère unique.' },
  { icon: Key, title: 'L\'état des lieux', content: 'Faites toujours un état des lieux détaillé à l\'entrée et à la sortie. Photographiez tout et notez les éventuels défauts. Cela vous protège lors de la restitution de la caution.' },
  { icon: AlertTriangle, title: 'Pièges à éviter', content: 'Méfiez-vous des offres trop belles pour être vraies. Vérifiez toujours la propriété du bien (titre foncier). Ne payez jamais avant de visiter. Passez par une agence reconnue pour plus de sécurité.' },
];

export default function RentingGuidePage() {
  const { t } = useI18n();

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('guide.renting.title')}</h1>
          <p className="text-[var(--stone)] max-w-lg mx-auto">{t('guide.renting.subtitle')}</p>
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
                <div className="w-12 h-12 rounded-xl bg-[var(--parchment)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[var(--gold-light)]" />
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
          <Link href="/properties?listingType=RENT">
            <Button variant="primary">{t('nav.browseRentals')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
