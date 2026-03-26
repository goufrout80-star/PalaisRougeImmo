'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn('input-luxury', error && 'border-var(--rouge)', className)}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-var(--rouge)">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
