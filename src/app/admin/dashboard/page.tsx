'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Key, FileText, HelpCircle, Phone,
  Inbox, List, CheckCircle2, LogOut, Menu, X, ExternalLink,
  Plus, Pencil, Trash2, Eye, ChevronRight, Search, TrendingUp,
  Users, Send, ClipboardList, Check, Mail, MessageSquare, Filter, Download,
  Activity, RefreshCw,
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import { Property, BlogPost, FaqItem, FormEntry, SoldProperty, ContactInfo } from '@/types';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { logAdminAction } from '@/lib/logger';

type Section = 'dashboard' | 'properties-sell' | 'properties-rent' | 'blog' | 'faqs' | 'contact-social' | 'received-forms' | 'active-listings' | 'sold-properties' | 'valuations' | 'agents' | 'newsletter' | 'activity_log';

const SIDEBAR_ITEMS: { group: string; items: { key: Section; label: string; icon: React.ElementType }[] }[] = [
  { group: '', items: [{ key: 'dashboard', label: 'admin.dashboard', icon: LayoutDashboard }] },
  { group: 'admin.content', items: [
    { key: 'properties-sell', label: 'admin.propertiesSell', icon: Building2 },
    { key: 'properties-rent', label: 'admin.propertiesRent', icon: Key },
    { key: 'blog', label: 'admin.blogPosts', icon: FileText },
    { key: 'faqs', label: 'admin.faqs', icon: HelpCircle },
  ]},
  { group: 'admin.settings', items: [
    { key: 'contact-social', label: 'admin.contactSocial', icon: Phone },
    { key: 'agents', label: 'admin.agents', icon: Users },
    { key: 'newsletter', label: 'Newsletter', icon: Mail },
  ]},
  { group: 'admin.activity', items: [
    { key: 'received-forms', label: 'admin.receivedForms', icon: Inbox },
    { key: 'valuations', label: 'admin.valuations', icon: ClipboardList },
    { key: 'active-listings', label: 'admin.activeListings', icon: List },
    { key: 'sold-properties', label: 'admin.soldProperties', icon: CheckCircle2 },
    { key: 'activity_log', label: "Journal d'activit\u00e9", icon: Activity },
  ]},
];

export default function AdminDashboardPage() {
  const { t, formatCurrency } = useI18n();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { properties, deleteProperty } = useProperties();
  const router = useRouter();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [formEntries, setFormEntries] = useState<any[]>([]);
  const [soldProperties, setSoldProperties] = useState<SoldProperty[]>([]);
  const [valuations, setValuations] = useState<any[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [resetEmailStatus, setResetEmailStatus] = useState<Record<string, string>>({});
  const [dbStats, setDbStats] = useState({ totalProperties: 0, totalLeads: 0, totalValuations: 0 });
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'contact@palaisrouge.online',
    phone: '+212 524 43 00 00',
    whatsapp: '',
    address: 'Bd Abdelkrim Al Khattabi, Marrakech 40000, Morocco',
    mapsUrl: 'https://maps.google.com/?q=Marrakech+Morocco',
    instagram: 'https://instagram.com/palaisrougeimmo',
    facebook: 'https://facebook.com/palaisrougeimmo',
    linkedin: 'https://linkedin.com/company/palaisrougeimmo',
    twitter: 'https://twitter.com/palaisrougeimmo',
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'blog' | 'faq' | null>(null);
  const [editingItem, setEditingItem] = useState<BlogPost | FaqItem | null>(null);

  // Blog form
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    author: '',
    content: '',
    coverImage: '',
    isPublished: false,
    publishedAt: null as string | null,
  });
  // FAQ form
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'buying' });

  // Active listings filter
  const [listingsFilter, setListingsFilter] = useState<'all' | 'sale' | 'rent'>('all');

  // Inline price editing
  const [editingPriceId,    setEditingPriceId]    = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  // Activity log state
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [logTimeFilter, setLogTimeFilter] = useState<string>('1h');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [contactsRes, blogsRes, valuationsRes, settingsRes, faqsRes, agentsRes, countsRes, soldRes, nlRes] = await Promise.all([
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('valuation_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('key, value'),
        supabase.from('faq_items').select('*').order('sort_order', { ascending: true }),
        fetch('/api/admin/agents').then(r => r.json()),
        Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('valuation_requests').select('*', { count: 'exact', head: true }),
        ]),
        supabase.from('properties').select('*').eq('status', 'sold').order('updated_at', { ascending: false }),
        supabase.from('newsletter').select('*').order('subscribed_at', { ascending: false }),
      ]);
      if (contactsRes.data) setFormEntries(contactsRes.data);
      if (blogsRes.data) setBlogPosts(blogsRes.data);
      if (valuationsRes.data) setValuations(valuationsRes.data);
      if (faqsRes.data) {
        setFaqs(faqsRes.data.map((f: any) => ({ id: f.id, question: f.question_fr ?? f.question ?? '', answer: f.answer_fr ?? f.answer ?? '', category: f.category ?? 'buying' })));
      }
      if (agentsRes.agents) setAgentsList(agentsRes.agents);
      setSoldProperties((soldRes.data ?? []).map((p: any) => ({ id: p.id, title: p.title_fr ?? '', price: Number(p.price) || 0, buyer: '', buyerEmail: '', agent: '', soldDate: p.updated_at ?? p.created_at })));
      setNewsletterSubs(nlRes.data ?? []);
      if (settingsRes.data) {
        const map: Record<string, string> = {};
        settingsRes.data.forEach(({ key, value }: { key: string; value: string }) => { map[key] = value; });
        setContactInfo(prev => ({
          ...prev,
          phone: map['agency_phone'] ?? prev.phone,
          email: map['agency_email'] ?? prev.email,
          address: map['agency_address'] ?? prev.address,
          mapsUrl: map['maps_url'] ?? prev.mapsUrl,
          whatsapp: map['agency_whatsapp'] ?? prev.whatsapp ?? '',
          instagram: map['instagram'] ?? prev.instagram,
          facebook: map['facebook'] ?? prev.facebook,
          linkedin: map['linkedin'] ?? prev.linkedin,
          twitter: map['twitter'] ?? prev.twitter,
        }));
      }
      const [propsCount, leadsCount, valuationsCount] = countsRes;
      setDbStats({
        totalProperties: propsCount.count ?? 0,
        totalLeads: leadsCount.count ?? 0,
        totalValuations: valuationsCount.count ?? 0,
      });
    } catch (err) {
      console.error('[Admin] fetchAll error:', err);
    } finally {
      setLoadingData(false);
    }
  }, [supabase]);

  const fetchLogs = useCallback(async (timeFilter = '1h') => {
    setLogLoading(true);
    const hours: Record<string, number> = { '30m': 0.5, '1h': 1, '2h': 2, '6h': 6, '24h': 24, '7d': 168 };
    const hoursAgo = hours[timeFilter] ?? 1;
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500);
    setActivityLogs(data ?? []);
    setLogLoading(false);
  }, [supabase]);

  useEffect(() => { fetchAll(); fetchLogs('1h'); }, [fetchAll, fetchLogs]);

  // Real-time: activity logs
  useEffect(() => {
    const channel = supabase
      .channel('activity_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setActivityLogs(prev => [payload.new as any, ...prev].slice(0, 500));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // Real-time: contact submissions
  useEffect(() => {
    const channel = supabase
      .channel('contact_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_submissions' }, (payload) => {
        setFormEntries(prev => [payload.new as any, ...prev]);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Nouveau contact — Palais Rouge', { body: `${(payload.new as any).name} a envoye un message` });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-light)]" /></div>;
  }

  const sellProperties = properties.filter(p => p.listingType === 'BUY');
  const rentProperties = properties.filter(p => p.listingType === 'RENT');
  const totalRevenue = soldProperties.reduce((sum, p) => sum + p.price, 0);
  const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);

  // Activity log helpers
  const getEventIcon = (eventType: string): React.ReactNode => {
    const s = 'w-4 h-4';
    const icons: Record<string, React.ReactNode> = {
      page_view: <Eye className={`${s} text-blue-500`} />,
      whatsapp_click: <MessageSquare className={`${s} text-green-600`} />,
      call_click: <Phone className={`${s} text-amber-600`} />,
      contact_submitted: <Mail className={`${s} text-green-700`} />,
      valuation_submitted: <Building2 className={`${s} text-blue-600`} />,
      newsletter_subscribe: <Mail className={`${s} text-pink-600`} />,
      property_view: <Building2 className={`${s} text-amber-500`} />,
      property_share: <ExternalLink className={`${s} text-indigo-500`} />,
      search_performed: <Search className={`${s} text-indigo-600`} />,
      user_login: <Key className={`${s} text-purple-600`} />,
      user_logout: <LogOut className={`${s} text-purple-400`} />,
      property_created: <Plus className={`${s} text-green-600`} />,
      property_deleted: <Trash2 className={`${s} text-red-500`} />,
      property_status_changed: <RefreshCw className={`${s} text-blue-500`} />,
      blog_saved: <FileText className={`${s} text-blue-600`} />,
      blog_created: <Plus className={`${s} text-green-600`} />,
      blog_deleted: <Trash2 className={`${s} text-red-500`} />,
      client_error: <X className={`${s} text-red-600`} />,
    };
    return icons[eventType] ?? <Activity className={`${s} text-gray-400`} />;
  };
  const getEventLabel = (log: any): string => {
    const labels: Record<string, string> = {
      page_view: 'Page visitee', whatsapp_click: 'Clic WhatsApp', call_click: 'Clic Appeler',
      contact_submitted: 'Formulaire soumis', valuation_submitted: 'Estimation demandee',
      newsletter_subscribe: 'Inscription newsletter', property_view: 'Propriete consultee',
      property_share: 'Propriete partagee', search_performed: 'Recherche effectuee',
      user_login: 'Connexion', user_logout: 'Deconnexion', property_created: 'Propriete creee',
      property_deleted: 'Propriete supprimee', property_status_changed: 'Statut modifie',
      blog_saved: 'Article sauvegarde', blog_created: 'Article cree', blog_deleted: 'Article supprime',
      client_error: 'Erreur client',
    };
    return labels[log.event_type] ?? log.event_type;
  };
  const getCategoryStyle = (category: string): string => {
    const styles: Record<string, string> = {
      navigation: 'bg-blue-100 text-blue-700', contact: 'bg-rose-100 text-rose-700',
      lead: 'bg-green-100 text-green-700', property: 'bg-amber-100 text-amber-700',
      auth: 'bg-purple-100 text-purple-700', admin_action: 'bg-gray-100 text-gray-700',
      error: 'bg-red-100 text-red-700', engagement: 'bg-pink-100 text-pink-700',
      search: 'bg-indigo-100 text-indigo-700',
    };
    return styles[category] ?? 'bg-gray-100 text-gray-600';
  };
  const exportLogs = (timeFilter: string) => {
    const logsToExport = logFilter === 'all' ? activityLogs : activityLogs.filter(l => l.event_category === logFilter);
    const headers = ['Date','Heure','Type','Categorie','Label','Page','Appareil','Utilisateur','Email','IP','Erreur'].join(',');
    const rows = logsToExport.map((l: any) => {
      const d = new Date(l.created_at);
      return [
        d.toLocaleDateString('fr-MA'), d.toLocaleTimeString('fr-MA'),
        l.event_type, l.event_category,
        `"${(l.event_label ?? '').replace(/"/g, "'")}"`,
        `"${(l.page_url ?? '').replace('https://www.palaisrouge.online', '')}"`,
        l.device_type ?? '', l.user_role ?? 'visitor', l.user_email ?? '', l.ip_address ?? '',
        l.is_error ? l.error_message ?? 'oui' : '',
      ].join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-activite-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CRUD helpers
  const saveBlogPost = async (post: any) => {
    const slug = (post.title as string)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const dbFields: Record<string, unknown> = {
      title_fr: post.title,
      excerpt_fr: post.excerpt,
      content_fr: post.content ?? '',
      cover_image: post.coverImage || null,
      is_published: Boolean(post.isPublished),
      published_at: post.isPublished
        ? (post.publishedAt ?? new Date().toISOString())
        : null,
    };
    if (post.id) dbFields.id = post.id;
    else dbFields.slug = slug;
    await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbFields),
    });
    logAdminAction(post.id ? 'blog_saved' : 'blog_created', 'blog', post.title);
    fetchAll();
  };
  const deleteBlogPost = async (id: string) => {
    const blog = blogPosts.find(b => b.id === id);
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    logAdminAction('blog_deleted', 'blog', blog?.title_fr ?? blog?.title);
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };
  const toggleBlogPublish = async (id: string, current: boolean) => {
    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        is_published: !current,
        published_at: !current ? new Date().toISOString() : null,
      }),
    });
    if (res.ok) {
      setBlogPosts(prev => prev.map(b =>
        b.id === id ? { ...b, is_published: !current } : b
      ));
    }
  };
  const saveFaqs = async (items: FaqItem[]) => {
    setFaqs(items);
  };
  const adminMutate = async (action: string, table: string, data?: any, id?: string) => {
    const res = await fetch('/api/admin/mutations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, table, data, id }),
    });
    if (!res.ok) { console.error(`[admin] ${action} ${table} failed:`, await res.text()); return null; }
    return res.json();
  };
  const saveFaqToDB = async (item: FaqItem, isNew: boolean) => {
    if (isNew) {
      const data = await adminMutate('insert', 'faq_items', {
        question_fr: item.question, answer_fr: item.answer, category: item.category,
        is_published: true, sort_order: 0,
      });
      if (data) setFaqs(prev => [{ id: data.id, question: data.question_fr ?? '', answer: data.answer_fr ?? '', category: data.category ?? 'buying' }, ...prev]);
    } else {
      await adminMutate('update', 'faq_items', {
        question_fr: item.question, answer_fr: item.answer, category: item.category,
      }, item.id);
      setFaqs(prev => prev.map(f => f.id === item.id ? { ...f, ...item } : f));
    }
  };
  const deleteFaqFromDB = async (id: string) => {
    await adminMutate('delete', 'faq_items', undefined, id);
    setFaqs(prev => prev.filter(f => f.id !== id));
  };
  const saveContactInfo = async (info: ContactInfo) => {
    setContactInfo(info);
    const rows = [
      { key: 'agency_phone', value: info.phone },
      { key: 'agency_email', value: info.email },
      { key: 'agency_address', value: info.address },
      { key: 'maps_url', value: info.mapsUrl ?? '' },
      { key: 'agency_whatsapp', value: info.whatsapp ?? '' },
      { key: 'instagram', value: info.instagram ?? '' },
      { key: 'facebook', value: info.facebook ?? '' },
      { key: 'linkedin', value: info.linkedin ?? '' },
      { key: 'twitter', value: info.twitter ?? '' },
    ];
    for (const row of rows) {
      await adminMutate('upsert', 'site_settings', row);
    }
  };
  const sendPasswordReset = async (email: string, agentId: string) => {
    setResetEmailStatus(prev => ({ ...prev, [agentId]: 'sending' }));
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResetEmailStatus(prev => ({ ...prev, [agentId]: res.ok ? 'sent' : 'error' }));
    } catch {
      setResetEmailStatus(prev => ({ ...prev, [agentId]: 'error' }));
    }
  };

  const openBlogModal = (post?: any) => {
    setModalType('blog');
    if (post) {
      setEditingItem(post);
      setBlogForm({
        title: post.title_fr ?? post.title ?? '',
        excerpt: post.excerpt_fr ?? post.excerpt ?? '',
        author: post.author ?? '',
        content: post.content_fr ?? '',
        coverImage: post.cover_image ?? '',
        isPublished: Boolean(post.is_published),
        publishedAt: post.published_at ?? null,
      });
    } else {
      setEditingItem(null);
      setBlogForm({ title: '', excerpt: '', author: '', content: '', coverImage: '', isPublished: false, publishedAt: null });
    }
    setShowModal(true);
  };

  const openFaqModal = (faq?: FaqItem) => {
    setModalType('faq');
    if (faq) { setEditingItem(faq); setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category }); }
    else { setEditingItem(null); setFaqForm({ question: '', answer: '', category: 'buying' }); }
    setShowModal(true);
  };

  const handleSaveBlog = async () => {
    await saveBlogPost(editingItem ? { ...editingItem, ...blogForm } : blogForm);
    setShowModal(false);
  };

  const handleSaveFaq = async () => {
    await saveFaqToDB(
      editingItem ? { ...(editingItem as FaqItem), ...faqForm } : { id: '', ...faqForm },
      !editingItem
    );
    setShowModal(false);
  };

  const filteredListings = listingsFilter === 'all' ? properties : properties.filter(p => listingsFilter === 'sale' ? p.listingType === 'BUY' : p.listingType === 'RENT');

  return (
    <div className="flex min-h-screen bg-[var(--parchment)]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--border)] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
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
            {SIDEBAR_ITEMS.map((group, gi) => (
              <div key={gi} className="mb-4">
                {group.group && <div className="px-3 mb-2 text-[10px] font-semibold text-[var(--stone)] uppercase tracking-wider">{t(group.group)}</div>}
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors cursor-pointer ${
                        isActive ? 'bg-[var(--rouge)] text-white' : 'text-[var(--charcoal)] hover:bg-[var(--parchment)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t(item.label)}
                      {item.key === 'received-forms' && formEntries.filter(f => !f.is_read).length > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                          {formEntries.filter(f => !f.is_read).length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[var(--rouge)] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--rouge)] truncate">{user.name}</div>
                <div className="text-[10px] text-[var(--gold-light)] font-semibold uppercase">Admin</div>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--border)] h-14 flex items-center px-4 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[var(--rouge)] mr-3 cursor-pointer"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center text-sm text-[var(--stone)]">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-[var(--rouge)] font-medium">{t(`admin.${activeSection === 'dashboard' ? 'dashboard' : activeSection.replace('-', '')}` as string) || activeSection}</span>
          </div>
          <Link href="/" target="_blank" className="ml-auto flex items-center gap-1.5 text-xs text-[var(--gold-light)] hover:text-[#9A7820] transition-colors">
            {t('admin.viewSite')} <ExternalLink className="w-3 h-3" />
          </Link>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Dashboard Overview */}
          {activeSection === 'dashboard' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--rouge)] mb-6">{t('admin.dashboard')}</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: t('admin.activeListings'), value: dbStats.totalProperties, color: 'text-[var(--rouge)]' },
                  { label: 'Total Leads', value: dbStats.totalLeads, color: 'text-green-600' },
                  { label: 'Estimations', value: dbStats.totalValuations, color: 'text-blue-600' },
                  { label: t('admin.newInquiries'), value: formEntries.filter(f => !f.is_read).length, color: 'text-orange-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-5">
                    <div className="text-xs text-[var(--stone)] mb-1">{stat.label}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Summary Table */}
              <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-6">
                <h3 className="font-semibold text-[var(--rouge)] mb-4">{t('admin.propertiesSummary')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-[var(--rouge)]">{sellProperties.length}</div><div className="text-xs text-[var(--stone)]">{t('admin.forSale')}</div></div>
                  <div><div className="text-2xl font-bold text-[var(--rouge)]">{rentProperties.length}</div><div className="text-xs text-[var(--stone)]">{t('admin.forRent')}</div></div>
                  <div><div className="text-2xl font-bold text-[var(--rouge)]">{soldProperties.length}</div><div className="text-xs text-[var(--stone)]">{t('admin.totalSold')}</div></div>
                  <div><div className="text-2xl font-bold text-[var(--rouge)]">{blogPosts.length}</div><div className="text-xs text-[var(--stone)]">{t('admin.blogPosts')}</div></div>
                  <div><div className="text-2xl font-bold text-[var(--rouge)]">{faqs.length}</div><div className="text-xs text-[var(--stone)]">{t('admin.faqs')}</div></div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-[var(--border)] p-5">
                <h3 className="font-semibold text-[var(--rouge)] mb-4">{t('admin.recentActivity')}</h3>
                {formEntries.length > 0 ? (
                  <div className="space-y-3">
                    {formEntries.slice(0, 5).map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 bg-[var(--parchment)] rounded-lg">
                        {!entry.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--rouge)]">{entry.name}</div>
                          <div className="text-xs text-[var(--stone)] truncate">{entry.message}</div>
                        </div>
                        <span className="text-[10px] text-[var(--stone)] shrink-0">{new Date(entry.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--stone)]">{t('common.noResults')}</p>
                )}
              </div>
            </div>
          )}

          {/* Properties Sell / Rent */}
          {(activeSection === 'properties-sell' || activeSection === 'properties-rent') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--rouge)]">
                  {t(activeSection === 'properties-sell' ? 'admin.propertiesSell' : 'admin.propertiesRent')}
                </h1>
                <Link href="/properties/new">
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" />{t('admin.addNew')}</Button>
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--parchment)] text-[var(--stone)]">
                      <tr>
                        <th className="text-left p-3 font-medium">Image</th>
                        <th className="text-left p-3 font-medium">Title</th>
                        <th className="text-left p-3 font-medium">{t('property.type')}</th>
                        <th className="text-left p-3 font-medium">{t('common.price')}</th>
                        <th className="text-left p-3 font-medium">{t('property.location')}</th>
                        <th className="text-left p-3 font-medium">{t('admin.status')}</th>
                        <th className="text-left p-3 font-medium">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeSection === 'properties-sell' ? sellProperties : rentProperties).map(prop => (
                        <tr key={prop.id} className="border-t border-[var(--border)] hover:bg-[var(--linen)]">
                          <td className="p-3">
                            <div className="w-12 h-9 rounded-lg overflow-hidden bg-[var(--parchment)] relative">
                              {prop.images[0] && <Image src={prop.images[0]} alt="" fill className="object-cover" sizes="48px" />}
                            </div>
                          </td>
                          <td className="p-3 font-medium text-[var(--rouge)] max-w-[200px] truncate">{prop.title}</td>
                          <td className="p-3"><span className="tag-luxury text-[10px]">{prop.propertyType}</span></td>
                          <td className="p-3">
                            {editingPriceId === prop.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editingPriceValue}
                                  onChange={(e) => setEditingPriceValue(e.target.value)}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      await adminMutate('update', 'properties', { price: Number(editingPriceValue) }, prop.id);
                                      setEditingPriceId(null);
                                      fetchAll();
                                    }
                                    if (e.key === 'Escape') setEditingPriceId(null);
                                  }}
                                  autoFocus
                                  className="w-28 border border-[var(--rouge)] rounded px-2 py-1 text-xs font-semibold text-[var(--rouge)] focus:outline-none"
                                />
                                <button onClick={async () => { await adminMutate('update', 'properties', { price: Number(editingPriceValue) }, prop.id); setEditingPriceId(null); fetchAll(); }} className="text-green-600 hover:text-green-700 p-1"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setEditingPriceId(null)} className="text-[var(--stone)] hover:text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/price">
                                <span className="font-semibold text-[var(--rouge)]">{formatCurrency(prop.price)}</span>
                                <button onClick={() => { setEditingPriceId(prop.id); setEditingPriceValue(prop.price ? String(prop.price) : ''); }} className="opacity-0 group-hover/price:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--parchment)] text-[var(--stone)] hover:text-[var(--rouge)]"><Pencil className="w-3 h-3" /></button>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-[var(--stone)]">{prop.neighborhood}</td>
                          <td className="p-3">
                            <select
                              value={prop.status?.toLowerCase() ?? 'available'}
                              onChange={async (e) => {
                                await adminMutate('update', 'properties', { status: e.target.value }, prop.id);
                                fetchAll();
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold border-0 cursor-pointer focus:outline-none appearance-none ${
                                prop.status?.toLowerCase() === 'available' ? 'bg-green-100 text-green-700' :
                                prop.status?.toLowerCase() === 'sold' ? 'bg-gray-100 text-gray-600' :
                                prop.status?.toLowerCase() === 'rented' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}
                            >
                              <option value="available">Disponible</option>
                              <option value="sold">Vendu</option>
                              <option value="rented">Loué</option>
                              <option value="reserved">Réservé</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Link href={`/properties/${prop.id}`} className="p-1.5 text-[var(--stone)] hover:text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                              <Link href={`/properties/${prop.id}/edit`} className="p-1.5 text-[var(--stone)] hover:text-[var(--gold-light)] hover:bg-[var(--parchment)] rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
                              <button onClick={() => { if (confirm(t('property.deleteConfirm'))) { logAdminAction('property_deleted', 'property', prop.title); deleteProperty(prop.id); } }} className="p-1.5 text-[var(--stone)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Blog Posts */}
          {activeSection === 'blog' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--rouge)]">{t('admin.blogPosts')}</h1>
                <Button size="sm" onClick={() => openBlogModal()}><Plus className="w-4 h-4 mr-1" />{t('admin.addNew')}</Button>
              </div>
              <div className="space-y-3">
                {blogPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--rouge)] truncate">{post.title_fr ?? post.title}</div>
                      <div className="text-xs text-[var(--stone)] truncate mt-0.5">{post.excerpt_fr ?? post.excerpt}</div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--stone)]">
                        <span>{new Date(post.created_at ?? post.date).toLocaleDateString('fr-FR')}</span>
                        <button
                          onClick={() => toggleBlogPublish(post.id, !!post.is_published)}
                          className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${post.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                        >
                          {post.is_published ? t('admin.published') : t('admin.draft')}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openBlogModal(post)} className="p-2 text-[var(--stone)] hover:text-[var(--gold-light)] hover:bg-[var(--parchment)] rounded-lg transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteBlogPost(post.id)} className="p-2 text-[var(--stone)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {activeSection === 'faqs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--rouge)]">{t('admin.faqs')}</h1>
                <Button size="sm" onClick={() => openFaqModal()}><Plus className="w-4 h-4 mr-1" />{t('admin.addNew')}</Button>
              </div>
              <div className="space-y-3">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--rouge)]">{faq.question}</div>
                      <div className="text-xs text-[var(--stone)] truncate mt-0.5">{faq.answer}</div>
                      <span className="inline-block mt-2 tag-luxury text-[10px]">{faq.category}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openFaqModal(faq)} className="p-2 text-[var(--stone)] hover:text-[var(--gold-light)] hover:bg-[var(--parchment)] rounded-lg transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteFaqFromDB(faq.id)} className="p-2 text-[var(--stone)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Social */}
          {activeSection === 'contact-social' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--rouge)] mb-6">{t('admin.contactSocial')}</h1>
              <div className="bg-white rounded-xl border border-[var(--border)] p-6 max-w-2xl">
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'phone', label: 'Téléphone', type: 'tel' },
                    { key: 'whatsapp', label: 'WhatsApp Agence', type: 'tel' },
                    { key: 'address', label: 'Adresse', type: 'text' },
                    { key: 'mapsUrl', label: 'Google Maps URL', type: 'url' },
                    { key: 'instagram', label: 'Instagram', type: 'url' },
                    { key: 'facebook', label: 'Facebook', type: 'url' },
                    { key: 'linkedin', label: 'LinkedIn', type: 'url' },
                    { key: 'twitter', label: 'Twitter / X', type: 'url' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        value={(contactInfo as unknown as Record<string, string>)[field.key]}
                        onChange={(e) => setContactInfo({ ...contactInfo, [field.key]: e.target.value })}
                        className="input-luxury"
                      />
                    </div>
                  ))}
                </div>
                <Button className="mt-6" onClick={async () => { await saveContactInfo(contactInfo); }}>{t('common.save')}</Button>
              </div>
            </div>
          )}

          {/* Received Forms */}
          {activeSection === 'received-forms' && (() => {
            const filtered = showUnreadOnly ? formEntries.filter(f => !f.is_read) : formEntries;
            const unreadCount = formEntries.filter(f => !f.is_read).length;
            return (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--rouge)]">{t('admin.receivedForms')}</h1>
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${showUnreadOnly ? 'bg-[var(--rouge)] text-white' : 'bg-[var(--linen)] text-[var(--charcoal)]'}`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {showUnreadOnly ? 'Tous' : 'Non lus seulement'}
                  {!showUnreadOnly && unreadCount > 0 && (
                    <span className="bg-[var(--rouge)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
              </div>
              {filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map(entry => (
                    <div key={entry.id} className={`bg-white rounded-xl border p-5 ${!entry.is_read ? 'border-blue-200 bg-blue-50/30' : 'border-[var(--border)]'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {!entry.is_read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          <span className="font-medium text-[var(--rouge)]">{entry.name}</span>
                          <span className="px-2 py-0.5 bg-[var(--parchment)] rounded-md text-[10px] font-medium text-[var(--stone)]">{entry.source}</span>
                          {entry.property_id ? (
                            <span className="text-[10px] bg-[var(--rouge-tint)] text-[var(--rouge)] px-2 py-0.5 rounded-full font-medium">Propri&eacute;t&eacute;</span>
                          ) : (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Contact g&eacute;n&eacute;ral</span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--stone)]">{new Date(entry.created_at ?? entry.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="text-sm text-[var(--charcoal)] mb-3">{entry.message}</p>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs text-[var(--stone)]">
                          <span>{entry.email}</span>
                          {entry.phone && <span>{entry.phone}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.email && (
                            <a href={`mailto:${entry.email}?subject=Re: Votre demande — Palais Rouge Immo`} className="flex items-center gap-1.5 text-xs bg-[var(--parchment)] text-[var(--rouge)] px-2 py-1 rounded-lg hover:bg-[var(--rouge)] hover:text-white transition-colors font-medium">
                              <Mail className="w-3 h-3" /> Email
                            </a>
                          )}
                          {entry.phone && (
                            <a href={`tel:${entry.phone}`} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors font-medium">
                              <Phone className="w-3 h-3" /> Appeler
                            </a>
                          )}
                          {entry.whatsapp && (
                            <a href={`https://wa.me/${entry.whatsapp.replace(/\D/g, '')}?text=Bonjour ${entry.name}, suite à votre demande sur Palais Rouge Immo...`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition-colors font-medium">
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                      {!entry.is_read && (
                        <button
                          onClick={async () => {
                            await adminMutate('update', 'contact_submissions', { is_read: true }, entry.id);
                            setFormEntries(prev => prev.map(f => f.id === entry.id ? { ...f, is_read: true } : f));
                          }}
                          className="mt-3 text-xs text-[var(--gold-light)] hover:underline cursor-pointer"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[var(--border)] p-12 text-center">
                  <Inbox className="w-12 h-12 text-[var(--muted-light)] mx-auto mb-3" />
                  <p className="text-[var(--stone)]">{t('common.noResults')}</p>
                </div>
              )}
            </div>
            );
          })()}

          {/* Active Listings */}
          {activeSection === 'active-listings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--rouge)]">{t('admin.activeListings')}</h1>
                <div className="flex gap-1 bg-[var(--parchment)] rounded-lg p-1">
                  {(['all', 'sale', 'rent'] as const).map(f => (
                    <button key={f} onClick={() => setListingsFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${listingsFilter === f ? 'bg-[var(--rouge)] text-white' : 'text-[var(--stone)]'}`}>
                      {f === 'all' ? t('common.all') : f === 'sale' ? t('admin.forSale') : t('admin.forRent')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--parchment)] text-[var(--stone)]">
                    <tr>
                      <th className="text-left p-3 font-medium">Property</th>
                      <th className="text-left p-3 font-medium">{t('property.type')}</th>
                      <th className="text-left p-3 font-medium">{t('common.price')}</th>
                      <th className="text-left p-3 font-medium">{t('property.views')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map(prop => (
                      <tr key={prop.id} className="border-t border-[var(--border)]">
                        <td className="p-3 font-medium text-[var(--rouge)]">{prop.title}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-md text-[10px] font-semibold ${prop.listingType === 'BUY' ? 'bg-[var(--rouge)] text-white' : 'bg-[var(--gold-light)] text-white'}`}>{prop.listingType === 'BUY' ? 'Sale' : 'Rent'}</span></td>
                        <td className="p-3 text-[var(--rouge)]">{formatCurrency(prop.price)}</td>
                        <td className="p-3 text-[var(--stone)]">{prop.viewCount}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-md text-[10px] font-semibold ${prop.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{prop.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sold Properties */}
          {activeSection === 'sold-properties' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--rouge)] mb-6">{t('admin.soldProperties')}</h1>
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--parchment)] text-[var(--stone)]">
                    <tr>
                      <th className="text-left p-3 font-medium">Property</th>
                      <th className="text-left p-3 font-medium">{t('common.price')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.buyer')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.agent')}</th>
                      <th className="text-left p-3 font-medium">{t('admin.soldDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldProperties.map(prop => (
                      <tr key={prop.id} className="border-t border-[var(--border)]">
                        <td className="p-3 font-medium text-[var(--rouge)]">{prop.title}</td>
                        <td className="p-3 text-green-600 font-semibold">{formatCurrency(prop.price)}</td>
                        <td className="p-3"><div className="text-[var(--rouge)]">{prop.buyer}</div><div className="text-xs text-[var(--stone)]">{prop.buyerEmail}</div></td>
                        <td className="p-3 text-[var(--stone)]">{prop.agent}</td>
                        <td className="p-3 text-[var(--stone)]">{new Date(prop.soldDate).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valuations */}
          {activeSection === 'valuations' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--rouge)] mb-6">Demandes d&apos;estimation</h1>
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--parchment)] text-[var(--stone)]">
                    <tr>
                      <th className="text-left p-3 font-medium">Nom</th>
                      <th className="text-left p-3 font-medium">Contact</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Lieu</th>
                      <th className="text-left p-3 font-medium">Surface</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Lu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData
                      ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                      : valuations.map(v => (
                        <tr key={v.id} className={`border-t border-[var(--border)] ${!v.is_read ? 'bg-blue-50/20' : ''}`}>
                          <td className="p-3 font-medium text-[var(--rouge)]">{v.name}</td>
                          <td className="p-3 text-[var(--stone)]">
                            <div>{v.email}</div>
                            {v.phone && <div className="text-xs">{v.phone}</div>}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {v.email && (
                                <a href={`mailto:${v.email}?subject=Re: Votre demande d'estimation — Palais Rouge Immo`} className="flex items-center gap-1 text-[10px] bg-[var(--parchment)] text-[var(--rouge)] px-1.5 py-0.5 rounded hover:bg-[var(--rouge)] hover:text-white transition-colors font-medium">
                                  <Mail className="w-2.5 h-2.5" /> Email
                                </a>
                              )}
                              {v.phone && (
                                <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded hover:bg-green-100 transition-colors font-medium">
                                  <Phone className="w-2.5 h-2.5" /> Appeler
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-3"><span className="tag-luxury text-[10px]">{v.property_type}</span></td>
                          <td className="p-3 text-[var(--stone)]">{v.location}</td>
                          <td className="p-3 text-[var(--stone)]">{v.area_sqm ? `${v.area_sqm} m²` : '—'}</td>
                          <td className="p-3 text-[var(--stone)]">{new Date(v.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="p-3">
                            {!v.is_read ? (
                              <button
                                onClick={async () => {
                                  await adminMutate('update', 'valuation_requests', { is_read: true }, v.id);
                                  setValuations(prev => prev.map(x => x.id === v.id ? { ...x, is_read: true } : x));
                                }}
                                className="text-xs text-[var(--gold-light)] hover:underline cursor-pointer"
                              >
                                Marquer lu
                              </button>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                {!loadingData && valuations.length === 0 && (
                  <div className="p-12 text-center text-[var(--stone)]">Aucune demande d&apos;estimation.</div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter */}
          {activeSection === 'newsletter' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--rouge)]">Newsletter</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--stone)]">{newsletterSubs.length} abonné{newsletterSubs.length !== 1 ? 's' : ''}</span>
                  {newsletterSubs.length > 0 && (
                    <button
                      onClick={() => {
                        const csv = ['Email,Date inscription', ...newsletterSubs.map((s: any) => `${s.email},${new Date(s.subscribed_at).toLocaleDateString('fr-MA')}`)].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'abonnes-newsletter.csv'; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1.5 text-sm bg-[var(--rouge)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Exporter CSV
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--parchment)] text-[var(--stone)]">
                    <tr>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Date d&apos;inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletterSubs.map((sub: any) => (
                      <tr key={sub.email} className="border-t border-[var(--border)]">
                        <td className="p-3 font-medium text-[var(--rouge)]">{sub.email}</td>
                        <td className="p-3 text-[var(--stone)]">{new Date(sub.subscribed_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {newsletterSubs.length === 0 && (
                  <div className="p-12 text-center text-[var(--stone)]">Aucun abonné pour le moment.</div>
                )}
              </div>
            </div>
          )}

          {/* Agents */}
          {activeSection === 'agents' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--rouge)] mb-6">Gestion des agents</h1>
              <div className="bg-white rounded-xl border border-[var(--border)] p-6">
                <p className="text-sm text-[var(--stone)] mb-6">Envoyez un lien de réinitialisation de mot de passe à un agent.</p>
                <div className="space-y-4 max-w-xl">
                  {agentsList.map((agent: { id: string; name: string; email: string }) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-[var(--parchment)] rounded-xl">
                      <div>
                        <div className="font-medium text-[var(--rouge)]">{agent.name}</div>
                        <div className="text-xs text-[var(--stone)]">{agent.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {resetEmailStatus[agent.id] === 'sent' && (
                          <span className="text-xs text-green-600">Lien envoyé ✓</span>
                        )}
                        {resetEmailStatus[agent.id] === 'error' && (
                          <span className="text-xs text-red-500">Erreur</span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendPasswordReset(agent.email, agent.id)}
                          disabled={resetEmailStatus[agent.id] === 'sending' || resetEmailStatus[agent.id] === 'sent'}
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          {resetEmailStatus[agent.id] === 'sending' ? 'Envoi...' : 'Envoyer lien de réinitialisation'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Log */}
          {activeSection === 'activity_log' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-display font-bold text-[var(--noir)]">Journal d&apos;activit&eacute;</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Temps r&eacute;el
                  </div>
                  {(['30m','1h','2h','6h','24h','7d'] as const).map(tf => (
                    <button key={tf} onClick={() => { setLogTimeFilter(tf); fetchLogs(tf); }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${logTimeFilter === tf ? 'bg-[var(--rouge)] text-white' : 'bg-[var(--linen)] text-[var(--charcoal)]'}`}>{tf}</button>
                  ))}
                  <select value={logFilter} onChange={e => setLogFilter(e.target.value)}
                    className="text-xs border border-[var(--border)] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[var(--rouge)]">
                    <option value="all">Tout</option>
                    <option value="lead">Leads</option>
                    <option value="contact">Contact</option>
                    <option value="property">Propri&eacute;t&eacute;s</option>
                    <option value="navigation">Navigation</option>
                    <option value="auth">Connexions</option>
                    <option value="admin_action">Actions admin</option>
                    <option value="error">Erreurs</option>
                  </select>
                  <button onClick={() => exportLogs(logTimeFilter)}
                    className="flex items-center gap-2 text-xs bg-[var(--noir)] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-80 transition-opacity cursor-pointer">
                    <Download size={13} /> Exporter CSV
                  </button>
                </div>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Visites', count: activityLogs.filter(l => l.event_type === 'page_view').length, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Eye className="w-4 h-4 text-blue-400" /> },
                  { label: 'Leads', count: activityLogs.filter(l => l.event_category === 'lead').length, color: 'text-green-600', bg: 'bg-green-50', icon: <Users className="w-4 h-4 text-green-400" /> },
                  { label: 'WhatsApp', count: activityLogs.filter(l => l.event_type === 'whatsapp_click').length, color: 'text-[var(--rouge)]', bg: 'bg-rose-50', icon: <MessageSquare className="w-4 h-4 text-rose-400" /> },
                  { label: 'Appels', count: activityLogs.filter(l => l.event_type === 'call_click').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Phone className="w-4 h-4 text-amber-400" /> },
                  { label: 'Erreurs', count: activityLogs.filter(l => l.is_error).length, color: 'text-red-600', bg: 'bg-red-50', icon: <X className="w-4 h-4 text-red-400" /> },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Log entries */}
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                {logLoading ? (
                  <div className="p-8 text-center text-[var(--muted)] text-sm">Chargement...</div>
                ) : (
                  <div className="divide-y divide-[var(--border)] max-h-[600px] overflow-y-auto">
                    {(logFilter === 'all' ? activityLogs : activityLogs.filter(l => l.event_category === logFilter)).map((entry: any) => (
                      <div key={entry.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--parchment)] transition-colors ${entry.is_error ? 'bg-red-50 border-l-2 border-red-400' : ''}`}>
                        <span className="shrink-0 mt-0.5">{getEventIcon(entry.event_type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[var(--noir)]">{getEventLabel(entry)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryStyle(entry.event_category)}`}>{entry.event_category}</span>
                            {entry.device_type && (
                              <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                {entry.device_type === 'mobile' ? <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                                {entry.device_type}
                              </span>
                            )}
                          </div>
                          {entry.event_label && <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{entry.event_label}</p>}
                          {entry.is_error && entry.error_message && <p className="text-xs text-red-600 mt-1 font-mono bg-red-50 px-2 py-1 rounded">{entry.error_message}</p>}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-[var(--muted)]">{new Date(entry.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            {entry.page_url && <span className="text-xs text-[var(--muted)] truncate max-w-[200px]">{entry.page_url.replace('https://www.palaisrouge.online', '').replace('https://palaisrouge.online', '')}</span>}
                            {entry.user_email && <span className="text-xs text-[var(--rouge)] font-medium">{entry.user_email}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {activityLogs.length === 0 && (
                      <div className="p-12 text-center">
                        <Activity className="w-10 h-10 text-[var(--muted-light)] mx-auto mb-3" />
                        <p className="text-[var(--muted)] text-sm">Aucune activit&eacute; sur cette p&eacute;riode</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-[var(--rouge)]">
                {editingItem ? t('common.edit') : t('common.add')} {modalType === 'blog' ? 'Blog Post' : 'FAQ'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-[var(--stone)] hover:text-[var(--rouge)] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {modalType === 'blog' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Titre</label>
                  <input type="text" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="input-luxury" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Extrait</label>
                  <textarea value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} className="input-luxury min-h-[70px]" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Contenu (Markdown supporté)</label>
                  <textarea
                    value={blogForm.content ?? ''}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={16}
                    placeholder={"Écrivez le contenu en Markdown...\n# Titre\n## Sous-titre\n**Gras** *Italique*\n- Liste item"}
                    className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--rouge)] resize-y bg-white leading-relaxed"
                  />
                  <p className="text-xs text-[var(--stone)]">Markdown supporté : **gras**, *italique*, # titres, - listes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Image de couverture</label>
                  <ImageUpload
                    images={blogForm.coverImage ? [blogForm.coverImage] : []}
                    onChange={(imgs) => setBlogForm(prev => ({ ...prev, coverImage: imgs[0] ?? '' }))}
                    folder="blog"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[var(--charcoal)]">Statut</label>
                  <button
                    type="button"
                    onClick={() => setBlogForm(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                      blogForm.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {blogForm.isPublished ? 'Publié' : 'Brouillon'}
                  </button>
                </div>
                {blogForm.isPublished && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-1">Date de publication</label>
                    <input
                      type="date"
                      value={blogForm.publishedAt?.split('T')[0] ?? ''}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                      className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-[var(--rouge)]"
                    />
                  </div>
                )}
                <Button onClick={handleSaveBlog} className="w-full">{t('common.save')}</Button>
              </div>
            )}

            {modalType === 'faq' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Question</label>
                  <input type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="input-luxury" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Answer</label>
                  <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="input-luxury min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">Category</label>
                  <select value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} className="input-luxury">
                    <option value="buying">Buying</option>
                    <option value="selling">Selling</option>
                    <option value="renting">Renting</option>
                    <option value="working">Working with us</option>
                  </select>
                </div>
                <Button onClick={handleSaveFaq} className="w-full">{t('common.save')}</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
