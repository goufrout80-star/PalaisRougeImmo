export type Role = 'admin' | 'agent' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  bio?: string;
  listings?: number;
  soldProperties?: number;
  createdAt: string;
}

export type ListingType = 'BUY' | 'RENT';
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'VILLA' | 'LAND' | 'COMMERCIAL' | 'RIAD';
export type PropertyStatus = 'AVAILABLE' | 'PENDING' | 'SOLD' | 'RENTED';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: string;
  city: string;
  neighborhood?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  surfaceArea: number;
  yearBuilt?: number;
  hasPool: boolean;
  hasParking: boolean;
  hasGarden: boolean;
  hasAC: boolean;
  hasGym: boolean;
  hasElevator: boolean;
  hasSecurity: boolean;
  images: string[];
  videoUrl?: string;
  virtualTour?: string;
  featured: boolean;
  approved: boolean;
  viewCount: number;
  agentId: string;
  agentName?: string;
  createdAt: string;
}

export interface SearchFilters {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FormEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  date: string;
  read: boolean;
}

export interface SoldProperty {
  id: string;
  title: string;
  price: number;
  buyer: string;
  buyerEmail: string;
  soldDate: string;
  agent: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  mapsUrl: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
}
