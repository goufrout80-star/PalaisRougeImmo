'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-8">Conditions Générales d&apos;Utilisation</h1>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 prose prose-sm max-w-none">
            <h2 className="font-display text-xl font-bold text-[var(--noir)]">Objet</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Les présentes conditions générales d&apos;utilisation régissent l&apos;accès et l&apos;utilisation du site web Palais Rouge Immo. En accédant au site, vous acceptez ces conditions dans leur intégralité.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Services</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Palais Rouge Immo propose des services d&apos;intermédiation immobilière incluant : la mise en relation entre acheteurs et vendeurs, la location de biens immobiliers, l&apos;estimation de biens et le conseil immobilier.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Responsabilité</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Les informations publiées sur le site sont fournies à titre indicatif. Palais Rouge Immo s&apos;efforce de maintenir des informations exactes et à jour, mais ne garantit pas l&apos;exactitude de toutes les informations.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Propriété intellectuelle</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">L&apos;ensemble du contenu du site (textes, images, logos, etc.) est protégé par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.</p>

            <h2 className="font-display text-xl font-bold text-[var(--noir)] mt-6">Droit applicable</h2>
            <p className="text-[var(--charcoal)] leading-relaxed">Les présentes conditions sont régies par le droit marocain. Tout litige sera soumis à la compétence exclusive des tribunaux de Marrakech.</p>

            <p className="text-[var(--gold-light)] text-xs mt-8">Dernière mise à jour : Janvier 2025</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
