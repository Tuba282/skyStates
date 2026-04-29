'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import PropertyCard from '@/components/common/PropertyCard';
import { Button } from '@/components/ui';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filter States
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [beds, setBeds] = useState('All');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/properties', {
        params: {
          type: activeTab !== 'All' ? activeTab : undefined,
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          minPrice: minPrice || undefined,
          beds: beds !== 'All' ? beds : undefined
        }
      });
      setProperties(data);
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [activeTab, search, category, beds]); // Refetch on these changes

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header Area */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2">Explore <span className="text-primary italic">All Listings</span></h1>
          <p className="text-muted">Discover {filteredProperties.length} active properties</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="flex-grow glass p-2 rounded-2xl flex items-center shadow-2xl border border-black/5 bg-white/80">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                placeholder="Search by location, title, or agency..." 
                className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-900 placeholder:text-slate-500 focus:outline-none font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden md:flex gap-1 p-1 bg-black/5 rounded-xl border border-black/5">
              {['All', 'Sale', 'Rent'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-slate-600 hover:text-primary hover:bg-black/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            variant={showFilters ? 'primary' : 'outline'} 
            className="py-3 px-8 h-auto flex items-center gap-2 rounded-2xl transition-all font-black text-lg shadow-xl border-white/20" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={22} className={showFilters ? 'text-white' : 'text-primary'} /> 
            <span>Advanced Filters</span>
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="glass p-8 rounded-[40px] mb-12 grid grid-cols-1 md:grid-cols-4 gap-8 animate-slide-down border border-black/5 shadow-2xl bg-white/90">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 text-slate-900 outline-none focus:ring-2 focus:ring-primary/50 font-bold"
              >
                <option value="All">All Categories</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-1">Min Price</label>
              <input 
                type="number" 
                placeholder="Ex. 50000" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 text-slate-900 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary/50 font-bold" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-1">Beds</label>
              <div className="flex gap-2">
                {['All', 1, 2, 3, '4+'].map(b => (
                  <button 
                    key={b} 
                    onClick={() => setBeds(b)}
                    className={`flex-grow py-3 rounded-xl transition-all font-black ${
                      beds === b 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-black/5 border border-black/5 text-slate-600 hover:bg-black/10'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={() => fetchProperties()} className="w-full py-5 rounded-2xl font-black shadow-xl shadow-primary/20 text-lg uppercase tracking-wider">Apply Filters</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-80 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-32 glass rounded-3xl">
             <MapPin size={64} className="mx-auto text-muted mb-6" />
             <h2 className="text-3xl font-black mb-4">No Properties Found</h2>
             <Button variant="outline" onClick={() => { setSearch(''); setActiveTab('All'); }}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
