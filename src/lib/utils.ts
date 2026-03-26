import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}

export function formatPrice(price: number, currency: string = 'MAD'): string {
  const symbols: Record<string, string> = {
    MAD: 'DH',
    USD: '$',
    EUR: '€',
  };
  const symbol = symbols[currency] || currency;

  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(price);

  if (currency === 'MAD') {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatDate(dateString: string, locale: string = 'fr-FR'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
