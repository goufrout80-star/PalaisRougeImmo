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
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useProperties } from '@/context/PropertiesContext';
import { Property, BlogPost, FaqItem, FormEntry, SoldProperty, ContactInfo } from '@/types';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

type Section = 'dashboard' | 'properties-sell' | 'properties-rent' | 'blog' | 'faqs' | 'contact-social' | 'received-forms' | 'active-listings' | 'sold-properties' | 'valuations' | 'agents' | 'newsletter';

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

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-light)]" /></div>;
  }

  const sellProperties = properties.filter(p => p.listingType === 'BUY');
  const rentProperties = properties.filter(p => p.listingType === 'RENT');
  const totalRevenue = soldProperties.reduce((sum, p) => sum + p.price, 0);
  const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);

  // CRUD helpers
  const saveBlogPost = async (post: any) => {
    const slug = (post.title as string)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const dbFields = {
      title_fr: post.title,
      excerpt_fr: post.excerpt,
      content_fr: post.content ?? '',
      cover_image: post.coverImage || null,
      is_published: Boolean(post.isPublished),
      published_at: post.isPublished
        ? (post.publishedAt ?? new Date().toISOString())
        : null,
    };
    if (post.id) {
      await supabase.from('blog_posts').update(dbFields).eq('id', post.id);
    } else {
      await supabase.from('blog_posts').insert({ ...dbFields, slug });
    }
    fetchAll();
  };
  const deleteBlogPost = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };
  const toggleBlogPublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from('blog_posts').update({
      is_published: !current,
      published_at: !current ? new Date().toISOString() : null,
    }).eq('id', id);
    if (!error) {
      setBlogPosts(prev => prev.map(b =>
        b.id === id ? { ...b, is_published: !current } : b
      ));
    }
  };
  const saveFaqs = async (items: FaqItem[]) => {
    setFaqs(items);
  };
  const saveFaqToDB = async (item: FaqItem, isNew: boolean) => {
    if (isNew) {
      const { data } = await supabase.from('faq_items').insert({
        question_fr: item.question, answer_fr: item.answer, category: item.category,
        is_published: true, sort_order: 0,
      }).select().single();
      if (data) setFaqs(prev => [{ id: data.id, question: data.question_fr ?? '', answer: data.answer_fr ?? '', category: data.category ?? 'buying' }, ...prev]);
    } else {
      await supabase.from('faq_items').update({
        question_fr: item.question, answer_fr: item.answer, category: item.category,
      }).eq('id', item.id);
      setFaqs(prev => prev.map(f => f.id === item.id ? { ...f, ...item } : f));
    }
  };
  const deleteFaqFromDB = async (id: string) => {
    await supabase.from('faq_items').delete().eq('id', id);
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
      await supabase.from('site_settings').upsert(row, { onConflict: 'key' });
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
                                      await supabase.from('properties').update({ price: Number(editingPriceValue) }).eq('id', prop.id);
                                      setEditingPriceId(null);
                                      fetchAll();
                                    }
                                    if (e.key === 'Escape') setEditingPriceId(null);
                                  }}
                                  autoFocus
                                  className="w-28 border border-[var(--rouge)] rounded px-2 py-1 text-xs font-semibold text-[var(--rouge)] focus:outline-none"
                                />
                                <button onClick={async () => { await supabase.from('properties').update({ price: Number(editingPriceValue) }).eq('id', prop.id); setEditingPriceId(null); fetchAll(); }} className="text-green-600 hover:text-green-700 p-1"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setEditingPriceId(null)} className="text-[var(--stone)] hover:text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/price">
                                <span className="font-semibold text-[var(--rouge)]">{formatCurrency(prop.price)}</span>
                                <button onClick={() => { setEditingPriceId(prop.id); setEditingPriceValue(String(prop.price ?? 0)); }} className="opacity-0 group-hover/price:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--parchment)] text-[var(--stone)] hover:text-[var(--rouge)]"><Pencil className="w-3 h-3" /></button>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-[var(--stone)]">{prop.neighborhood}</td>
                          <td className="p-3">
                            <select
                              value={prop.status?.toLowerCase() ?? 'available'}
                              onChange={async (e) => {
                                await supabase.from('properties').update({ status: e.target.value }).eq('id', prop.id);
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
                              <button onClick={() => { if (confirm(t('property.deleteConfirm'))) deleteProperty(prop.id); }} className="p-1.5 text-[var(--stone)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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
                            await supabase.from('contact_submissions').update({ is_read: true }).eq('id', entry.id);
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
                                  await supabase.from('valuation_requests').update({ is_read: true }).eq('id', v.id);
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
