'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-secondary shadow-sm active:scale-95',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-primary shadow-sm active:scale-95',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 active:scale-95',
    ghost: 'hover:bg-muted text-foreground active:scale-95',
    danger: 'bg-red-500  hover:bg-red-600 active:scale-95',
    accent: 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-sm',
    md: 'px-6 py-2.5 rounded-lg font-medium',
    lg: 'px-8 py-3.5 text-lg rounded-xl font-bold',
    icon: 'p-2 rounded-full',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, label, error, ...props }) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-sm font-semibold text-foreground/80 ml-1">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
          error && 'border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'primary', className }) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    secondary: 'bg-muted text-muted-foreground border-border',
    danger: 'bg-red-100 text-red-600 border-red-200',
  };

  return (
    <span className={cn('px-2.5 py-0.5 text-xs font-semibold rounded-full border', variants[variant], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className, hover = false }) {
  return (
    <div className={cn(
      'bg-card-foreground border border-border rounded-xl shadow-sm overflow-hidden',
      hover && 'hover:shadow-md transition-shadow duration-300',
      className
    )}>
      {children}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-black">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
             <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
