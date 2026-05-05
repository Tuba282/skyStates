'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Badge, Input } from '@/components/ui';
import { 
  Bed, Bath, Move, MapPin,
  MessageSquare, ArrowLeft, Send, User, CheckCircle, Clock
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Status badge helper
const StatusBadge = ({ status }) => {
  const cfg = {
    Unread:  { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',  label: 'UNREAD'  },
    Read:    { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   label: 'READ'    },
    Replied: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'REPLIED' },
  };
  const s = cfg[status] || cfg.Unread;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
      {s.label}
    </span>
  );
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`);
        setProperty(data);
      } catch {
        toast.error('Property not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);



  const handleInquiry = async (e) => {
    e.preventDefault();
    setSendingInquiry(true);
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
      toast.success('Inquiry sent! Agent will reply shortly.');
      e.target.reset();
    } catch {
      toast.error('Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-muted font-black uppercase tracking-widest text-xs animate-pulse">Loading Property...</p>
      </div>
    );
  }
  if (!property) return <div className="p-20 text-center text-4xl font-black text-foreground">Property Not Found</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Link href="/properties" className="flex items-center gap-2 text-muted hover:text-primary font-bold transition-colors mb-6">
          <ArrowLeft size={22} /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl relative">
                <img src={property.images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
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

            {/* Details Card */}
            <div className="bg-card p-10 rounded-[40px] shadow-sm border border-border">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div className="flex-grow">
                  <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-foreground leading-tight">{property.title}</h1>
                  <p className="flex items-center text-muted-foreground text-lg font-medium"><MapPin className="text-primary mr-2" /> {property.location}</p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <p className="text-4xl md:text-5xl font-black text-primary">${property.price.toLocaleString()}</p>
                  <p className="text-muted-foreground font-black mt-2 uppercase tracking-widest text-[10px]">{property.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 py-10 border-y border-border mb-10">
                <div className="text-center">
                  <Bed size={32} className="mx-auto text-primary mb-3" />
                  <p className="text-2xl font-black text-foreground">{property.beds}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Beds</p>
                </div>
                <div className="text-center border-x border-border px-4">
                  <Bath size={32} className="mx-auto text-primary mb-3" />
                  <p className="text-2xl font-black text-foreground">{property.baths}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Baths</p>
                </div>
                <div className="text-center">
                  <Move size={32} className="mx-auto text-primary mb-3" />
                  <p className="text-2xl font-black text-foreground">{property.area}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Area</p>
                </div>
              </div>

              <h3 className="text-2xl font-black mb-4 text-foreground">About this Property</h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-medium">{property.description}</p>
            </div>


          </div>

          {/* RIGHT COLUMN — Contact Form */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-24 shadow-2xl border border-border bg-card">
              <div className="flex items-center gap-4 mb-8">
                <img src={property.agent.avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20" alt={property.agent.name} />
                <div>
                  <h4 className="text-xl font-black text-foreground">{property.agent.name}</h4>
                  <p className="text-primary font-black text-xs uppercase tracking-widest">{property.agent.agency || 'Agent'}</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleInquiry}>
                <Input name="name" label="Your Name" required className="bg-background border-border text-foreground" />
                <Input name="email" label="Your Email" type="email" required className="bg-background border-border text-foreground" />
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-foreground">Message</label>
                  <textarea name="message" required className="w-full p-4 rounded-xl border border-border h-32 bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="I'm interested in this property..." />
                </div>
                <Button type="submit" disabled={sendingInquiry} className="w-full py-4 text-lg font-black gap-2 bg-primary text-white shadow-xl shadow-primary/20 disabled:opacity-60">
                  {sendingInquiry ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <><Send size={20} /> Send Inquiry</>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
