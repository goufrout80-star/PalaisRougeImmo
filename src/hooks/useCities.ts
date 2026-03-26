'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface City {
  id: string
  name_fr: string
  name_en: string
  name_ar: string
  slug: string
}

export interface Neighborhood {
  id: string
  city_id: string
  name_fr: string
  name_en: string
  name_ar: string
  slug: string
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('cities').select('*').eq('is_active', true).order('name_fr'),
      supabase.from('neighborhoods').select('*').eq('is_active', true).order('name_fr'),
    ]).then(([{ data: c }, { data: n }]) => {
      setCities(c ?? [])
      setNeighborhoods(n ?? [])
      setLoading(false)
    })
  }, [])

  const getNeighborhoodsByCity = (cityId: string) =>
    neighborhoods.filter((n) => n.city_id === cityId)

  const addCity = async (name_fr: string) => {
    const supabase = createClient()
    const slug = name_fr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
    const { data } = await supabase
      .from('cities')
      .insert({ name_fr, name_en: name_fr, name_ar: name_fr, slug })
      .select()
      .single()
    if (data) setCities((prev) => [...prev, data])
    return data
  }

  const addNeighborhood = async (city_id: string, name_fr: string) => {
    const supabase = createClient()
    const slug = `${name_fr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')}-${Date.now()}`
    const { data } = await supabase
      .from('neighborhoods')
      .insert({ city_id, name_fr, name_en: name_fr, name_ar: name_fr, slug })
      .select()
      .single()
    if (data) setNeighborhoods((prev) => [...prev, data])
    return data
  }

  return {
    cities,
    neighborhoods,
    loading,
    getNeighborhoodsByCity,
    addCity,
    addNeighborhood,
  }
}
