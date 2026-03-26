'use client'
import { useState } from 'react'
import { useCities } from '@/hooks/useCities'

interface Props {
  cityValue: string
  neighborhoodValue: string
  onCityChange: (cityId: string, cityName: string) => void
  onNeighborhoodChange: (name: string) => void
}

export function CityNeighborhoodSelect({
  cityValue,
  neighborhoodValue,
  onCityChange,
  onNeighborhoodChange,
}: Props) {
  const { cities, loading, getNeighborhoodsByCity, addCity, addNeighborhood } =
    useCities()

  const [showAddCity, setShowAddCity] = useState(false)
  const [showAddNeighborhood, setShowAddNeighborhood] = useState(false)
  const [newCityName, setNewCityName] = useState('')
  const [newNeighborhoodName, setNewNeighborhoodName] = useState('')
  const [adding, setAdding] = useState(false)

  const selectedCity = cities.find((c) => c.id === cityValue)
  const neighborhoods = selectedCity ? getNeighborhoodsByCity(selectedCity.id) : []

  const handleAddCity = async () => {
    if (!newCityName.trim()) return
    setAdding(true)
    const city = await addCity(newCityName.trim())
    if (city) {
      onCityChange(city.id, city.name_fr)
      setNewCityName('')
      setShowAddCity(false)
    }
    setAdding(false)
  }

  const handleAddNeighborhood = async () => {
    if (!newNeighborhoodName.trim() || !cityValue) return
    setAdding(true)
    const n = await addNeighborhood(cityValue, newNeighborhoodName.trim())
    if (n) {
      onNeighborhoodChange(n.name_fr)
      setNewNeighborhoodName('')
      setShowAddNeighborhood(false)
    }
    setAdding(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 animate-pulse bg-[var(--linen)] rounded-lg" />
        <div className="h-10 animate-pulse bg-[var(--linen)] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {/* City selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--charcoal)]">
            Ville
          </label>
          <select
            value={cityValue}
            onChange={(e) => {
              const city = cities.find((c) => c.id === e.target.value)
              onCityChange(e.target.value, city?.name_fr ?? '')
              onNeighborhoodChange('')
            }}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--rouge)] bg-white"
          >
            <option value="">-- Choisir une ville</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name_fr}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddCity(!showAddCity)}
            className="text-xs text-[var(--rouge)] hover:underline"
          >
            + Ajouter une ville
          </button>
          {showAddCity && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Nom de la ville"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="flex-1 border border-[var(--border)] rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--rouge)]"
              />
              <button
                type="button"
                onClick={handleAddCity}
                disabled={adding}
                className="bg-[var(--rouge)] text-white text-xs px-3 py-1 rounded disabled:opacity-50"
              >
                {adding ? '...' : 'OK'}
              </button>
            </div>
          )}
        </div>

        {/* Neighborhood selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--charcoal)]">
            Quartier
          </label>
          <select
            value={neighborhoodValue}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            disabled={!cityValue}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--rouge)] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Choisir un quartier</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.name_fr}>
                {n.name_fr}
              </option>
            ))}
          </select>
          {cityValue && (
            <button
              type="button"
              onClick={() => setShowAddNeighborhood(!showAddNeighborhood)}
              className="text-xs text-[var(--rouge)] hover:underline"
            >
              + Ajouter un quartier
            </button>
          )}
          {showAddNeighborhood && cityValue && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Nom du quartier"
                value={newNeighborhoodName}
                onChange={(e) => setNewNeighborhoodName(e.target.value)}
                className="flex-1 border border-[var(--border)] rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--rouge)]"
              />
              <button
                type="button"
                onClick={handleAddNeighborhood}
                disabled={adding}
                className="bg-[var(--rouge)] text-white text-xs px-3 py-1 rounded disabled:opacity-50"
              >
                {adding ? '...' : 'OK'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
