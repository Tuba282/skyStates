'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { PROPERTIES } from '@/data/mockData';
import PropertyCard from '@/components/common/PropertyCard';
import { Button } from '@/components/ui';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const loadFavorites = () => {
      const saved = JSON.parse(localStorage.getItem('skyestate_favorites') || '[]');
      setFavoriteProperties(saved);
    };

    loadFavorites();
    setLoading(false);

    window.addEventListener('favoritesChanged', loadFavorites);
    return () => window.removeEventListener('favoritesChanged', loadFavorites);
  }, []);

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/properties" className="flex items-center gap-2 text-primary hover:text-primary/80 font-black transition-colors mb-4 text-sm uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Vault
            </Link>
            <h1 className="text-5xl font-black text-foreground mb-2 leading-none uppercase">My <span className="text-primary italic">Wishlist</span></h1>
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]">{favoriteProperties.length} PROPERTIES ENCRYPTED</p>
          </div>
          <Button 
            onClick={() => router.push('/properties')}
            variant="outline" 
            className="gap-2 px-8 py-4 h-auto border-border hover:bg-card rounded-2xl font-black text-lg shadow-xl shadow-primary/5"
          >
            <Search size={22} className="text-primary" /> Explore More
          </Button>
        </div>

        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {favoriteProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 glass rounded-[40px] animate-fade-in border border-border bg-card/50 shadow-2xl backdrop-blur-xl">
            <div className="inline-flex p-10 bg-red-500/10 rounded-full text-red-500 mb-8 border-8 border-red-500/5 shadow-2xl animate-pulse-slow">
              <Heart size={80} strokeWidth={1.5} fill="currentColor" />
            </div>
            <h2 className="text-4xl font-black text-foreground mb-4 tracking-tight uppercase">Wishlist Empty</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm font-bold px-6 leading-relaxed uppercase tracking-widest">
              Start exploring our premium listings and click the heart icon to save your dream properties here.
            </p>
            <Button 
              onClick={() => router.push('/properties')}
              size="lg" 
              className="mt-12 px-16 py-7 rounded-[24px] shadow-2xl shadow-primary/40 font-black text-xl hover:scale-105 transition-transform bg-primary text-white border-none"
            >
              Browse Now
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
