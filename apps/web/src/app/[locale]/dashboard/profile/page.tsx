'use client';

import { useTranslations } from 'next-intl';
import { Card, Button, Input } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import { User, Shield, Lock, Save, Phone, Mail, FileText, Calendar, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

export default function ProfilePage() {
  const t = useTranslations('dashboard');
  const tProfile = useTranslations('dashboard.profile');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, token, login, logout, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  if (!mounted) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!token) return;
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.post('/auth/profile', payload, token || undefined);
      // Update local storage
      const updatedUser = { ...user, ...res };
      login(token, updatedUser);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));

      toast.success(tProfile('success'));
    } catch (err: any) {
      toast.error(err.message || tProfile('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pt-32 pb-20">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex flex-col gap-6">
              <Card className="p-6 border-[var(--border)] rounded-3xl shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xl">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold">{user?.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href="/dashboard" className="flex items-center gap-3 w-full p-3 rounded-xl text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-all font-bold">
                    <User size={20} />
                    {t('menu.overview')}
                  </Link>
                  <Link href="/dashboard/appointments" className="flex items-center gap-3 w-full p-3 rounded-xl text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-all font-bold">
                    <Calendar size={20} />
                    {t('menu.appointments')}
                  </Link>
                  <Link href="/dashboard/reports" className="flex items-center gap-3 w-full p-3 rounded-xl text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-all font-bold">
                    <FileText size={20} />
                    {t('menu.reports')}
                  </Link>
                  <Link href="/dashboard/prescriptions" className="flex items-center gap-3 w-full p-3 rounded-xl text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-all font-bold">
                    <FileText size={20} />
                    Prescriptions
                  </Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-3 w-full p-3 rounded-xl bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 transition-all font-bold">
                    <User size={20} />
                    {t('menu.profile')}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-left mt-4"
                  >
                    <LogOut size={20} />
                    {t('menu.logout')}
                  </button>
                </div>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              <header>
                <h1 className="text-3xl font-black mb-2">{tProfile('title')}</h1>
                <p className="text-[var(--muted)]">{tProfile('subtitle')}</p>
              </header>

              <form onSubmit={handleUpdate} className="space-y-8">
                {/* Personal Info */}
                <Card className="p-8 border-[var(--border)] rounded-3xl shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <User className="text-[var(--primary)]" />
                    {tProfile('personalInfo')}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{tProfile('fullName')}</label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className="py-6 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{tProfile('phone')}</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                        <Input 
                          value={formData.phone} 
                          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                          className="pl-12 py-6 rounded-xl" 
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{tProfile('email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                        <Input 
                          value={user?.email || ''} 
                          disabled 
                          className="pl-12 py-6 rounded-xl bg-[var(--card)] opacity-70 cursor-not-allowed" 
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Security */}
                <Card className="p-8 border-[var(--border)] rounded-3xl shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="text-[var(--primary)]" />
                    {tProfile('security')}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{tProfile('currentPassword')}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                        <Input 
                          type="password"
                          value={formData.currentPassword} 
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} 
                          className="pl-12 py-6 rounded-xl" 
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{tProfile('newPassword')}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                        <Input 
                          type="password"
                          value={formData.newPassword} 
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                          className="pl-12 py-6 rounded-xl" 
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="py-7 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-xl shadow-[var(--primary)]/20">
                    <Save size={20} />
                    {loading ? tProfile('saving') : tProfile('saveChanges')}
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
