'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property, ListingType, PropertyType, PropertyStatus } from '@/types';

interface PropertiesContextType {
  properties: Property[];
  allProperties: Property[];
  isLoading: boolean;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'viewCount'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
  getPropertiesByAgent: (agentId: string) => Property[];
  getFeaturedProperties: () => Property[];
  getAvailableProperties: () => Property[];
  incrementViewCount: (id: string) => void;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

const LISTING_TYPE_MAP: Record<string, ListingType> = { sale: 'BUY', rent: 'RENT' };
const LISTING_TYPE_REVERSE: Record<ListingType, string> = { BUY: 'sale', RENT: 'rent' };
const STATUS_MAP: Record<string, PropertyStatus> = {
  available: 'AVAILABLE', sold: 'SOLD', rented: 'RENTED', reserved: 'PENDING',
};
const STATUS_REVERSE: Record<PropertyStatus, string> = {
  AVAILABLE: 'available', SOLD: 'sold', RENTED: 'rented', PENDING: 'reserved',
};
const PROP_TYPE_MAP: Record<string, PropertyType> = {
  house: 'HOUSE', apartment: 'APARTMENT', villa: 'VILLA', land: 'LAND', commercial: 'COMMERCIAL', riad: 'RIAD',
  HOUSE: 'HOUSE', APARTMENT: 'APARTMENT', VILLA: 'VILLA', LAND: 'LAND', COMMERCIAL: 'COMMERCIAL', RIAD: 'RIAD',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Property {
  const features: string[] = row.features ?? [];
  return {
    id: row.id,
    title: row.title_fr ?? '',
    description: row.description_fr ?? '',
    price: Number(row.price) || 0,
    listingType: LISTING_TYPE_MAP[row.listing_type] ?? 'BUY',
    propertyType: PROP_TYPE_MAP[row.property_type] ?? 'APARTMENT',
    status: STATUS_MAP[row.status] ?? 'AVAILABLE',
    address: row.location ?? '',
    city: row.city ?? 'Marrakech',
    neighborhood: row.neighborhood ?? undefined,
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    surfaceArea: Number(row.area_sqm) || 0,
    yearBuilt: row.year_built != null ? Number(row.year_built) : undefined,
    hasPool: features.includes('pool'),
    hasParking: features.includes('parking'),
    hasGarden: features.includes('garden'),
    hasAC: features.includes('ac'),
    hasGym: features.includes('gym'),
    hasElevator: features.includes('elevator'),
    hasSecurity: features.includes('security'),
    images: row.images ?? [],
    featured: Boolean(row.is_featured),
    approved: Boolean(row.is_published),
    viewCount: row.view_count ?? 0,
    agentId: row.agent_id ?? '',
    agentName: row.agent_name ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function toRow(property: Omit<Property, 'id' | 'createdAt' | 'viewCount'>) {
  const features: string[] = [];
  if (property.hasPool) features.push('pool');
  if (property.hasParking) features.push('parking');
  if (property.hasGarden) features.push('garden');
  if (property.hasAC) features.push('ac');
  if (property.hasGym) features.push('gym');
  if (property.hasElevator) features.push('elevator');
  if (property.hasSecurity) features.push('security');
  return {
    title_fr: property.title,
    description_fr: property.description,
    price: property.price,
    listing_type: LISTING_TYPE_REVERSE[property.listingType],
    property_type: property.propertyType.toLowerCase(),
    status: STATUS_REVERSE[property.status],
    location: property.address,
    city: property.city,
    neighborhood: property.neighborhood,
    area_sqm: property.surfaceArea,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    year_built: property.yearBuilt ?? null,
    images: property.images,
    features,
    is_featured: property.featured,
    is_published: property.approved,
  };
}

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProperties((data ?? []).map(fromRow));
      } catch (err) {
        console.error('[PropertiesContext] fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, [supabase]);

  const refreshProperties = useCallback(async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    setProperties((data ?? []).map(fromRow));
  }, [supabase]);

  const addProperty = useCallback(async (property: Omit<Property, 'id' | 'createdAt' | 'viewCount'>) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toRow(property)),
      });
      if (!res.ok) { const e = await res.json(); console.error('[PropertiesContext] addProperty:', e); return null; }
      const data = await res.json();
      await refreshProperties();
      return fromRow(data);
    } catch (err) { console.error('[PropertiesContext] addProperty:', err); return null; }
  }, [refreshProperties]);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    const current = properties.find(p => p.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...toRow(merged) }),
      });
      if (!res.ok) { const e = await res.json(); console.error('[PropertiesContext] updateProperty:', e); return; }
      await refreshProperties();
    } catch (err) { console.error('[PropertiesContext] updateProperty:', err); }
  }, [properties, refreshProperties]);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { const e = await res.json(); console.error('[PropertiesContext] deleteProperty:', e); return; }
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error('[PropertiesContext] deleteProperty:', err); }
  }, []);

  const getProperty = useCallback((id: string) => {
    return properties.find(p => p.id === id);
  }, [properties]);

  const getPropertiesByAgent = useCallback((agentId: string) => {
    return properties.filter(p => p.agentId === agentId);
  }, [properties]);

  const getFeaturedProperties = useCallback(() => {
    return properties.filter(p => p.featured && p.approved && p.status === 'AVAILABLE');
  }, [properties]);

  const getAvailableProperties = useCallback(() => {
    return properties.filter(p => p.status === 'AVAILABLE' && p.approved);
  }, [properties]);

  const allProperties = properties;

  const incrementViewCount = useCallback((id: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, viewCount: p.viewCount + 1 } : p));
    fetch(`/api/properties/${id}/view`, { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        allProperties,
        isLoading,
        addProperty,
        updateProperty,
        deleteProperty,
        getProperty,
        getPropertiesByAgent,
        getFeaturedProperties,
        getAvailableProperties,
        incrementViewCount,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
}
