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
            <Link href="/properties" className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold transition-colors mb-4 text-lg">
              <ArrowLeft size={18} /> Back to Search
            </Link>
            <h1 className="text-5xl font-black text-white text-shadow-lg text-black mb-2">My <span className="text-primary italic">Wishlist</span></h1>
            <p className="text-gray-400 text-lg">You have {favoriteProperties.length} properties saved for later</p>
          </div>
          <Button 
            onClick={() => router.push('/properties')}
            variant="outline" 
            className="gap-2 px-8 py-6 h-auto  border-white/20 hover:bg-white/5 rounded-2xl font-black text-lg shadow-xl"
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
          <div className="text-center py-40 glass rounded-[40px] animate-fade-in border border-white/10 bg-white/10 shadow-2xl">
            <div className="inline-flex p-10 bg-white rounded-full text-red-500 mb-8 border-8 border-white/10 shadow-2xl animate-pulse-slow">
              <Heart size={80} strokeWidth={1.5} fill="currentColor" />
            </div>
            <h2 className="text-5xl font-black  mb-4 tracking-tight">Your Wishlist is Empty</h2>
            <p className="text-gray-300 max-w-xl mx-auto text-xl font-medium px-6 leading-relaxed">
              Start exploring our premium Karachi listings and click the heart icon to save your dream properties here.
            </p>
            <Button 
              onClick={() => router.push('/properties')}
              size="lg" 
              className="mt-12 px-16 py-7 rounded-[24px] shadow-2xl shadow-primary/40 font-black text-xl hover:scale-105 transition-transform"
            >
              Browse Properties Now
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
