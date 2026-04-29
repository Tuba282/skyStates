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
      <Card className="w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />

        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary mb-4 shadow-inner">
            <Home size={40} />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Welcome Back</h2>
          <p className="text-muted font-medium mt-2">Access your next-level real estate portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email Address" 
            placeholder="admin@estate.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="text-black"
            />
          <Input 
            label="Password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-black"
            required
            type="password"
          />
          <Button type="submit" className="w-full py-4 text-xl font-black mt-4 shadow-xl" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-border text-center">
           <p className="text-sm text-muted font-medium mb-4">Demo Credentials (fill in .env and register first)</p>
           <p className="text-center text-sm text-muted">
            Don't have an account? <a href="/signup" className="text-primary font-bold hover:underline">Create Account</a>
          </p>
        </div>
      </Card>
    </div>
  );
}
