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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=900&fit=crop" className="w-full h-full object-cover animate-pulse-slow" />
        </div>

        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-6xl md:text-7xl font-black mb-6 animate-fade-in tracking-tighter">Find Your <span className="text-primary italic">Dream</span> Home</h1>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium">The most advanced platform for premium real estate in Karachi.</p>

          <div className="glass p-2 md:p-3 rounded-2xl md:rounded-[32px] flex flex-col md:flex-row gap-3 max-w-4xl mx-auto shadow-2xl border border-white/20 backdrop-blur-xl">
             <div className="flex-grow flex items-center bg-white/20 rounded-xl md:rounded-[24px] px-6 border border-black/5">
                <MapPin className="text-primary mr-3" />
                <input 
                  placeholder="Search Karachi, DHA, Clifton..." 
                  className="w-full py-5 text-slate-900 placeholder:text-slate-500 outline-none bg-transparent font-bold"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
             </div>
             <Button onClick={handleSearch} size="lg" className="px-12 h-auto py-5 font-black text-xl rounded-xl md:rounded-[24px] shadow-lg shadow-primary/20">Search Now</Button>
          </div>
        </div>
      </section>

      {/* Featured Listing */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-foreground">Featured <span className="text-primary italic">Properties</span></h2>
              <p className="text-muted font-bold mt-2">Handpicked premium listings just for you</p>
            </div>
            <Link href="/properties" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all">
              View All <ArrowRight />
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[1, 2, 3].map(n => <div key={n} className="h-[450px] bg-muted rounded-[40px] animate-pulse" />)}
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
