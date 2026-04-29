'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button, cn } from '@/components/ui';
import { Home, Search, Heart, User, LayoutDashboard, LogOut, Menu, X, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin, isAgent } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Search },
    { name: 'Favorites', href: '/favorites', icon: Heart },
  ];

  const dashboardHref = '/dashboard';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group py-2">
            <img src="/logo.png" alt="SkyEstate Logo" className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted hover:text-primary font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth/Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {isAgent && (
                  <Link href="/dashboard/add-property">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Listing
                    </Button>
                  </Link>
                )}
                <Link href={dashboardHref}>
                  <Button variant="ghost" size="icon" className="group">
                    <LayoutDashboard className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                  <div className="text-right">
                    <p className="text-sm font-bold leading-none">{user.name}</p>
                    <p className="text-xs text-muted leading-tight">{user.role}</p>
                  </div>
                  <img src={`/userDefault.jpg`} alt={user.name} className="h-10 w-10 rounded-full border-2 border-primary/20" />
                  <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:bg-red-50" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="md:hidden glass border-b border-border shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}
            {user && (
              <Link
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            )}
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              {user ? (
                <Button variant="danger" onClick={() => { logout(); setIsOpen(false); }} className="w-full">
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
