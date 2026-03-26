'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export default function Card({ className, children, hover = true }: CardProps) {
  return (
    <div className={cn(hover ? 'card-elegant' : 'bg-white border border-[var(--border)] rounded-xl', 'p-6', className)}>
      {children}
    </div>
  );
}
