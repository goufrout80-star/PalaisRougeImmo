'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, MapPin, Star, DollarSign, Building2, BadgeCheck, BookOpen,
  TrendingUp, Briefcase, Users, FileText, Menu, X, User, LogOut, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import LanguageCurrencySwitcher from '@/components/ui/LanguageCurrencySwitcher';

interface DropdownItem {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
}

const buyMenu: DropdownItem[] = [
  { icon: Home, label: 'nav.browseHomes', description: 'nav.browseHomesDesc', href: '/properties?listingType=BUY' },
  { icon: MapPin, label: 'nav.byLocation', description: 'nav.byLocationDesc', href: '/search' },
  { icon: Star, label: 'nav.newDevelopments', description: 'nav.newDevelopmentsDesc', href: '/properties?listingType=BUY' },
  { icon: DollarSign, label: 'nav.mortgageCalculator', description: 'nav.mortgageCalculatorDesc', href: '/calculator' },
];

const rentMenu: DropdownItem[] = [
  { icon: Building2, label: 'nav.browseRentals', description: 'nav.browseRentalsDesc', href: '/properties?listingType=RENT' },
  { icon: BadgeCheck, label: 'nav.verifiedListings', description: 'nav.verifiedListingsDesc', href: '/properties?listingType=RENT' },
  { icon: BookOpen, label: 'nav.rentalGuide', description: 'nav.rentalGuideDesc', href: '/guide/renting' },
];

const sellMenu: DropdownItem[] = [
  { icon: TrendingUp, label: 'nav.sellYourHome', description: 'nav.sellYourHomeDesc', href: '/sell' },
  { icon: Briefcase, label: 'nav.homeValuation', description: 'nav.homeValuationDesc', href: '/valuation' },
  { icon: Users, label: 'nav.findAgent', description: 'nav.findAgentDesc', href: '/agents' },
  { icon: FileText, label: 'nav.sellingGuide', description: 'nav.sellingGuideDesc', href: '/guide/selling' },
];

function DropdownMenu({ items, isOpen, onClose }: { items: DropdownItem[]; isOpen: boolean; onClose: () => void }) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-luxury-lg border border-[var(--border)] py-3 min-w-[280px] z-50 animate-scale-in">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={i}
            href={item.href}
            onClick={onClose}
            className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--parchment)] transition-colors"
          >
            <div className="p-2 rounded-lg bg-[var(--parchment)]">
              <Icon className="w-4 h-4 text-[var(--gold)]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--rouge)]">{t(item.label)}</div>
              <div className="text-xs text-[var(--stone)] mt-0.5">{t(item.description)}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/agent');
  if (isAdminRoute) return null;

  const handleDropdownEnter = (menu: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'agent') return '/agent/dashboard';
    return '/dashboard';
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[var(--rouge)] h-9 flex items-center justify-end px-4 md:px-8 z-50 relative">
        <LanguageCurrencySwitcher />
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'nav.buy', menu: buyMenu, key: 'buy' },
                { label: 'nav.rent', menu: rentMenu, key: 'rent' },
                { label: 'nav.sell', menu: sellMenu, key: 'sell' },
              ].map(item => (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.key)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className="px-4 py-2 text-sm font-medium text-[var(--rouge)] hover:text-[var(--gold)] transition-colors flex items-center gap-1 elegant-underline cursor-pointer">
                    {t(item.label)}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === item.key ? 'rotate-180' : ''}`} />
                  </button>
                  <DropdownMenu
                    items={item.menu}
                    isOpen={activeDropdown === item.key}
                    onClose={() => setActiveDropdown(null)}
                  />
                </div>
              ))}
            </div>

            {/* Center Logo */}
            <Link href="/" className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--rouge)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PR</span>
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-[var(--rouge)] leading-tight">
                    Palais Rouge Immo
                  </div>
                  <div className="text-[10px] text-[var(--gold)] font-semibold tracking-[0.2em] uppercase">
                    Marrakech
                  </div>
                </div>
              </div>
            </Link>

            {/* Right Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/properties?featured=true"
                className="px-4 py-2 text-sm font-medium text-[var(--rouge)] hover:text-[var(--gold)] transition-colors elegant-underline"
              >
                {t('nav.exclusivities')}
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-[var(--rouge)] hover:text-[var(--gold)] transition-colors elegant-underline"
              >
                {t('nav.contact')}
              </Link>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--parchment)] transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--rouge)] flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--stone)]" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-luxury-lg border border-[var(--border)] py-2 min-w-[200px] animate-scale-in">
                      <div className="px-4 py-2 border-b border-[var(--border)]">
                        <div className="text-sm font-medium text-[var(--rouge)]">{user.name}</div>
                        <div className="text-xs text-[var(--stone)]">{user.email}</div>
                      </div>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--rouge)] hover:bg-[var(--parchment)] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t('nav.dashboard')}
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="ml-2 px-5 py-2 bg-[var(--rouge)] text-white text-sm font-medium rounded-lg hover:bg-[var(--rouge-dark)] transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[var(--rouge)] cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--border)] animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              <Link href="/properties?listingType=BUY" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg">
                {t('nav.buy')}
              </Link>
              <Link href="/properties?listingType=RENT" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg">
                {t('nav.rent')}
              </Link>
              <Link href="/sell" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg">
                {t('nav.sell')}
              </Link>
              <Link href="/properties?featured=true" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg">
                {t('nav.exclusivities')}
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg">
                {t('nav.contact')}
              </Link>
              <div className="divider-elegant my-2" />
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--rouge)] hover:bg-[var(--parchment)] rounded-lg">
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-white bg-[var(--rouge)] rounded-lg text-center">
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
