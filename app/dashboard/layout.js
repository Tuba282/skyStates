'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Home, 
  PlusCircle, 
  Settings, 
  Users, 
  MessageSquare, 
  Heart, 
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { Button, Badge, cn } from '@/components/ui';

export default function DashboardLayout({ children }) {
  const { user, loading, logout, isAdmin, isAgent } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close mobile menu on view change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  if (loading || !user) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
       <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
          <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing OS...</p>
       </div>
    </div>
  );

  const agentLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, view: 'overview' },
    { name: 'My Properties', href: '/dashboard?view=listings', icon: Home, view: 'listings' },
    { name: 'Add Listing', href: '/dashboard/add-property', icon: PlusCircle, view: 'add' },
    { name: 'Inquiries', href: '/dashboard?view=inquiries', icon: MessageSquare, view: 'inquiries' },
  ];

  const adminLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, view: 'overview' },
    { name: 'All Listings', href: '/dashboard?view=listings', icon: Home, view: 'listings' },
    { name: 'Manage Users', href: '/dashboard?view=users', icon: Users, view: 'users' },
    { name: 'Inquiries', href: '/dashboard?view=inquiries', icon: MessageSquare, view: 'inquiries' },
  ];

  const userLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, view: 'overview' },
    { name: 'My Favorites', href: '/favorites', icon: Heart, view: 'favorites' },
    { name: 'My Profile', href: '/dashboard?view=profile', icon: Settings, view: 'profile' },
  ];

  const links = isAdmin ? adminLinks : isAgent ? agentLinks : userLinks;

  const SidebarContent = () => (
    <>
      <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
         {/* Profile Header */}
         <div className="flex items-center gap-3 mb-10 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <div className="relative">
              <img src={user.avatar || 'https://i.pravatar.cc/150'} alt={user.name} className="h-11 w-11 rounded-xl object-cover shadow-sm border-2 border-white" />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-slate-900 leading-none mb-1 text-sm truncate">{user.name}</p>
              <Badge className={cn(
                "border-none text-[8px] font-black uppercase px-2 py-0 shadow-none",
                isAdmin ? "bg-purple-100 text-purple-600" : "bg-primary/10 text-primary"
              )}>
                {user.role}
              </Badge>
            </div>
         </div>
         
         <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive = currentView === link.view;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl font-black text-sm transition-all group border-2",
                    isActive 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={20} strokeWidth={isActive ? 3 : 2} />
                    <span className="tracking-tight">{link.name}</span>
                  </div>
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
                </Link>
              );
            })}
         </nav>
      </div>

      {/* Logout Section */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700 font-black text-xs gap-3 rounded-xl h-12 transition-all active:scale-95 px-4 group" 
          onClick={logout}
        >
          <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut size={18} />
          </div>
          TERMINATE SESSION
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
         <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
           <span className="font-black text-slate-900 tracking-tighter">SkyEstate <span className="text-primary italic">OS</span></span>
         </div>
         <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="h-10 w-10 text-slate-600 rounded-xl bg-slate-50 hover:bg-slate-100">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
         </Button>
      </div>

      {/* Mobile Overlay Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] md:hidden animate-in fade-in transition-all" onClick={() => setIsMobileMenuOpen(false)}>
           <div className="w-[85%] max-w-[300px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">Navigation Terminal</span>
                <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <X size={20} />
                </Button>
              </div>
              <SidebarContent />
           </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Main Orchestration Area */}
      <main className={cn(
        "flex-grow p-4 md:p-10 transition-all duration-300",
        isMobileMenuOpen ? "blur-sm md:blur-none" : ""
      )}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
