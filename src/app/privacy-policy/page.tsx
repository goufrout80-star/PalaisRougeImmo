'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-8">Politique de Confidentialité</h1>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 prose prose-sm max-w-none">
            <h2 className="font-display text-xl font-bold text-[var(--noir)]">Collecte des données</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Palais Rouge Immo collecte les informations personnelles que vous nous fournissez volontairement lors de votre utilisation de notre site web, notamment : nom, adresse email, numéro de téléphone et toute autre information que vous choisissez de partager via nos formulaires.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Utilisation des données</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Nous utilisons vos données personnelles pour : répondre à vos demandes d&apos;information, vous proposer des biens correspondant à vos critères, améliorer nos services et vous envoyer des communications marketing si vous y avez consenti.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Protection des données</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Vos droits</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à contact@palaisrouge.online.</p>

            <p className="text-[var(--gold-light)] text-xs mt-8">Dernière mise à jour : Janvier 2025</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
