'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import { ListingType, PropertyType, PropertyStatus } from '@/types';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ImageUpload';
import { CityNeighborhoodSelect } from '@/components/ui/CityNeighborhoodSelect';

export default function EditPropertyPage() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { getProperty, updateProperty } = useProperties();
  const params = useParams();
  const router = useRouter();

  const property = getProperty(params.id as string);
  const [form, setForm] = useState(property || ({} as Record<string, unknown>));
  const [images, setImages] = useState<string[]>(property?.images ?? []);

  const [cityId, setCityId] = useState('');
  const [cityName, setCityName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  useEffect(() => {
    if (property) {
      setForm(property);
      setImages(property.images ?? []);
      setCityName((property.city as string) ?? '');
      setNeighborhood((property.neighborhood as string) ?? '');
    }
  }, [property]);

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'agent'))
    ) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (!property) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <p className="text-[var(--stone)]">{t('common.noResults')}</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProperty(property.id, {
      ...(form as Record<string, unknown>),
      images,
      city: cityName || (form as Record<string, string>).city || '',
      neighborhood,
    });
    router.push(`/properties/${property.id}`);
  };

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--parchment)] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--stone)] hover:text-[var(--noir)] transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
          <h1 className="font-display text-3xl font-bold text-[var(--noir)] mb-8">
            {t('property.editProperty')}
          </h1>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">Title</label>
              <input
                type="text"
                value={(form as Record<string, string>).title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-luxury"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('property.description')}
              </label>
              <textarea
                value={(form as Record<string, string>).description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-luxury min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('search.listingType')}
              </label>
              <select
                value={(form as Record<string, string>).listingType || 'BUY'}
                onChange={(e) => setForm({ ...form, listingType: e.target.value as ListingType })}
                className="input-luxury"
              >
                <option value="BUY">{t('common.buy')}</option>
                <option value="RENT">{t('common.rent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('search.propertyType')}
              </label>
              <select
                value={(form as Record<string, string>).propertyType || 'APARTMENT'}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyType })}
                className="input-luxury"
              >
                <option value="HOUSE">{t('property.house')}</option>
                <option value="APARTMENT">{t('property.apartment')}</option>
                <option value="VILLA">{t('property.villa')}</option>
                <option value="RIAD">Riad</option>
                <option value="LAND">{t('property.land')}</option>
                <option value="COMMERCIAL">{t('property.commercial')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('common.price')} (MAD)
              </label>
              <input
                type="number"
                value={(form as Record<string, number>).price || 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="input-luxury"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('admin.status')}
              </label>
              <select
                value={(form as Record<string, string>).status || 'AVAILABLE'}
                onChange={(e) => setForm({ ...form, status: e.target.value as PropertyStatus })}
                className="input-luxury"
              >
                <option value="AVAILABLE">{t('property.available')}</option>
                <option value="PENDING">{t('property.pending')}</option>
                <option value="SOLD">{t('property.sold')}</option>
                <option value="RENTED">{t('property.rented')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('property.surfaceArea')} (m²)
              </label>
              <input
                type="number"
                value={(form as Record<string, number>).surfaceArea || 0}
                onChange={(e) => setForm({ ...form, surfaceArea: Number(e.target.value) })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('property.bedrooms')}
              </label>
              <input
                type="number"
                value={(form as Record<string, number>).bedrooms || 0}
                onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('property.bathrooms')}
              </label>
              <input
                type="number"
                value={(form as Record<string, number>).bathrooms || 0}
                onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                className="input-luxury"
              />
            </div>
            <div className="col-span-2">
              <CityNeighborhoodSelect
                cityValue={cityId}
                neighborhoodValue={neighborhood}
                onCityChange={(id, name) => {
                  setCityId(id);
                  setCityName(name);
                }}
                onNeighborhoodChange={setNeighborhood}
              />
              {!cityId && cityName && (
                <p className="text-xs text-[var(--muted)] mt-1">
                  Ville actuelle : <span className="font-medium">{cityName}</span>
                  {neighborhood && ` · ${neighborhood}`}
                  {' '}— sélectionnez ci-dessus pour modifier
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                {t('property.location')}
              </label>
              <input
                type="text"
                value={(form as Record<string, string>).address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                Latitude (optionnel)
              </label>
              <input
                type="number"
                step="any"
                value={(form as Record<string, unknown>).latitude as string ?? ''}
                onChange={(e) => setForm({ ...form, latitude: e.target.value !== '' ? Number(e.target.value) : undefined })}
                className="input-luxury"
                placeholder="31.6295"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                Longitude (optionnel)
              </label>
              <input
                type="number"
                step="any"
                value={(form as Record<string, unknown>).longitude as string ?? ''}
                onChange={(e) => setForm({ ...form, longitude: e.target.value !== '' ? Number(e.target.value) : undefined })}
                className="input-luxury"
                placeholder="-7.9811"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--noir)] mb-3">Images</label>
              <ImageUpload
                images={images}
                onChange={setImages}
                folder="properties"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--noir)] mb-3">
                {t('property.amenities')}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'hasPool', label: t('property.pool') },
                  { key: 'hasParking', label: t('property.parking') },
                  { key: 'hasGarden', label: t('property.garden') },
                  { key: 'hasAC', label: t('property.ac') },
                  { key: 'hasGym', label: t('property.gym') },
                  { key: 'hasElevator', label: t('property.elevator') },
                  { key: 'hasSecurity', label: t('property.security') },
                ].map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setForm({ ...form, [a.key]: !(form as Record<string, unknown>)[a.key] })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      (form as Record<string, unknown>)[a.key]
                        ? 'bg-[var(--noir)] text-white border-[var(--noir)]'
                        : 'border-[var(--border)] text-[var(--stone)] hover:border-[var(--gold)]'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('common.save')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
