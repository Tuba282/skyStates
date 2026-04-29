'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Badge, Input } from '@/components/ui';
import { 
  Bed, Bath, Move, MapPin, Share2, Heart, 
  CheckCircle, MessageSquare, Phone, Map as MapIcon, 
  ArrowLeft, Send
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`);
        setProperty(data);
      } catch (error) {
        toast.error('Property not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      property: id,
      agent: property.agent._id,
      senderName: formData.get('name'),
      senderEmail: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      await axios.post('/api/inquiries', payload);
      toast.success('Inquiry sent successfully!');
      e.target.reset();
    } catch (error) {
      toast.error('Failed to send inquiry');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Property...</div>;
  if (!property) return <div className="p-20 text-center text-4xl font-black">Property Not Found</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Link href="/properties" className="flex items-center gap-2 text-muted hover:text-primary font-bold transition-colors mb-6">
          <ArrowLeft size={22} /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl relative">
                <img src={property.images[activeImage]} alt="" className="w-full h-full object-cover" />
                <Badge className={`absolute top-8 left-8 text-lg px-6 py-2 shadow-xl border-none ${property.type === 'Sale' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                  FOR {property.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {property.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-32 h-32 rounded-2xl overflow-hidden border-4 shrink-0 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-60'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-border/50">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div className="flex-grow">
                  <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900 leading-tight">{property.title}</h1>
                  <p className="flex items-center text-slate-500 text-lg font-medium"><MapPin className="text-primary mr-2" /> {property.location}</p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <p className="text-4xl md:text-5xl font-black text-primary">${property.price.toLocaleString()}</p>
                  <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-sm">{property.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 py-10 border-y border-border/50 mb-10">
                 <div className="text-center">
                    <Bed size={32} className="mx-auto text-primary mb-3" />
                    <p className="text-2xl font-black text-slate-900">{property.beds}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Beds</p>
                 </div>
                 <div className="text-center border-x border-border/50 px-4">
                    <Bath size={32} className="mx-auto text-primary mb-3" />
                    <p className="text-2xl font-black text-slate-900">{property.baths}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Baths</p>
                 </div>
                 <div className="text-center">
                    <Move size={32} className="mx-auto text-primary mb-3" />
                    <p className="text-2xl font-black text-slate-900">{property.area}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Area</p>
                 </div>
              </div>

              <h3 className="text-2xl font-black mb-4 text-slate-900">About this Property</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{property.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-24 shadow-2xl border-2 border-primary/5">
              <div className="flex items-center gap-4 mb-8">
                <img src={property.agent.avatar} className="w-16 h-16 rounded-full object-cover" />
                <div>
                   <h4 className="text-xl font-black">{property.agent.name}</h4>
                   <p className="text-primary font-bold text-sm">{property.agent.agency}</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleInquiry}>
                <Input name="name" label="Your Name" required />
                <Input name="email" label="Your Email" type="email" required />
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Message</label>
                  <textarea name="message" className="w-full p-4 rounded-xl border border-border h-32 bg-background focus:ring-2 focus:ring-primary/50 outline-none" placeholder="I'm interested in this property..."></textarea>
                </div>
                <Button type="submit" className="w-full py-4 text-lg font-black gap-2">
                  <Send size={20} /> Send Inquiry
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
