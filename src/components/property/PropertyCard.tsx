'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize, Eye } from 'lucide-react';
import { Property } from '@/types';
import { useI18n } from '@/context/I18nContext';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { t, formatCurrency } = useI18n();

  const propertyTypeLabels: Record<string, string> = {
    HOUSE: t('property.house'),
    APARTMENT: t('property.apartment'),
    VILLA: t('property.villa'),
    LAND: t('property.land'),
    COMMERCIAL: t('property.commercial'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/properties/${property.id}`} className="block group">
        <div className="card-elegant overflow-hidden">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <Image
              src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                property.listingType === 'BUY'
                  ? 'bg-[var(--rouge)] text-white'
                  : 'bg-[var(--gold)] text-white'
              }`}>
                {property.listingType === 'BUY' ? t('property.forSale') : t('property.forRent')}
              </span>
              {property.featured && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--gold)] text-white">
                  {t('property.featured')}
                </span>
              )}
            </div>
            {/* View count */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md text-white text-xs">
              <Eye className="w-3 h-3" />
              {property.viewCount}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Type tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="tag-luxury text-[10px]">
                {propertyTypeLabels[property.propertyType] || property.propertyType}
              </span>
              {(() => {
                const loc = [property.city, property.neighborhood].filter(Boolean).join(' · ') || 'Marrakech';
                return (
                  <span className="flex items-center gap-1 text-xs text-[var(--stone)]">
                    <MapPin className="w-3 h-3" />
                    {loc}
                  </span>
                );
              })()}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-[var(--rouge)] mb-2 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
              {property.title}
            </h3>

            {/* Price */}
            <div className="text-lg font-bold text-[var(--rouge)] mb-3">
              {formatCurrency(property.price)}
              {property.listingType === 'RENT' && (
                <span className="text-sm font-normal text-[var(--stone)]">{t('common.perMonth')}</span>
              )}
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--stone)]">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  {property.bathrooms}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                {property.surfaceArea} {t('common.sqm')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
