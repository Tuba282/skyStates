'use client';

import { Card, Badge, Button } from '@/components/ui';
import { Bed, Bath, Move, Heart, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PropertyCard({ property }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('skyestate_favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === property.id));
  }, [property.id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    const favorites = JSON.parse(localStorage.getItem('skyestate_favorites') || '[]');
    let updated;
    
    if (isFavorite) {
      updated = favorites.filter(fav => fav.id !== property.id);
      toast.success('Removed from wishlist');
    } else {
      updated = [...favorites, property];
      toast.success('Added to wishlist!');
    }
    
    localStorage.setItem('skyestate_favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    
    // Dispatch custom event to notify other components (like Favorites page)
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  return (
    <Card hover className="group flex flex-col h-full bg-card">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Badge className={`text-sm font-black px-4 py-1.5 shadow-lg border-none ${property.type === 'Sale' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
            FOR {property.type.toUpperCase()}
          </Badge>
          {property.featured && (
            <Badge className="bg-amber-500 text-white border-none shadow-lg px-4 py-1.5 text-sm font-black ring-2 ring-white/20">
              FEATURED
            </Badge>
          )}
        </div>
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full glass hover:bg-white transition-colors group/fav"
        >
          <Heart className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover/fav:text-red-500'} size={20} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/properties/${property.id}`}>{property.title}</Link>
          </h3>
        </div>
        
        <div className="flex items-center text-muted text-sm mb-4">
          <MapPin size={14} className="mr-1" />
          {property.location}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-muted">
            <Bed size={16} />
            <span className="text-sm font-semibold">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Bath size={16} />
            <span className="text-sm font-semibold">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Move size={16} />
            <span className="text-sm font-semibold">{property.area}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">Price</p>
            <p className="text-2xl font-black text-primary">
              ${property.price.toLocaleString()}
              {property.type === 'Rent' && <span className="text-sm font-normal">/mo</span>}
            </p>
          </div>
          <Link href={`/properties/${property.id}`}>
            <Button size="sm" variant="outline">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
