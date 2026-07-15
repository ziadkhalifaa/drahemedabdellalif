'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import {
  User, Shield, Lock, Save, Phone, Mail,
  FileText, Calendar, LogOut, HeartPulse,
  ChevronRight, LayoutDashboard, Pill, Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const t = useTranslations('dashboard');
  const tProfile = useTranslations('dashboard.profile');
  const locale = useLocale();
  const isRTL = locale === 'ar';
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
      const payload: any = { name: formData.name, phone: formData.phone };
      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }
      const res = await api.post('/auth/profile', payload, token || undefined);
      const updatedUser = { ...user, ...res };
      login(token, updatedUser);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      toast.success(tProfile('success'));
    } catch (err: any) {
      toast.error(err.message || tProfile('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => logout();

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('menu.overview'), href: '/dashboard' },
    { id: 'appointments', icon: Calendar, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { id: 'reports', icon: FileText, label: t('menu.reports'), href: '/dashboard/reports' },
    { id: 'prescriptions', icon: Pill, label: t('menu.prescriptions'), href: '/dashboard/prescriptions' },
    { id: 'profile', icon: User, label: t('menu.profile'), href: '/dashboard/profile', active: true },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative pt-28 pb-20 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-[#0b1120] dark:to-indigo-950/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-5%] w-[35vw] h-[35vw] bg-teal-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block space-y-5">
              <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/30 dark:border-white/5 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
                <div className="relative overflow-hidden px-5 pt-8 pb-6 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900/80 dark:to-indigo-950/80">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl transform -translate-x-1/3 translate-y-1/3" />
                  <div className="relative text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/10 mb-3">
                      <span className="text-2xl font-black text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'Patient'}</p>
                    <p className="text-[10px] font-semibold text-indigo-200/70 uppercase tracking-widest mt-1">{isRTL ? 'حساب مريض' : 'Patient Account'}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="space-y-0.5">
                    {sidebarItems.map((item) => (
                      <Link key={item.id} href={item.href as any}
                        className={cn(
                          "group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all",
                          item.active
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            : "text-slate-500 dark:text-white/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
                        )}
                      >
                        <item.icon size={17} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                        <ChevronRight size={13} className={cn("ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", isRTL && "rotate-180", item.active && "opacity-100")} />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={17} className="shrink-0" />
                      {t('menu.logout')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-xl shadow-indigo-500/20">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <HeartPulse size={28} className="text-white/80 mb-3" />
                <h4 className="text-sm font-black text-white mb-1.5">{t('needHelp')}</h4>
                <p className="text-[11px] font-medium text-white/70 mb-4 leading-relaxed">{t('helpDesc')}</p>
                <Link href="/contact">
                  <Button className="w-full h-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 rounded-xl text-[11px] font-bold transition-all">
                    {t('contactSupport')}
                  </Button>
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
              {/* Header */}
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{tProfile('title')}</h1>
                  <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{tProfile('subtitle')}</p>
                </div>
              </motion.div>

              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Personal Info */}
                <motion.div variants={fadeUp}>
                  <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6 lg:p-8">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <User size={15} className="text-white" />
                      </div>
                      {tProfile('personalInfo')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{tProfile('fullName')}</label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={cn("py-3 rounded-xl text-[13px] font-medium", isRTL ? "text-right" : "text-left")} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{tProfile('phone')}</label>
                        <div className="relative">
                          <Phone className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={16} />
                          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={cn("py-3 rounded-xl text-[13px] font-medium", isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4", "dir-ltr")} dir="ltr" />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{tProfile('email')}</label>
                        <div className="relative">
                          <Mail className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={16} />
                          <Input value={user?.email || ''} disabled className={cn("py-3 rounded-xl text-[13px] font-medium bg-slate-50 dark:bg-white/[0.02] opacity-70 cursor-not-allowed", isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4", "dir-ltr")} dir="ltr" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Security */}
                <motion.div variants={fadeUp}>
                  <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6 lg:p-8">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Shield size={15} className="text-white" />
                      </div>
                      {tProfile('security')}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{tProfile('currentPassword')}</label>
                        <div className="relative">
                          <Lock className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={16} />
                          <Input type="password" value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} placeholder="••••••••" className={cn("py-3 rounded-xl text-[13px] font-medium", isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4")} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{tProfile('newPassword')}</label>
                        <div className="relative">
                          <Lock className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={16} />
                          <Input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} placeholder="••••••••" className={cn("py-3 rounded-xl text-[13px] font-medium", isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4")} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div variants={fadeUp} className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
                  <Button type="submit" disabled={loading}
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all gap-2"
                  >
                    <Save size={17} />
                    {loading ? tProfile('saving') : tProfile('saveChanges')}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
