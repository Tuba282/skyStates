'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '@/components/common/PropertyCard';
import { Button } from '@/components/ui';
import { Search, MapPin, Home, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');

  const handleSearch = () => {
    if (locationSearch.trim()) {
      router.push(`/properties?search=${encodeURIComponent(locationSearch)}`);
    } else {
      router.push('/properties');
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get('/api/properties');
        setFeaturedProperties(data.slice(0, 9));
      } catch (error) {
        console.error('Home load error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const stats = [
    { label: 'Active Listings', value: '12K+', icon: Home },
    { label: 'Happy Customers', value: '45K+', icon: Users },
    { label: 'Deals Completed', value: '$8B+', icon: Zap },
    { label: 'Secure Platform', value: '100%', icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
          <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=900&fit=crop" className="w-full h-full object-cover animate-pulse-slow scale-110" />
        </div>

        <div className="relative z-20 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in">
             Premium Real Estate OS
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 animate-fade-in tracking-tighter leading-none uppercase">Find Your <span className="text-primary italic">Dream</span> <br className="hidden md:block" /> Mansion</h1>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto font-black uppercase tracking-widest leading-relaxed"> Karachi's most advanced property discovery platform.</p>

          <div className="glass p-2 md:p-3 rounded-2xl md:rounded-[32px] flex flex-col md:flex-row gap-3 max-w-4xl mx-auto shadow-2xl border border-white/10 backdrop-blur-2xl bg-white/5">
            <div className="flex-grow flex items-center bg-black/40 rounded-xl md:rounded-[24px] px-6 border border-white/5">
              <MapPin className="text-primary mr-3" />
              <input
                placeholder="Search Karachi, DHA, Clifton..."
                className="w-full py-5 text-white placeholder:text-slate-500 outline-none bg-transparent font-bold"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="px-12 h-auto py-5 font-black text-xl rounded-xl md:rounded-[24px] shadow-2xl shadow-primary/40 bg-primary text-white border-none hover:scale-105 transition-transform">SEARCH NOW</Button>
          </div>
        </div>
      </section>

      {/* Featured Listing */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-1 w-12 bg-primary rounded-full" />
                 <span className="text-primary font-black text-[10px] uppercase tracking-widest">Selected For You</span>
              </div>
              <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter">Featured <span className="text-primary italic">Vault</span></h2>
              <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Handpicked premium listings synced in real-time</p>
            </div>
            <Link href="/properties" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-sm bg-primary/10 px-6 py-3 rounded-xl border border-primary/20">
              Access Full Catalog <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(n => <div key={n} className="h-[450px] bg-card rounded-[40px] animate-pulse border border-border" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
