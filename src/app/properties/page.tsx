'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import PropertyCard from '@/components/property/PropertyCard';
import { ListingType, PropertyType } from '@/types';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';

function PropertiesContent() {
  const { t } = useI18n();
  const { getAvailableProperties, isLoading } = useProperties();
  const properties = getAvailableProperties();
  const searchParams = useSearchParams();

  const initialListingType = searchParams.get('listingType') as ListingType | null;
  const initialPropertyType = searchParams.get('propertyType') as PropertyType | null;

  const [listingType, setListingType] = useState<ListingType | ''>(initialListingType || '');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>(initialPropertyType || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = properties.filter(p => p.approved);

    if (listingType) result = result.filter(p => p.listingType === listingType);
    if (propertyType) result = result.filter(p => p.propertyType === propertyType);
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    if (bedrooms) result = result.filter(p => p.bedrooms >= Number(bedrooms));

    switch (sortBy) {
      case 'priceLow': result.sort((a, b) => a.price - b.price); break;
      case 'priceHigh': result.sort((a, b) => b.price - a.price); break;
      case 'area': result.sort((a, b) => b.surfaceArea - a.surfaceArea); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [properties, listingType, propertyType, minPrice, maxPrice, bedrooms, sortBy]);

  const resetFilters = () => {
    setListingType('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
  };

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-2">
            {t('common.properties')}
          </h1>
          <p className="text-[var(--stone)]">
            {filtered.length} {t('search.results')}
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Listing Type */}
            <div className="flex gap-1 bg-[var(--parchment)] rounded-lg p-1">
              <button
                onClick={() => setListingType('')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${!listingType ? 'bg-[var(--noir)] text-white' : 'text-[var(--stone)]'}`}
              >
                {t('common.all')}
              </button>
              <button
                onClick={() => setListingType('BUY')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${listingType === 'BUY' ? 'bg-[var(--noir)] text-white' : 'text-[var(--stone)]'}`}
              >
                {t('common.buy')}
              </button>
              <button
                onClick={() => setListingType('RENT')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${listingType === 'RENT' ? 'bg-[var(--noir)] text-white' : 'text-[var(--stone)]'}`}
              >
                {t('common.rent')}
              </button>
            </div>

            {/* Property Type */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType | '')}
              className="px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:border-[var(--gold-light)]"
            >
              <option value="">{t('search.propertyType')}</option>
              <option value="HOUSE">{t('property.house')}</option>
              <option value="APARTMENT">{t('property.apartment')}</option>
              <option value="VILLA">{t('property.villa')}</option>
              <option value="LAND">{t('property.land')}</option>
              <option value="COMMERCIAL">{t('property.commercial')}</option>
            </select>

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--parchment)] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t('common.filter')}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:border-[var(--gold-light)]"
            >
              <option value="newest">{t('search.newest')}</option>
              <option value="priceLow">{t('search.priceLowHigh')}</option>
              <option value="priceHigh">{t('search.priceHighLow')}</option>
              <option value="area">{t('search.areaLargest')}</option>
            </select>

            {(listingType || propertyType || minPrice || maxPrice || bedrooms) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                {t('search.resetFilters')}
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--stone)] mb-1">{t('search.minPrice')}</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input-luxury text-sm py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--stone)] mb-1">{t('search.maxPrice')}</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input-luxury text-sm py-2"
                  placeholder="10,000,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--stone)] mb-1">{t('search.bedrooms')}</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="input-luxury text-sm py-2"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[var(--stone)] text-lg">{t('common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="pt-32 min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-light)]" /></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
