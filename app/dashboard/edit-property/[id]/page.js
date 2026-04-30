'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Button, Input, Card } from '@/components/ui';
import { Upload, X, Check, ArrowRight, ImageIcon, MapPin, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditPropertyPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: 'Villa',
    type: 'Sale',
    beds: 2,
    baths: 1,
    area: '',
    amenities: [],
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`);
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          category: data.category,
          type: data.type,
          beds: data.beds,
          baths: data.baths,
          area: data.area,
          amenities: data.amenities || [],
        });
        setImages(data.images || []);
      } catch (error) {
        toast.error('Failed to load property data');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, router]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const { data: sigData } = await axios.post('/api/upload');
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', sigData.apiKey);
      uploadData.append('timestamp', sigData.timestamp);
      uploadData.append('signature', sigData.signature);
      
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (preset && preset !== 'your_upload_preset') {
        uploadData.append('upload_preset', preset);
      }

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        uploadData
      );

      setImages([...images, res.data.secure_url]);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error('Add at least one image');

    try {
      setSaving(true);
      await axios.put(`/api/properties/${id}`, { ...formData, images });
      toast.success('Property Updated!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black">Edit <span className="text-primary italic">Property</span></h1>
        <div className="flex items-center gap-2">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
           ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {step === 1 && (
          <section className="animate-fade-in space-y-6">
            <Card className="p-8 space-y-8 bg-card border-border">
              <h3 className="text-2xl font-black flex items-center gap-2"><Info className="text-primary" /> Basic Info</h3>
              <div className="space-y-6">
                <Input name="title" label="Title" value={formData.title} onChange={updateForm} required className="bg-background border-border text-foreground" />
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold">Category</label>
                     <select name="category" value={formData.category} onChange={updateForm} className="w-full p-3 rounded-xl bg-background border border-border outline-none text-foreground">
                        <option>Villa</option>
                        <option>Apartment</option>
                        <option>Office</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-sm font-bold">Type</label>
                     <select name="type" value={formData.type} onChange={updateForm} className="w-full p-3 rounded-xl bg-background border border-border outline-none text-foreground">
                        <option>Sale</option>
                        <option>Rent</option>
                     </select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <Input name="price" label="Price ($)" type="number" value={formData.price} onChange={updateForm} required className="bg-background border-border text-foreground" />
                   <Input name="area" label="Area" placeholder="2500 sqft" value={formData.area} onChange={updateForm} required className="bg-background border-border text-foreground" />
                </div>
              </div>
            </Card>
            <div className="flex justify-end"><Button type="button" onClick={() => setStep(2)} className="px-10 gap-2">Next <ArrowRight size={20} /></Button></div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-fade-in space-y-6">
            <Card className="p-8 space-y-8 bg-card border-border">
              <h3 className="text-2xl font-black flex items-center gap-2"><MapPin className="text-primary" /> Details</h3>
                <Input name="location" label="Location" value={formData.location} onChange={updateForm} required className="bg-background border-border text-foreground" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <Input name="beds" label="Beds" type="number" value={formData.beds} onChange={updateForm} />
                   <Input name="baths" label="Baths" type="number" value={formData.baths} onChange={updateForm} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-bold">Description</label>
                   <textarea name="description" value={formData.description} onChange={updateForm} className="w-full p-4 rounded-xl bg-background border border-border h-32 outline-none text-foreground"></textarea>
                </div>
            </Card>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button type="button" onClick={() => setStep(3)} className="px-10 gap-2">Media <ArrowRight size={20} /></Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-fade-in space-y-6">
            <Card className="p-8 space-y-8 bg-card border-border">
               <h3 className="text-2xl font-black flex items-center gap-2"><ImageIcon className="text-primary" /> Gallery</h3>
               <div className="border-4 border-dashed border-border rounded-[40px] p-20 text-center relative hover:bg-primary/5 transition-all">
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload size={48} className="mx-auto text-primary mb-4" />
                  <p className="text-xl font-black">Upload Property Images</p>
               </div>
               <div className="grid grid-cols-4 gap-6 mt-10">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-3xl overflow-hidden border-2 border-primary">
                       <img src={img} className="w-full h-full object-cover" />
                       <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14} /></button>
                    </div>
                  ))}
                  {saving && <div className="aspect-square bg-muted rounded-3xl animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
               </div>
            </Card>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" disabled={saving} className="px-10 py-4 h-auto text-xl font-black bg-primary shadow-2xl hover:opacity-90">{saving ? 'Updating...' : 'Update Property'}</Button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
