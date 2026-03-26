'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

export default function CalculatorPage() {
  const { t, formatCurrency } = useI18n();
  const [price, setPrice] = useState(2000000);
  const [downPayment, setDownPayment] = useState(20);
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(20);

  const result = useMemo(() => {
    const loanAmount = price * (1 - downPayment / 100);
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    if (monthlyRate === 0) {
      const monthly = loanAmount / numPayments;
      return { monthly, totalInterest: 0, totalPayment: loanAmount };
    }
    const monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthly * numPayments;
    const totalInterest = totalPayment - loanAmount;
    return { monthly, totalInterest, totalPayment };
  }, [price, downPayment, rate, term]);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('calculator.title')}</h1>
          <p className="text-[var(--stone)]">{t('calculator.subtitle')}</p>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto mt-4" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-6">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-[var(--noir)] mb-2">
                  {t('calculator.propertyPrice')}
                  <span className="text-[var(--gold-light)]">{formatCurrency(price)}</span>
                </label>
                <input type="range" min={500000} max={20000000} step={100000} value={price} onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full accent-[var(--gold-light)]" />
                <div className="flex justify-between text-xs text-[var(--stone)] mt-1">
                  <span>{formatCurrency(500000)}</span>
                  <span>{formatCurrency(20000000)}</span>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-[var(--noir)] mb-2">
                  {t('calculator.downPayment')}
                  <span className="text-[var(--gold-light)]">{downPayment}% ({formatCurrency(price * downPayment / 100)})</span>
                </label>
                <input type="range" min={5} max={80} step={5} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-[var(--gold-light)]" />
                <div className="flex justify-between text-xs text-[var(--stone)] mt-1">
                  <span>5%</span>
                  <span>80%</span>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-[var(--noir)] mb-2">
                  {t('calculator.interestRate')}
                  <span className="text-[var(--gold-light)]">{rate}%</span>
                </label>
                <input type="range" min={1} max={10} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-[var(--gold-light)]" />
                <div className="flex justify-between text-xs text-[var(--stone)] mt-1">
                  <span>1%</span>
                  <span>10%</span>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-[var(--noir)] mb-2">
                  {t('calculator.loanTerm')}
                  <span className="text-[var(--gold-light)]">{term} {t('calculator.years')}</span>
                </label>
                <input type="range" min={5} max={30} step={1} value={term} onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full accent-[var(--gold-light)]" />
                <div className="flex justify-between text-xs text-[var(--stone)] mt-1">
                  <span>5 {t('calculator.years')}</span>
                  <span>30 {t('calculator.years')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[var(--noir)] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-[var(--gold-light)]" />
                </div>
                <div>
                  <div className="text-sm text-white/60">{t('calculator.monthlyPayment')}</div>
                  <div className="font-display text-3xl font-bold text-[var(--gold-light)]">
                    {formatCurrency(Math.round(result.monthly))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-white/70 text-sm">{t('calculator.totalInterest')}</span>
                  <span className="font-semibold">{formatCurrency(Math.round(result.totalInterest))}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-white/70 text-sm">{t('calculator.totalPayment')}</span>
                  <span className="font-semibold">{formatCurrency(Math.round(result.totalPayment))}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-white/70 text-sm">{t('calculator.downPayment')}</span>
                  <span className="font-semibold">{formatCurrency(Math.round(price * downPayment / 100))}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
