'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logPageView } from '@/lib/logger'

const PAGE_NAMES: Record<string, string> = {
  '/': 'Accueil',
  '/properties': 'Proprietes',
  '/search': 'Recherche',
  '/contact': 'Contact',
  '/valuation': 'Estimation',
  '/resources': 'Blog',
  '/faq': 'FAQ',
  '/sell': 'Vendre',
  '/agents': 'Agents',
  '/calculator': 'Calculateur',
  '/guide/renting': 'Guide Location',
  '/guide/selling': 'Guide Vente',
}

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/agent') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/2fa')
    ) return

    const name = pathname.startsWith('/properties/')
      ? 'Detail Propriete'
      : pathname.startsWith('/resources/')
      ? 'Article Blog'
      : PAGE_NAMES[pathname] ?? pathname

    logPageView(name)
  }, [pathname])

  return null
}
