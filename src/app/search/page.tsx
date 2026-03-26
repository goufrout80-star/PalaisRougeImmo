'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import PropertyCard from '@/components/property/PropertyCard';
import Button from '@/components/ui/Button';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { ListingType, PropertyType } from '@/types';
import { useCities } from '@/hooks/useCities';

export default function SearchPage() {
  const { t, formatCurrency } = useI18n();
  const { getAvailableProperties, isLoading } = useProperties();
  const { neighborhoods } = useCities();
  const allNeighborhoods = neighborhoods.map(n => n.name_fr);
  const properties = getAvailableProperties();
  const [listingType, setListingType] = useState<ListingType | ''>('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [neighborhood, setNeighborhood] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const results = useMemo(() => {
    if (!hasSearched) return [];
    let result = properties.filter(p => p.approved);
    if (listingType) result = result.filter(p => p.listingType === listingType);
    if (propertyType) result = result.filter(p => p.propertyType === propertyType);
    if (neighborhood) result = result.filter(p => p.neighborhood === neighborhood);
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    if (bedrooms) result = result.filter(p => p.bedrooms >= Number(bedrooms));
    if (bathrooms) result = result.filter(p => p.bathrooms >= Number(bathrooms));
    return result;
  }, [properties, listingType, propertyType, neighborhood, minPrice, maxPrice, bedrooms, bathrooms, hasSearched]);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4">{t('search.title')}</h1>
          <div className="w-16 h-0.5 bg-[var(--gold-light)] mx-auto" />
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--white)] rounded-2xl border border-[var(--border)] p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.listingType')}</label>
              <select value={listingType} onChange={(e) => setListingType(e.target.value as ListingType | '')} className="input-luxury text-sm">
                <option value="">{t('common.all')}</option>
                <option value="BUY">{t('common.buy')}</option>
                <option value="RENT">{t('common.rent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.propertyType')}</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType | '')} className="input-luxury text-sm">
                <option value="">{t('common.all')}</option>
                <option value="HOUSE">{t('property.house')}</option>
                <option value="APARTMENT">{t('property.apartment')}</option>
                <option value="VILLA">{t('property.villa')}</option>
                <option value="LAND">{t('property.land')}</option>
                <option value="COMMERCIAL">{t('property.commercial')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.neighborhood')}</label>
              <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="input-luxury text-sm">
                <option value="">{t('common.all')}</option>
                {allNeighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.bedrooms')}</label>
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="input-luxury text-sm">
                <option value="">{t('common.all')}</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.minPrice')}</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-luxury text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.maxPrice')}</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-luxury text-sm" placeholder="10,000,000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--stone)] mb-1.5">{t('search.bathrooms')}</label>
              <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="input-luxury text-sm">
                <option value="">{t('common.all')}</option>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
          <Button onClick={() => setHasSearched(true)} className="w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            {t('common.search')}
          </Button>
        </motion.div>

        {/* Results */}
        {hasSearched && (
          <div>
            <p className="text-sm text-[var(--stone)] mb-6">{isLoading ? '…' : `${results.length} ${t('search.results')}`}</p>
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : results.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-[var(--muted-light)] mx-auto mb-4" />
                <p className="text-[var(--stone)]">{t('common.noResults')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
