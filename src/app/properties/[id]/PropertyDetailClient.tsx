'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize, Calendar,
  Waves, Car, Trees, Wind, Dumbbell, ArrowUpDown, ShieldCheck,
  Phone, Mail, Share2, Heart, ChevronLeft, ChevronRight, MessageCircle,
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import PropertyCard from '@/components/property/PropertyCard';
import GoogleMap from '@/components/GoogleMap';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { PropertyDetailSkeleton } from '@/components/ui/Skeleton';
import { BreadcrumbJsonLd, PropertyJsonLd } from '@/components/seo/JsonLd';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function PropertyDetailClient() {
  const { t, formatCurrency } = useI18n();
  const { properties, getProperty, incrementViewCount, isLoading } = useProperties();
  const params = useParams();
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [agencyPhone, setAgencyPhone] = useState('+212524430000');
  const [agencyWhatsapp, setAgencyWhatsapp] = useState('+212524430000');
  const [agentProfile, setAgentProfile] = useState<{ full_name?: string; avatar_url?: string; phone?: string; whatsapp?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['agency_phone', 'agency_whatsapp'])
      .then(({ data }) => {
        data?.forEach(({ key, value }: { key: string; value: string }) => {
          if (key === 'agency_phone') setAgencyPhone(value ?? '');
          if (key === 'agency_whatsapp') setAgencyWhatsapp(value ?? '');
        });
      });
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property?.title ?? '', url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const property = getProperty(params.id as string);

  useEffect(() => {
    if (property) {
      incrementViewCount(property.id);
      trackEvent('property_view', 'engagement', property.title);
    }
  }, [property?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const agentId = property?.agentId;
    if (!agentId) return;
    const supabase = createClient();
    supabase
      .from('agent_profiles')
      .select('full_name, avatar_url, phone, whatsapp')
      .eq('id', agentId)
      .single()
      .then(({ data }) => { if (data) setAgentProfile(data); });
  }, [property?.agentId]);

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center">
        <p className="text-[var(--stone)] text-lg mb-4">{t('common.noResults')}</p>
        <Button onClick={() => router.push('/properties')}>{t('common.back')}</Button>
      </div>
    );
  }

  const amenities = [
    { key: 'hasPool', label: t('property.pool'), icon: Waves, value: property.hasPool },
    { key: 'hasParking', label: t('property.parking'), icon: Car, value: property.hasParking },
    { key: 'hasGarden', label: t('property.garden'), icon: Trees, value: property.hasGarden },
    { key: 'hasAC', label: t('property.ac'), icon: Wind, value: property.hasAC },
    { key: 'hasGym', label: t('property.gym'), icon: Dumbbell, value: property.hasGym },
    { key: 'hasElevator', label: t('property.elevator'), icon: ArrowUpDown, value: property.hasElevator },
    { key: 'hasSecurity', label: t('property.security'), icon: ShieldCheck, value: property.hasSecurity },
  ].filter(a => a.value);

  const similarProperties = properties
    .filter(p => p.id !== property.id && p.propertyType === property.propertyType && p.approved && p.status === 'AVAILABLE')
    .slice(0, 3);

  const statusBanner = property.status !== 'AVAILABLE' ? {
    SOLD: { bg: 'bg-gray-900', text: 'Ce bien a été vendu', ribbon: 'VENDU' },
    RENTED: { bg: 'bg-blue-700', text: 'Ce bien a été loué', ribbon: 'LOUÉ' },
    PENDING: { bg: 'bg-amber-600', text: 'Ce bien est réservé', ribbon: 'RÉSERVÉ' },
  }[property.status] : null;

  const propertyUrl = `https://palaisrouge.online/properties/${property.id}`;

  return (
    <div className="pt-32 pb-20 bg-[var(--linen)] min-h-screen">
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://palaisrouge.online' },
        { name: 'Propriétés', url: 'https://palaisrouge.online/properties' },
        { name: property.title, url: propertyUrl },
      ]} />
      <PropertyJsonLd property={{
        title: property.title,
        description: property.description,
        listing_type: property.listingType,
        property_type: property.propertyType,
        neighborhood: property.neighborhood,
        city: property.city,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        surfaceArea: property.surfaceArea,
        images: property.images,
        status: property.status,
        latitude: property.latitude,
        longitude: property.longitude,
        created_at: property.createdAt,
      }} url={propertyUrl} />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Status Banner */}
        {statusBanner && (
          <div className={`${statusBanner.bg} text-white text-center py-3 px-4 rounded-xl mb-4 text-sm font-semibold`}>
            {statusBanner.text}
          </div>
        )}

        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--stone)] hover:text-[var(--rouge)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden mb-6"
            >
              <div className="relative h-[400px] md:h-[500px]">
                <Image
                  src={property.images[currentImage] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                {/* Nav arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage(prev => (prev - 1 + property.images.length) % property.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5 text-[var(--rouge)]" />
                    </button>
                    <button
                      onClick={() => setCurrentImage(prev => (prev + 1) % property.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 text-[var(--rouge)]" />
                    </button>
                  </>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    property.listingType === 'BUY' ? 'bg-[var(--rouge)] text-white' : 'bg-[var(--gold)] text-white'
                  }`}>
                    {property.listingType === 'BUY' ? t('property.forSale') : t('property.forRent')}
                  </span>
                </div>
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isSaved ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-[var(--rouge)] hover:bg-white'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isSaved ? 'white' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer relative"
                    title={shareCopied ? 'Lien copié !' : 'Partager'}
                  >
                    <Share2 className="w-4 h-4 text-[var(--rouge)]" />
                    {shareCopied && (
                      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-0.5 rounded whitespace-nowrap">
                        Lien copié !
                      </span>
                    )}
                  </button>
                </div>
                {/* Watermark ribbon for non-available */}
                {statusBanner && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`${statusBanner.bg}/80 text-white text-2xl md:text-3xl font-bold tracking-widest px-12 py-3 rotate-[-15deg] uppercase`}>
                      {statusBanner.ribbon}
                    </div>
                  </div>
                )}
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                  {currentImage + 1} / {property.images.length}
                </div>
              </div>
              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden cursor-pointer ${
                        i === currentImage ? 'ring-2 ring-[var(--gold)]' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-[var(--border)] p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--rouge)] mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-[var(--stone)]">
                    <MapPin className="w-4 h-4" />
                    {property.address}, {property.neighborhood}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--rouge)]">
                    {formatCurrency(property.price)}
                  </div>
                  {property.listingType === 'RENT' && (
                    <span className="text-sm text-[var(--stone)]">{t('common.perMonth')}</span>
                  )}
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-4 gap-4 py-4 border-y border-[var(--border)]">
                {property.bedrooms > 0 && (
                  <div className="text-center">
                    <Bed className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                    <div className="text-lg font-bold text-[var(--rouge)]">{property.bedrooms}</div>
                    <div className="text-xs text-[var(--stone)]">{t('property.bedrooms')}</div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center">
                    <Bath className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                    <div className="text-lg font-bold text-[var(--rouge)]">{property.bathrooms}</div>
                    <div className="text-xs text-[var(--stone)]">{t('property.bathrooms')}</div>
                  </div>
                )}
                <div className="text-center">
                  <Maximize className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[var(--rouge)]">{property.surfaceArea}</div>
                  <div className="text-xs text-[var(--stone)]">{t('common.sqm')}</div>
                </div>
                {property.yearBuilt && (
                  <div className="text-center">
                    <Calendar className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                    <div className="text-lg font-bold text-[var(--rouge)]">{property.yearBuilt}</div>
                    <div className="text-xs text-[var(--stone)]">{t('property.yearBuilt')}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="font-display text-lg font-bold text-[var(--rouge)] mb-3">{t('property.description')}</h3>
                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-display text-lg font-bold text-[var(--rouge)] mb-3">{t('property.amenities')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map(amenity => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.key} className="flex items-center gap-2 p-3 bg-[var(--parchment)] rounded-lg">
                          <Icon className="w-4 h-4 text-[var(--gold)]" />
                          <span className="text-sm text-[var(--rouge)]">{amenity.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div className="mt-6">
                <h3 className="font-display text-lg font-bold text-[var(--rouge)] mb-3">{t('property.location')}</h3>
                <GoogleMap
                  latitude={property.latitude || 31.6295}
                  longitude={property.longitude || -7.9811}
                  address={`${property.address}, ${property.neighborhood}`}
                  className="h-64 w-full rounded-xl border border-[var(--border)]"
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar — Agent Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[var(--border)] p-6 sticky top-28"
            >
              <h3 className="font-display text-lg font-bold text-[var(--rouge)] mb-4">{t('property.contactAgent')}</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[var(--rouge)] flex items-center justify-center overflow-hidden shrink-0">
                  {agentProfile?.avatar_url
                    ? <img src={agentProfile.avatar_url} alt={agentProfile.full_name ?? ''} className="w-full h-full object-cover" />
                    : <span className="text-white font-semibold text-sm">
                        {(agentProfile?.full_name || property.agentName)?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AG'}
                      </span>
                  }
                </div>
                <div>
                  <div className="font-medium text-[var(--rouge)]">{agentProfile?.full_name || property.agentName || 'Agent'}</div>
                  <div className="text-xs text-[var(--stone)]">Palais Rouge Immo</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a href={`tel:${agentProfile?.phone ?? agencyPhone}`} className="flex items-center gap-3 p-3 bg-[var(--parchment)] rounded-lg hover:bg-[var(--border)] transition-colors">
                  <Phone className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-sm text-[var(--rouge)]">{agentProfile?.phone ?? agencyPhone}</span>
                </a>
                <a href="mailto:contact@palaisrouge.online" className="flex items-center gap-3 p-3 bg-[var(--parchment)] rounded-lg hover:bg-[var(--border)] transition-colors">
                  <Mail className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-sm text-[var(--rouge)]">contact@palaisrouge.online</span>
                </a>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://wa.me/${(agentProfile?.whatsapp ?? agencyWhatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par : ${property.title} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Contacter via WhatsApp pour ${property.title}`}
                  onClick={() => trackEvent('whatsapp_click', 'lead', property.title)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-xl transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${agentProfile?.phone ?? agencyPhone}`}
                  aria-label={`Appeler l'agent pour ${property.title}`}
                  onClick={() => trackEvent('call_click', 'lead', property.title)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--rouge)] hover:bg-[var(--rouge-dark)] text-white font-semibold rounded-xl transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Appeler
                </a>
                <Link href="/contact" className="block">
                  <Button className="w-full" variant="outline">{t('property.contactAgent')}</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-[var(--rouge)] mb-6">{t('property.similarProperties')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
