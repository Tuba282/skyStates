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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const itemsPerPage = 9;

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
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [activeTab, search, category, beds]); // Refetch on these changes

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setIsPaginating(true);
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Artificial delay for smooth transition/loader visibility
    setTimeout(() => {
      setIsPaginating(false);
    }, 600);
  };

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header Area */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2">Explore <span className="text-primary italic">All Listings</span></h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProperties.length)} of {filteredProperties.length} active properties
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="flex-grow glass p-2 rounded-2xl flex items-center shadow-2xl border border-border bg-card">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                placeholder="Search by location, title, or agency..." 
                className="w-full pl-12 pr-4 py-4 bg-transparent text-foreground placeholder:text-muted outline-none font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden md:flex gap-1 p-1 bg-background/50 rounded-xl border border-border">
              {['All', 'Sale', 'Rent'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-muted-foreground hover:text-primary hover:bg-background'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            variant={showFilters ? 'primary' : 'outline'} 
            className="py-3 px-8 h-auto flex items-center gap-2 rounded-2xl transition-all font-black text-lg shadow-xl border-border" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={22} className={showFilters ? 'text-white' : 'text-primary'} /> 
            <span>Advanced Filters</span>
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="glass p-8 rounded-[40px] mb-12 grid grid-cols-1 md:grid-cols-4 gap-8 animate-slide-down border border-border shadow-2xl bg-card/90 backdrop-blur-xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl p-4 text-foreground outline-none focus:ring-2 focus:ring-primary/50 font-bold appearance-none"
              >
                <option value="All">All Categories</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Min Price</label>
              <input 
                type="number" 
                placeholder="Ex. 50000" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl p-4 text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/50 font-bold" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Beds</label>
              <div className="flex gap-2">
                {['All', 1, 2, 3, '4+'].map(b => (
                  <button 
                    key={b} 
                    onClick={() => setBeds(b)}
                    className={`flex-grow py-3 rounded-xl transition-all font-black text-sm ${
                      beds === b 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-background border border-border text-muted-foreground hover:bg-card'
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

        {loading || isPaginating ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] animate-pulse">
              {isPaginating ? 'Updating Catalog...' : 'Syncing Property Vault...'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                  className="rounded-xl px-6 py-4 font-black"
                >
                  PREV
                </Button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110'
                          : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                  className="rounded-xl px-6 py-4 font-black"
                >
                  NEXT
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-32 glass rounded-3xl bg-card border-border border">
             <MapPin size={64} className="mx-auto text-muted mb-6" />
             <h2 className="text-3xl font-black mb-4 text-foreground">No Properties Found</h2>
             <Button variant="outline" onClick={() => { setSearch(''); setActiveTab('All'); }}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
