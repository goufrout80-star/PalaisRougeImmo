'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Building2,
  CheckCircle,
  TrendingUp,
  Plus,
  Shield,
  User,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  LogOut,
  Edit,
  Trash2,
  Check,
  Menu,
  Camera,
  ExternalLink,
  Pencil,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  TableRowSkeleton,
  StatSkeleton,
} from '@/components/ui/Skeleton'

type Tab = 'overview' | 'properties' | 'leads' | 'profile' | 'security'

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: "Vue d'ensemble",  icon: TrendingUp  },
  { id: 'properties',  label: 'Mes propriétés',  icon: Building2   },
  { id: 'leads',       label: 'Leads reçus',     icon: MessageSquare },
  { id: 'profile',     label: 'Mon profil',      icon: User        },
  { id: 'security',    label: 'Sécurité',        icon: Shield      },
]

export default function AgentDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const supabase = createClient()

  const [activeTab, setActiveTab]       = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [loading, setLoading]           = useState(true)

  const [stats, setStats]               = useState({ active: 0, sold: 0, rented: 0 })
  const [properties, setProperties]     = useState<any[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [leads, setLeads]               = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)

  const [profile, setProfile] = useState({
    full_name:  '',
    phone:      '',
    whatsapp:   '',
    bio:        '',
    avatar_url: '',
  })
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [has2FA,    setHas2FA]    = useState(false)
  const [loading2FA, setLoading2FA] = useState(true)

  const [editingPriceId,    setEditingPriceId]    = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'agent' && user?.role !== 'admin'))) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, user, router])

  const loadStats = useCallback(async () => {
    if (!user) return
    const [{ count: active }, { count: sold }, { count: rented }] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('agent_id', user.id).eq('status', 'available'),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('agent_id', user.id).eq('status', 'sold'),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('agent_id', user.id).eq('status', 'rented'),
    ])
    setStats({ active: active ?? 0, sold: sold ?? 0, rented: rented ?? 0 })
  }, [user, supabase])

  const loadProperties = useCallback(async () => {
    if (!user) return
    setLoadingProps(true)
    const { data } = await supabase.from('properties').select('*').eq('agent_id', user.id).order('created_at', { ascending: false })
    setProperties(data ?? [])
    setLoadingProps(false)
  }, [user, supabase])

  const loadLeads = useCallback(async () => {
    if (!user) return
    setLoadingLeads(true)
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) console.error('[Agent] leads error:', error)
    setLeads(data ?? [])
    setLoadingLeads(false)
  }, [user, supabase])

  const check2FA = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors()
    setHas2FA(data?.totp?.some((f: any) => f.status === 'verified') ?? false)
    setLoading2FA(false)
  }, [supabase])

  useEffect(() => {
    if (!user) return
    setProfile({
      full_name:  user.name ?? '',
      phone:      user.phone ?? '',
      whatsapp:   (user as any).whatsapp ?? '',
      bio:        user.bio ?? '',
      avatar_url: user.avatar ?? '',
    })
    Promise.all([loadStats(), loadProperties(), loadLeads(), check2FA()]).then(() => setLoading(false))
  }, [user])

  // Real-time: contact submissions for agent's properties
  useEffect(() => {
    const channel = supabase
      .channel('agent_contacts_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_submissions' }, (payload) => {
        setLeads(prev => [payload.new as any, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'properties') loadProperties()
    if (tab === 'leads') loadLeads()
    if (tab === 'overview') { loadStats(); loadProperties(); loadLeads() }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Supprimer cette propriété ?')) return
    await fetch('/api/properties', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setProperties((prev) => prev.filter((p) => p.id !== id))
    loadStats()
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    await Promise.all([
      supabase.auth.updateUser({
        data: {
          full_name:  profile.full_name,
          name:       profile.full_name,
          phone:      profile.phone,
          whatsapp:   profile.whatsapp,
          bio:        profile.bio,
          avatar_url: profile.avatar_url,
        },
      }),
      supabase.from('agent_profiles').upsert({
        id:         user!.id,
        full_name:  profile.full_name,
        avatar_url: profile.avatar_url,
        phone:      profile.phone,
        whatsapp:   profile.whatsapp,
        bio:        profile.bio,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' }),
    ])
    setSavingProfile(false)
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'agents')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        const newUrl = data.url
        setProfile((p) => ({ ...p, avatar_url: newUrl }))
        await Promise.all([
          supabase.auth.updateUser({ data: { avatar_url: newUrl } }),
          supabase.from('agent_profiles').upsert({ id: user!.id, avatar_url: newUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' }),
        ])
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleMarkLeadRead = async (id: string) => {
    await fetch('/api/admin/mutations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', table: 'contact_submissions', data: { is_read: true }, id }) })
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, is_read: true } : l)))
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--rouge)]" />
      </div>
    )
  }

  const unreadCount = leads.filter((l) => !l.is_read).length
  const initials    = (profile.full_name || user.email || 'A').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const tabLabel    = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? ''

  return (
    <div className="flex min-h-screen bg-[var(--parchment)]">

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--border)] flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Palais Rouge Immo" width={36} height={36} />
            <div>
              <div className="font-display text-sm font-bold text-[var(--rouge)] leading-tight">Palais Rouge Immo</div>
              <div className="text-[9px] text-[var(--gold-light)] font-semibold tracking-[0.2em] uppercase">Marrakech</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="px-3 mb-2 text-[10px] font-semibold text-[var(--stone)] uppercase tracking-wider">Espace Agent</div>
          {NAV_ITEMS.map((item) => {
            const Icon     = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { handleTabChange(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors cursor-pointer ${
                  isActive ? 'bg-[var(--rouge)] text-white' : 'text-[var(--charcoal)] hover:bg-[var(--parchment)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'leads' && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[var(--rouge)] flex items-center justify-center shrink-0 overflow-hidden">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-white text-xs font-semibold">{initials}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--rouge)] truncate">{profile.full_name || user.email}</div>
              <div className="text-[10px] text-[var(--gold-light)] font-semibold uppercase">Agent</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Mobile menu trigger (only visible on small screens) */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-[var(--border)] h-12 flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-[var(--parchment)] text-[var(--charcoal)]">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-[var(--noir)]">{tabLabel}</span>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-6 space-y-6">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-[var(--noir)]">Vue d'ensemble</h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-4">
                        <StatSkeleton />
                      </div>
                    ))
                  : [
                      { label: 'Annonces actives', value: stats.active,    icon: Building2,     color: 'text-[var(--rouge)]' },
                      { label: 'Biens vendus',      value: stats.sold,     icon: CheckCircle,   color: 'text-green-600'       },
                      { label: 'Biens loués',       value: stats.rented,   icon: TrendingUp,    color: 'text-blue-600'        },
                      { label: 'Leads reçus',       value: leads.length,   icon: MessageSquare, color: 'text-amber-600'       },
                    ].map((s) => {
                      const Icon = s.icon
                      return (
                        <div key={s.label} className="bg-white rounded-xl border border-[var(--border)] p-4">
                          <Icon size={20} className={s.color} />
                          <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
                        </div>
                      )
                    })
                }
              </div>

              {/* Recent leads */}
              <div className="bg-white rounded-xl border border-[var(--border)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[var(--noir)]">Derniers leads</h2>
                  <button onClick={() => handleTabChange('leads')} className="text-xs text-[var(--rouge)] hover:underline">
                    Voir tout →
                  </button>
                </div>
                {loadingLeads ? (
                  <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse bg-[var(--linen)] rounded-lg" />)}</div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto text-[var(--muted)] mb-2 opacity-40" />
                    <p className="text-sm text-[var(--muted)]">Aucun lead pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 4).map((lead) => (
                      <div key={lead.id} className={`flex items-center gap-3 p-3 rounded-lg ${lead.is_read ? 'bg-[var(--parchment)]' : 'bg-[var(--rouge-tint)] border border-[var(--rouge)]/20'}`}>
                        <div className="w-8 h-8 rounded-full bg-[var(--rouge)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {lead.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--noir)] truncate">{lead.name}</p>
                            {lead.property_id ? (
                              <span className="text-[10px] bg-[var(--rouge-tint)] text-[var(--rouge)] px-2 py-0.5 rounded-full font-medium shrink-0">Propri&eacute;t&eacute;</span>
                            ) : (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium shrink-0">Contact g&eacute;n&eacute;ral</span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted)] truncate">{lead.property_title ?? 'Contact g\u00e9n\u00e9ral'}</p>
                        </div>
                        {!lead.is_read && <span className="w-2 h-2 rounded-full bg-[var(--rouge)] shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-[var(--border)] p-6">
                <h2 className="font-semibold text-[var(--noir)] mb-4">Actions rapides</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/properties/new" className="flex items-center gap-3 p-4 border border-[var(--border)] rounded-xl hover:border-[var(--rouge)] hover:bg-[var(--rouge-tint)] transition-colors">
                    <Plus size={20} className="text-[var(--rouge)]" />
                    <span className="text-sm font-medium text-[var(--charcoal)]">Nouvelle propriété</span>
                  </Link>
                  <button onClick={() => handleTabChange('leads')} className="flex items-center gap-3 p-4 border border-[var(--border)] rounded-xl hover:border-[var(--rouge)] hover:bg-[var(--rouge-tint)] transition-colors">
                    <MessageSquare size={20} className="text-[var(--rouge)]" />
                    <span className="text-sm font-medium text-[var(--charcoal)]">Voir les leads</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ PROPERTIES ═══ */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-[var(--noir)]">Mes propriétés</h1>
                <Link href="/properties/new" className="flex items-center gap-2 bg-[var(--rouge)] hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity">
                  <Plus size={16} /> Ajouter
                </Link>
              </div>

              {loadingProps ? (
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full"><tbody>{[1,2,3,4].map((i) => <TableRowSkeleton key={i} cols={5} />)}</tbody></table>
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--border)] p-16 text-center">
                  <Building2 size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-30" />
                  <p className="text-[var(--charcoal)] font-medium mb-2">Aucune propriété pour le moment</p>
                  <Link href="/properties/new" className="inline-flex items-center gap-2 bg-[var(--rouge)] text-white px-6 py-3 rounded-lg font-semibold text-sm mt-4">
                    <Plus size={16} /> Ajouter une propriété
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--parchment)]">
                        <th className="text-left px-4 py-3 font-medium text-[var(--muted)]">Propriété</th>
                        <th className="text-left px-4 py-3 font-medium text-[var(--muted)] hidden md:table-cell">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-[var(--muted)]">Prix</th>
                        <th className="text-left px-4 py-3 font-medium text-[var(--muted)] hidden md:table-cell">Statut</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--parchment)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.title_fr ?? p.title} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                                : <div className="w-12 h-10 rounded-lg bg-[var(--linen)] flex items-center justify-center shrink-0"><Building2 size={16} className="text-[var(--muted)]" /></div>
                              }
                              <div className="min-w-0">
                                <p className="font-medium text-[var(--noir)] truncate max-w-[160px]">{p.title_fr ?? p.title}</p>
                                <p className="text-xs text-[var(--muted)] truncate">{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-[var(--charcoal)]">{p.property_type ?? p.propertyType}</td>
                          <td className="px-4 py-3">
                            {editingPriceId === p.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editingPriceValue}
                                  onChange={(e) => setEditingPriceValue(e.target.value)}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      await fetch('/api/properties', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, price: Number(editingPriceValue) }) })
                                      setProperties((prev) => prev.map((prop) => prop.id === p.id ? { ...prop, price: Number(editingPriceValue) } : prop))
                                      setEditingPriceId(null)
                                    }
                                    if (e.key === 'Escape') setEditingPriceId(null)
                                  }}
                                  autoFocus
                                  className="w-28 border border-[var(--rouge)] rounded px-2 py-1 text-xs font-semibold text-[var(--rouge)] focus:outline-none"
                                />
                                <button onClick={async () => {
                                  await fetch('/api/properties', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, price: Number(editingPriceValue) }) })
                                  setProperties((prev) => prev.map((prop) => prop.id === p.id ? { ...prop, price: Number(editingPriceValue) } : prop))
                                  setEditingPriceId(null)
                                }} className="text-green-600 hover:text-green-700 p-1"><Check size={14} /></button>
                                <button onClick={() => setEditingPriceId(null)} className="text-[var(--muted)] hover:text-red-500 p-1"><X size={14} /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/price">
                                <span className="font-semibold text-[var(--rouge)]">{p.price?.toLocaleString('fr-MA')} MAD</span>
                                <button onClick={() => { setEditingPriceId(p.id); setEditingPriceValue(p.price ? String(p.price) : '') }}
                                  className="opacity-0 group-hover/price:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--linen)] text-[var(--muted)] hover:text-[var(--rouge)]">
                                  <Pencil size={11} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <select
                              value={p.status?.toLowerCase() ?? 'available'}
                              onChange={async (e) => {
                                const newStatus = e.target.value
                                await fetch('/api/properties', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, status: newStatus }) })
                                setProperties((prev) => prev.map((prop) => prop.id === p.id ? { ...prop, status: newStatus } : prop))
                              }}
                              className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--rouge)] appearance-none ${
                                (p.status?.toLowerCase() ?? '') === 'available' ? 'bg-green-100 text-green-700'
                                : (p.status?.toLowerCase() ?? '') === 'sold' ? 'bg-gray-100 text-gray-600'
                                : (p.status?.toLowerCase() ?? '') === 'rented' ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              <option value="available">Disponible</option>
                              <option value="sold">Vendu</option>
                              <option value="rented">Loué</option>
                              <option value="reserved">Réservé</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <Link href={`/properties/${p.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-[var(--linen)] text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors">
                                <ExternalLink size={15} />
                              </Link>
                              <Link href={`/properties/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-[var(--linen)] text-[var(--muted)] hover:text-[var(--rouge)] transition-colors">
                                <Edit size={15} />
                              </Link>
                              <button onClick={() => handleDeleteProperty(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-600 transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ LEADS ═══ */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-[var(--noir)]">Leads reçus</h1>
                {unreadCount > 0 && <span className="text-sm text-[var(--muted)]">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</span>}
              </div>

              {loadingLeads ? (
                <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full"><tbody>{[1,2,3,4,5].map((i) => <TableRowSkeleton key={i} cols={4} />)}</tbody></table>
                </div>
              ) : leads.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--border)] p-16 text-center">
                  <MessageSquare size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-30" />
                  <p className="text-[var(--charcoal)] font-medium">Aucun lead pour le moment</p>
                  <p className="text-sm text-[var(--muted)] mt-1">Les demandes de contact sur vos biens apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className={`bg-white rounded-xl border p-5 transition-colors ${lead.is_read ? 'border-[var(--border)]' : 'border-[var(--rouge)]/30 bg-[var(--rouge-tint)]/30'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--rouge)] flex items-center justify-center text-white font-bold shrink-0">
                            {lead.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[var(--noir)]">{lead.name}</p>
                              {!lead.is_read && <span className="text-xs bg-[var(--rouge)] text-white px-2 py-0.5 rounded-full font-medium">Nouveau</span>}
                              {lead.property_id ? (
                                <span className="text-xs bg-[var(--rouge-tint)] text-[var(--rouge)] px-2 py-0.5 rounded-full font-medium">Propri&eacute;t&eacute;</span>
                              ) : (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Contact g&eacute;n&eacute;ral</span>
                              )}
                            </div>
                            {lead.property_title && <p className="text-xs text-[var(--rouge)] mt-0.5">{lead.property_title}</p>}
                            <p className="text-sm text-[var(--charcoal)] mt-2">{lead.message}</p>
                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-[var(--charcoal)] hover:text-[var(--rouge)]">
                                  <Phone size={12} />{lead.phone}
                                </a>
                              )}
                              {lead.email && (
                                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-[var(--charcoal)] hover:text-[var(--rouge)]">
                                  <Mail size={12} />{lead.email}
                                </a>
                              )}
                              <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                <Calendar size={12} />{new Date(lead.created_at).toLocaleDateString('fr-MA')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!lead.is_read && (
                          <button onClick={() => handleMarkLeadRead(lead.id)} className="shrink-0 p-2 rounded-lg hover:bg-green-50 text-[var(--muted)] hover:text-green-600 transition-colors" title="Marquer comme lu">
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ PROFILE ═══ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-[var(--noir)]">Mon profil</h1>

              <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-6">

                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full bg-[var(--rouge)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden group cursor-pointer"
                      title="Changer la photo"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                      ) : profile.avatar_url ? (
                        <>
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={20} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <span>{initials}</span>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={20} className="text-white" />
                          </div>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--noir)]">{profile.full_name || 'Agent'}</p>
                    <p className="text-sm text-[var(--muted)]">{user.email}</p>
                    <p className="text-xs text-[var(--stone)] mt-1">Cliquez sur la photo pour la modifier</p>
                  </div>
                </div>

                <hr className="border-[var(--border)]" />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--charcoal)]">Nom complet</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--rouge)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--charcoal)]">Téléphone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--rouge)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--charcoal)]">WhatsApp</label>
                    <input
                      type="tel"
                      value={profile.whatsapp}
                      onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--rouge)]"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-[var(--charcoal)]">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Décrivez votre expérience..."
                      className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--rouge)] resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-[var(--rouge)] hover:opacity-90 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-opacity disabled:opacity-50"
                  >
                    {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  {profileSuccess && (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                      <Check size={16} />
                      Profil mis à jour ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SECURITY ═══ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-[var(--noir)]">Sécurité</h1>

              <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-6">
                {/* 2FA */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[var(--noir)]">Authentification à deux facteurs (2FA)</p>
                    <p className="text-sm text-[var(--muted)] mt-0.5">
                      {loading2FA ? 'Vérification...' : has2FA ? 'Activée — votre compte est protégé' : "Désactivée — nous recommandons de l'activer"}
                    </p>
                  </div>
                  {!loading2FA && (
                    has2FA
                      ? <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-full shrink-0">Activée</span>
                      : <Link href="/2fa/setup" className="bg-[var(--rouge)] hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity shrink-0">Activer</Link>
                  )}
                </div>

                <hr className="border-[var(--border)]" />

                <div>
                  <p className="font-medium text-[var(--noir)]">Adresse email</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{user.email}</p>
                </div>

                <hr className="border-[var(--border)]" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[var(--noir)]">Déconnexion</p>
                    <p className="text-sm text-[var(--muted)] mt-0.5">Se déconnecter de tous les appareils</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
