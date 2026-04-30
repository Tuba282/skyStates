'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { Home, Shield, User, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-md p-10 shadow-2xl relative overflow-hidden bg-card border-border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />

        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary mb-4 shadow-inner border border-primary/20">
            <Home size={40} />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Secure <span className="text-primary italic">Access</span></h2>
          <p className="text-muted-foreground font-black mt-2 text-[10px] uppercase tracking-[0.2em]">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email Address" 
            placeholder="admin@estate.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="bg-background border-border text-foreground"
            />
          <Input 
            label="Password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background border-border text-foreground"
            required
            type="password"
          />
          <Button type="submit" className="w-full py-4 text-xl font-black mt-4 shadow-xl shadow-primary/20 bg-primary text-white border-none" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-border text-center">
           <p className="text-center text-sm text-muted-foreground font-bold">
            Don't have an account? <a href="/signup" className="text-primary font-black hover:underline ml-1">Create Account</a>
          </p>
        </div>
      </Card>
    </div>
  );
}
