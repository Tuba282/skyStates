'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { Home, User, Briefcase, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register({ ...formData, role });
    setLoading(false);

    if (res.success) {
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } else {
      toast.error(res.message);
    }
  };

  const updateForm = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-xl p-10 shadow-2xl relative overflow-hidden bg-card border-border">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Initialize <span className="text-primary italic">Profile</span></h2>
          <p className="text-muted-foreground font-black mt-2 text-[10px] uppercase tracking-[0.2em]">Join the premium real estate network</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <Input name="name" label="Full Name" placeholder="John Doe" onChange={updateForm} required className="bg-background border-border text-foreground"/>
          <Input name="email" label="Email Address" type="email" placeholder="john@example.com" onChange={updateForm} required className="bg-background border-border text-foreground"/>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Join As</label>
            <div className="grid grid-cols-2 gap-4">
               <button 
                type="button"
                onClick={() => setRole('USER')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === 'USER' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-border text-muted-foreground hover:border-muted'
                }`}
               >
                 <User size={20} /> <span className="font-black text-sm uppercase tracking-tight">Home Buyer</span>
               </button>
               <button 
                type="button"
                onClick={() => setRole('AGENT')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === 'AGENT' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-border text-muted-foreground hover:border-muted'
                }`}
               >
                 <Briefcase size={20} /> <span className="font-black text-sm uppercase tracking-tight">Property Agent</span>
               </button>
            </div>
          </div>

          <Input name="password" label="Password" type="password" placeholder="••••••••" onChange={updateForm} required className="bg-background border-border text-foreground"/>
          
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground p-2 uppercase tracking-widest">
             <CheckCircle size={14} className="text-accent" />
             I agree to the secure protocol & terms
          </div>

          <Button type="submit" className="w-full py-4 text-xl font-black shadow-xl shadow-primary/20 bg-primary text-white border-none" disabled={loading}>
            {loading ? 'INITIALIZING...' : 'START YOUR JOURNEY'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8 font-bold">
          Already have an account? <a href="/login" className="text-primary font-black hover:underline ml-1">Log in now</a>
        </p>
      </Card>
    </div>
  );
}
