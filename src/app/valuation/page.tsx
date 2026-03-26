'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Castle, Store, Landmark, MapPin, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import { useCities } from '@/hooks/useCities';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function ValuationPage() {
  const { t, formatCurrency } = useI18n();
  const { neighborhoods } = useCities();
  const NEIGHBORHOODS = neighborhoods.map(n => n.name_fr);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({
    propertyType: '',
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 150,
    neighborhood: '',
    hasPool: false,
    hasGarden: false,
    hasParking: true,
    condition: 'good',
  });

  const propertyTypes = [
    { type: 'HOUSE', icon: Home, label: t('property.house') },
    { type: 'APARTMENT', icon: Building2, label: t('property.apartment') },
    { type: 'VILLA', icon: Castle, label: t('property.villa') },
    { type: 'COMMERCIAL', icon: Store, label: t('property.commercial') },
    { type: 'LAND', icon: Landmark, label: t('property.land') },
  ];

  useEffect(() => {
    if (step === 4 && !submitted) {
      setSubmitted(true);
      trackEvent('valuation_complete', 'lead', 'valuation_form');
      const estimated = estimatePrice();
      fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email: '',
          phone: '',
          property_type: data.propertyType,
          location: data.neighborhood,
          area_sqm: data.surfaceArea,
          message: `Estimation automatique: ${estimated} MAD`,
        }),
      }).catch(console.error);
    }
  }, [step]);

  const estimatePrice = () => {
    const basePrices: Record<string, number> = { HOUSE: 15000, APARTMENT: 12000, VILLA: 22000, COMMERCIAL: 10000, LAND: 5000 };
    const neighborhoodMultipliers: Record<string, number> = { Palmeraie: 1.5, Hivernage: 1.4, Guéliz: 1.2, Agdal: 1.0, Targa: 0.9, Médina: 1.1 };
    const base = basePrices[data.propertyType] || 12000;
    const nMult = neighborhoodMultipliers[data.neighborhood] || 1.0;
    const condMult = data.condition === 'excellent' ? 1.2 : data.condition === 'good' ? 1.0 : 0.8;
    let price = base * data.surfaceArea * nMult * condMult;
    if (data.hasPool) price *= 1.15;
    if (data.hasGarden) price *= 1.08;
    if (data.hasParking) price *= 1.05;
    return Math.round(price / 1000) * 1000;
  };

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--rouge)] mb-4">{t('valuation.title')}</h1>
          <p className="text-[var(--stone)]">{t('valuation.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold)] mx-auto mt-4" />
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? 'bg-[var(--rouge)] text-white' : 'bg-[var(--border)] text-[var(--stone)]'
              }`}>{s}</div>
              {s < 4 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[var(--rouge)]' : 'bg-[var(--border)]'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
          {/* Step 1: Property Type */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-xl font-bold text-[var(--rouge)] mb-6">{t('valuation.step1')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map(pt => {
                  const Icon = pt.icon;
                  return (
                    <button
                      key={pt.type}
                      onClick={() => setData({ ...data, propertyType: pt.type })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                        data.propertyType === pt.type ? 'border-[var(--gold)] bg-[var(--parchment)]' : 'border-[var(--border)] hover:border-[var(--gold)]'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-[var(--gold)]" />
                      <span className="text-sm font-medium text-[var(--rouge)]">{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-xl font-bold text-[var(--rouge)] mb-6">{t('valuation.step2')}</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-2">{t('property.surfaceArea')} ({t('common.sqm')})</label>
                  <input type="number" value={data.surfaceArea} onChange={(e) => setData({ ...data, surfaceArea: Number(e.target.value) })} className="input-luxury" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--rouge)] mb-2">{t('property.bedrooms')}</label>
                    <select value={data.bedrooms} onChange={(e) => setData({ ...data, bedrooms: Number(e.target.value) })} className="input-luxury">
                      {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--rouge)] mb-2">{t('property.bathrooms')}</label>
                    <select value={data.bathrooms} onChange={(e) => setData({ ...data, bathrooms: Number(e.target.value) })} className="input-luxury">
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'hasPool', label: t('property.pool') },
                    { key: 'hasGarden', label: t('property.garden') },
                    { key: 'hasParking', label: t('property.parking') },
                  ].map(a => (
                    <button
                      key={a.key}
                      onClick={() => setData({ ...data, [a.key]: !(data as Record<string, unknown>)[a.key] })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors cursor-pointer ${
                        (data as Record<string, unknown>)[a.key] ? 'border-[var(--gold)] bg-[var(--parchment)] text-[var(--rouge)]' : 'border-[var(--border)] text-[var(--stone)]'
                      }`}
                    >{a.label}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-xl font-bold text-[var(--rouge)] mb-6">{t('valuation.step3')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {NEIGHBORHOODS.map(n => (
                  <button
                    key={n}
                    onClick={() => setData({ ...data, neighborhood: n })}
                    className={`p-4 rounded-xl border-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      data.neighborhood === n ? 'border-[var(--gold)] bg-[var(--parchment)]' : 'border-[var(--border)] hover:border-[var(--gold)]'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[var(--gold)]" />
                    <span className="text-sm font-medium text-[var(--rouge)]">{n}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-[var(--rouge)] mb-2">État du bien</label>
                <select value={data.condition} onChange={(e) => setData({ ...data, condition: e.target.value })} className="input-luxury">
                  <option value="excellent">Excellent</option>
                  <option value="good">Bon</option>
                  <option value="fair">À rénover</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-[var(--gold)] mx-auto mb-6" />
              <h2 className="font-display text-xl font-bold text-[var(--rouge)] mb-2">{t('valuation.step4')}</h2>
              <p className="text-sm text-[var(--stone)] mb-8">Estimation basée sur les données du marché actuel</p>
              <div className="bg-[var(--parchment)] rounded-2xl p-8 max-w-sm mx-auto">
                <div className="text-sm text-[var(--stone)] mb-2">Valeur estimée</div>
                <div className="font-display text-4xl font-bold text-[var(--rouge)]">{formatCurrency(estimatePrice())}</div>
                <div className="text-xs text-[var(--stone)] mt-2">± 10% selon les conditions du marché</div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.previous')}
              </Button>
            ) : <div />}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !data.propertyType || step === 3 && !data.neighborhood}>
                {t('common.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => { setStep(1); setData({ ...data, propertyType: '', neighborhood: '' }); }}>
                Nouvelle estimation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
