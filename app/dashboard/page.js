'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Badge, Button, cn } from '@/components/ui';
import { 
  Home, TrendingUp, Users as UsersIcon, MessageSquare, 
  Plus, Edit2, Trash2, User as UserIcon,
  Search, MapPin, CheckCircle, XCircle, Eye, ChevronRight, X, ShieldAlert,
  UserPlus, Lock, Mail, UserCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// --- SUB-COMPONENTS (Defined outside to prevent re-renders losing focus) ---

const SearchBar = ({ placeholder, value, onChange }) => (
  <div className="relative group max-w-xs w-full">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
    <input 
      type="text" 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
    />
  </div>
);

const PaginationTrigger = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
      {[...Array(totalPages)].map((_, i) => (
        <Button 
          key={i} 
          variant={currentPage === i + 1 ? 'default' : 'outline'}
          className={cn(
            "h-10 w-10 rounded-xl font-black text-sm transition-all", 
            currentPage === i + 1 
              ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary" 
              : "text-slate-400 border-slate-200 hover:border-primary/30 hover:text-primary"
          )}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </Button>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user, isAdmin, isAgent } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'overview';
  
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals for CRUD
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'AGENT' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        axios.get('/api/dashboard/stats'),
        axios.get(`/api/properties${isAgent ? `?agent=${user.id}` : ''}`),
        axios.get('/api/inquiries')
      ];
      
      if (isAdmin && view === 'users') {
        endpoints.push(axios.get('/api/admin/users'));
      }

      const res = await Promise.all(endpoints);
      
      setStats(res[0].data);
      setProperties(res[1].data || []);
      setInquiries(res[2].data || []);
      if (res[3]) setUsersList(res[3].data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isAgent, view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination on view or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [view, searchTerm]);

  // --- ACTIONS ---

  const handleDeleteUser = async (id) => {
    if (id === user.id) return toast.error("Action denied: Cannot terminate self!");
    if (!confirm("CRITICAL ACTION: Terminate this user profile permanently?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast.success("Identity Neutralized");
      fetchData();
    } catch (error) {
      toast.error("Operation block: System error");
    }
  };

  const handleToggleBlock = async (u) => {
    if (u._id === user.id) return toast.error("System breach: Cannot block primary admin!");
    try {
      const newStatus = u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
      await axios.put(`/api/admin/users/${u._id}`, { status: newStatus });
      toast.success(`Protocol: User status set to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error("Handshake failure");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', newUser);
      toast.success("Agent Uplink Established");
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'AGENT' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Protocol override: Failed to add user");
    }
  };

  const handleUpdatePassword = async (id) => {
    const newPass = prompt("AUTHORIZATION REQUIRED: Enter new encrypted key (password):");
    if (!newPass) return;
    try {
      await axios.put(`/api/admin/users/${id}`, { password: newPass });
      toast.success("Security Key Rotated Successfully");
    } catch (error) {
      toast.error("Encryption failure");
    }
  };

  const handleTogglePropertyStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Approved' ? 'Pending' : 'Approved';
      await axios.put(`/api/properties/${id}`, { status: newStatus });
      toast.success(`Listing ${newStatus === 'Approved' ? 'Validated' : 'Suspended'}`);
      fetchData();
    } catch (error) {
      toast.error("Process failed");
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!confirm("Are you sure? This listing will be purged from the registry.")) return;
    try {
      await axios.delete(`/api/properties/${id}`);
      toast.success("Listing Purged");
      fetchData();
    } catch (error) {
      toast.error("Purge failed");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Hyperlink...</p>
      </div>
    );
  }

  // --- FILTERS ---
  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(i => 
    i.senderName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginate = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  // --- VIEWS ---

  if (view === 'listings') {
    const data = paginate(filteredProperties);
    return (
      <div className="space-y-6 animate-fade-in-up">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                 <Home size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-none">Property <span className="text-primary italic">Vault</span></h1>
                <p className="text-slate-400 font-bold mt-1 text-[10px] uppercase tracking-widest">{filteredProperties.length} ACTIVE</p>
              </div>
           </div>
           <SearchBar placeholder="Search registry..." value={searchTerm} onChange={setSearchTerm} />
        </header>

        <Card className="overflow-hidden border-none shadow-xl rounded-[32px] bg-white">
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Registry Details</th>
                  <th className="px-6 py-4">Valuation</th>
                  <th className="px-6 py-4">Auth Status</th>
                  <th className="px-6 py-4 text-right">Goverance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((prop) => (
                  <tr key={prop._id || prop.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={prop.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover shadow-md border-2 border-white group-hover:scale-105 transition-transform" />
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1.5">{prop.title}</p>
                          <p className="text-slate-400 font-bold text-[10px] flex items-center gap-1"><MapPin size={10} className="text-primary" /> {prop.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-lg tracking-tighter">
                      ${prop.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className={cn(
                         "text-[9px] uppercase font-black tracking-widest border-emerald-100 bg-emerald-50 text-emerald-600",
                         prop.status !== 'Approved' && "border-amber-100 bg-amber-50 text-amber-600"
                       )}>
                         {prop.status.toUpperCase()}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Always show View button */}
                        <Button onClick={() => window.open(`/properties/${prop._id || prop.id}`, '_blank')} size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"><Eye size={16} /></Button>
                        
                        {isAdmin ? (
                          <>
                            <Button 
                              onClick={() => handleTogglePropertyStatus(prop._id || prop.id, prop.status)} 
                              size="icon" 
                              variant="ghost" 
                              className={cn(
                                "h-9 w-9 rounded-lg transition-colors",
                                prop.status === 'Approved' 
                                  ? "text-amber-500 hover:bg-amber-50" 
                                  : "text-emerald-500 hover:bg-emerald-50"
                              )}
                              title={prop.status === 'Approved' ? 'Mark Pending' : 'Approve'}
                            >
                              {prop.status === 'Approved' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </Button>
                            <Button onClick={() => handleDeleteProperty(prop._id || prop.id)} size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => router.push(`/dashboard/edit-property/${prop._id || prop.id}`)} size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"><Edit2 size={16} /></Button>
                            <Button onClick={() => handleDeleteProperty(prop._id || prop.id)} size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <PaginationTrigger totalItems={filteredProperties.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  if (view === 'inquiries') {
    const data = paginate(filteredInquiries);
    return (
      <div className="space-y-6 animate-fade-in-up">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-900">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <MessageSquare size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-black leading-none tracking-tight">Signal <span className="text-primary italic">Bridge</span></h1>
                <p className="text-slate-400 font-bold mt-1 text-[10px] uppercase tracking-widest">{filteredInquiries.length} SIGNALS</p>
              </div>
           </div>
           <SearchBar placeholder="Search decrypt..." value={searchTerm} onChange={setSearchTerm} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map(inq => (
            <Card key={inq._id} className="p-6 border-none bg-white shadow-xl rounded-2xl group hover:-translate-y-1 transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                        <UserIcon className="text-primary" size={20} />
                     </div>
                     <div>
                        <h4 className="font-black text-slate-900 text-sm leading-none mb-1">{inq.senderName}</h4>
                        <p className="text-primary text-[9px] font-black uppercase tracking-widest">{inq.senderEmail}</p>
                     </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] tracking-widest">{inq.status.toUpperCase()}</Badge>
               </div>
               <p className="text-slate-500 text-xs font-bold italic leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-white">"{inq.message}"</p>
               <div className="flex gap-2">
                  <Button className="flex-grow h-10 rounded-xl font-black text-[10px] tracking-widest">TRANSMIT REPLY</Button>
                  <Button variant="outline" className="h-10 px-4 rounded-xl text-slate-400 font-black border-slate-100 hover:bg-slate-50 hover:text-slate-900 text-[9px] uppercase tracking-widest">ARCHIVE</Button>
               </div>
            </Card>
          ))}
        </div>
        <PaginationTrigger totalItems={filteredInquiries.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  if (view === 'users' && isAdmin) {
    const data = paginate(filteredUsers);
    return (
      <div className="space-y-6 animate-fade-in-up relative">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
                 <UsersIcon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-black leading-none tracking-tight text-slate-900">Citizen <span className="text-purple-600 italic">Control</span></h1>
                <p className="text-slate-400 font-bold mt-1 text-[10px] uppercase tracking-widest">{filteredUsers.length} PROFILES</p>
              </div>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
             <SearchBar placeholder="Search profiles..." value={searchTerm} onChange={setSearchTerm} />
             <Button onClick={() => setShowAddUserModal(true)} className="h-10 rounded-xl bg-purple-600 text-white font-black text-xs gap-2 px-4 whitespace-nowrap"><UserPlus size={16} /> ACTIVATE AGENT</Button>
           </div>
        </header>

        <Card className="overflow-hidden border-none shadow-xl rounded-[32px] bg-white">
          <div className="overflow-x-auto text-sm text-slate-900">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Civilian Profile</th>
                  <th className="px-6 py-4 text-center">Auth Level</th>
                  <th className="px-6 py-4 text-right">Goverance Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u._id} className={cn("hover:bg-slate-50/50 transition-all group", u.status === 'BLOCKED' && "bg-red-50/30 opacity-80")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={u.avatar || 'https://i.pravatar.cc/150'} className="h-10 w-10 rounded-xl object-cover shadow-sm border border-slate-200" />
                          {u.status === 'BLOCKED' && <ShieldAlert size={14} className="absolute -top-1 -right-1 text-red-500 fill-white" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1">{u.name} {u._id === user.id && <span className="text-[8px] text-primary">(ME)</span>}</p>
                          <p className="text-slate-500 font-bold text-[10px] tracking-tight">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={cn(
                        "px-3 py-0.5 rounded-lg font-black text-[8px] tracking-widest border-none shadow-sm",
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : u.role === 'AGENT' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'
                      )}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <Button onClick={() => handleUpdatePassword(u._id)} size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"><Lock size={14} /></Button>
                         <Button onClick={() => handleToggleBlock(u)} size="sm" variant="ghost" className={cn("h-8 px-3 rounded-lg font-black text-[8px] uppercase tracking-widest transition-colors", u.status === 'BLOCKED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100')}>{u.status === 'BLOCKED' ? 'UNBLOCK' : 'BLOCK'}</Button>
                         <Button onClick={() => handleDeleteUser(u._id)} size="sm" variant="ghost" className="h-8 px-3 rounded-lg bg-red-50 text-red-600 font-black text-[8px] uppercase tracking-widest hover:bg-red-100">TERM</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <PaginationTrigger totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 rounded-[32px] border-none shadow-2xl relative bg-white scale-in-center">
              <Button size="icon" variant="ghost" onClick={() => setShowAddUserModal(false)} className="absolute top-4 right-4 text-slate-400"><X size={20} /></Button>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Activate <span className="text-purple-600 italic">Agent</span></h2>
              <p className="text-slate-400 font-bold text-xs mb-8 uppercase tracking-widest">Enroll new authenticated personnel</p>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Display Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-purple-200 outline-none font-bold text-sm text-slate-900" placeholder="Full Name" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Access Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} type="email" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-purple-200 outline-none font-bold text-sm text-slate-900" placeholder="email@skyestate.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Initial Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} type="password" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-purple-200 outline-none font-bold text-sm text-slate-900" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-1.5 pb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Assigned Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-purple-200 outline-none font-black text-sm text-slate-900 appearance-none">
                    <option value="AGENT">FIELD AGENT</option>
                    <option value="ADMIN">SYS ADMINISTRATOR</option>
                  </select>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-purple-600 text-white font-black text-lg tracking-widest shadow-xl shadow-purple-600/20 active:scale-95 transition-all">AUTHORIZE ENROLLMENT</Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // --- OVERVIEW (Default) ---
  if (!stats) return null;

  const statCards = [
    { label: isAgent ? 'Portfolio' : 'Inventory', value: stats.totalListings, icon: Home, color: 'text-primary' },
    { label: 'Signals', value: stats.newInquiries, icon: MessageSquare, color: 'text-accent' },
    { label: 'Activity', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'text-sky-500' },
    { label: isAdmin ? 'Registry' : 'Agents', value: stats.platformUsers, icon: UsersIcon, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Mini-OS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
           <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">SkyEstate <span className="text-primary italic">OS</span></h1>
           <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 
             Authenticated: <span className="font-black text-slate-900">{user.name}</span>
           </p>
        </div>
        {isAgent && (
          <Link href="/dashboard/add-property" className="relative group shrink-0">
            <Button className="flex items-center gap-2 h-12 px-8 rounded-2xl font-black text-md shadow-lg shadow-primary/20 bg-primary text-white">
              <Plus size={20} strokeWidth={4} /> Add Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Grid Stats (Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-6 border-none bg-white shadow-xl rounded-3xl relative overflow-hidden group">
            <div className={`p-3 bg-slate-50 rounded-xl ${stat.color} mb-4 w-fit`}>
               <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Inventory</h2>
               <Link href="/dashboard?view=listings" className="text-primary font-black text-xs hover:underline uppercase tracking-widest">Portal Access</Link>
            </div>
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden p-2">
               <table className="w-full text-left text-sm text-slate-900">
                 <tbody className="divide-y divide-slate-50">
                   {properties.slice(0, 4).map((prop) => (
                     <tr key={prop._id || prop.id} className="hover:bg-slate-50/80 transition-all group">
                       <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                             <img src={prop.images[0]} alt="" className="h-14 w-14 rounded-2xl object-cover shadow-md border-2 border-white" />
                             <div>
                                <p className="font-black text-slate-900 leading-none mb-1 tracking-tight">{prop.title}</p>
                                <p className="text-slate-400 font-bold text-[10px] tracking-tight">{prop.location}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-4 text-right">
                          <p className="font-black text-primary text-xl tracking-tighter">${prop.price.toLocaleString()}</p>
                          <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[8px] px-2 py-0">UNIT</Badge>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </Card>
         </div>

         <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-black text-slate-900 tracking-tight">System Stream</h2>
               <Link href="/dashboard?view=inquiries" className="text-accent font-black text-xs hover:underline uppercase tracking-widest">Signal Hub</Link>
            </div>
            <div className="space-y-4">
               {inquiries.slice(0, 3).map(inq => (
                 <Card key={inq._id} className="p-5 border-none bg-white shadow-xl rounded-3xl border-l-4 border-l-primary/10">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <UserIcon size={20} className="text-primary" />
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900 text-sm leading-none mb-1 truncate">{inq.senderName}</h4>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">LEAD SIGNAL</p>
                       </div>
                    </div>
                    <p className="text-slate-500 font-bold text-[10px] italic line-clamp-2">"{inq.message}"</p>
                 </Card>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
