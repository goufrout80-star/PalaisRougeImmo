'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CookiesPage() {
  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-8">Politique de Cookies</h1>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 prose prose-sm max-w-none">
            <h2 className="font-display text-xl font-bold text-[var(--noir)]">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez notre site web. Les cookies nous permettent de reconnaître votre navigateur et de mémoriser certaines informations.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Types de cookies utilisés</h2>
            <ul className="text-[var(--charcoal)] space-y-2">
              <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</li>
              <li><strong>Cookies analytiques :</strong> Nous aident à comprendre comment les visiteurs interagissent avec le site.</li>
              <li><strong>Cookies marketing :</strong> Utilisés pour suivre les visiteurs sur les sites web afin de présenter des publicités pertinentes.</li>
              <li><strong>Cookies de préférences :</strong> Permettent au site de se souvenir de vos choix (langue, devise, etc.).</li>
            </ul>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Gestion des cookies</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez via les paramètres de votre navigateur. Vous pouvez supprimer tous les cookies déjà présents sur votre ordinateur et configurer la plupart des navigateurs pour qu&apos;ils les bloquent.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Contact</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Pour toute question concernant notre politique de cookies, contactez-nous à contact@palaisrouge.online.</p>

            <p className="text-[var(--gold-light)] text-xs mt-8">Dernière mise à jour : Janvier 2025</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
