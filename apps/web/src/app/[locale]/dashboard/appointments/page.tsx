'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Skeleton } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import {
  Calendar, FileText, User as UserIcon, LogOut,
  Clock, Video, MapPin, CheckCircle, XCircle,
  Clock3, LayoutDashboard, Pill, HeartPulse, ChevronRight,
  Hourglass, AlertCircle, Sparkles
} from 'lucide-react';
import { cn, formatTime12Hour } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

const statusConfig: Record<string, { icon: any; cls: string; color: string }> = {
  pending: { icon: Hourglass, cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20', color: 'amber' },
  approved: { icon: CheckCircle, cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20', color: 'emerald' },
  completed: { icon: CheckCircle, cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20', color: 'blue' },
  cancelled: { icon: XCircle, cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-500/20', color: 'red' },
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PatientAppointmentsPage() {
  const t = useTranslations('dashboard');
  const tWizard = useTranslations('wizard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    if (token === null) return;
    if (!token) { router.push('/auth/login'); return; }
    api.get<any[]>('/appointments/my', token)
      .then(setAppointments)
      .catch(err => console.error("Failed to fetch appointments:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => logout();

  const filteredAppointments = useMemo(() =>
    appointments.filter(a => statusFilter === 'ALL' ? true : a.status?.toUpperCase() === statusFilter),
    [appointments, statusFilter]
  );

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments]);

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('menu.overview'), href: '/dashboard' },
    { id: 'appointments', icon: Calendar, label: t('menu.appointments'), href: '/dashboard/appointments', active: true },
    { id: 'reports', icon: FileText, label: t('menu.reports'), href: '/dashboard/reports' },
    { id: 'prescriptions', icon: Pill, label: t('menu.prescriptions'), href: '/dashboard/prescriptions' },
    { id: 'profile', icon: UserIcon, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const cfg = statusConfig[s] || statusConfig.pending;
    const Icon = cfg.icon;
    const labels: Record<string, string> = {
      pending: t('status_pending'),
      approved: t('status_approved'),
      completed: t('status_completed'),
      cancelled: t('status_cancelled'),
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${cfg.cls}`}>
        <Icon size={12} /> {labels[s] || status}
      </span>
    );
  };

  const filterTabs = [
    { key: 'ALL', label: t('appointments.filters.all') },
    { key: 'PENDING', label: t('appointments.filters.pending'), count: stats.pending },
    { key: 'APPROVED', label: t('appointments.filters.approved'), count: stats.approved },
    { key: 'COMPLETED', label: t('appointments.filters.completed'), count: stats.completed },
    { key: 'CANCELLED', label: t('appointments.filters.cancelled'), count: stats.cancelled },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#0b1120] dark:to-indigo-950/20">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-indigo-200 dark:border-indigo-800/40 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-white/40">{isRTL ? 'جاري تحميل المواعيد...' : 'Loading appointments...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative pt-28 pb-20 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-[#0b1120] dark:to-indigo-950/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-5%] w-[35vw] h-[35vw] bg-cyan-500/5 rounded-full blur-[100px]" />
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
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('menu.appointments')}</h1>
                    <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{t('appointments.manage')}</p>
                  </div>
                </div>
                <Link href="/booking">
                  <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all gap-2">
                    <Calendar size={16} />
                    {t('appointments.bookNow')}
                  </Button>
                </Link>
              </motion.div>

              {/* Stats Row */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: t('totalLabel'), value: stats.total, color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                  { label: t('status_pending'), value: stats.pending, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                  { label: t('status_approved'), value: stats.approved, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                  { label: t('status_completed'), value: stats.completed, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                ].map((card, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl p-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg mb-2.5 ${card.color}`}>
                      <Calendar size={14} className="text-white" />
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{card.value}</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-white/35 mt-0.5">{card.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Filter Tabs */}
              <motion.div variants={fadeUp} className="flex overflow-x-auto pb-1 gap-1.5 hide-scrollbar">
                {filterTabs.map((tab) => (
                  <button key={tab.key} onClick={() => setStatusFilter(tab.key as any)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all",
                      statusFilter === tab.key
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/60 dark:bg-white/[0.04] text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60 border border-white/40 dark:border-white/5"
                    )}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] font-bold",
                        statusFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50"
                      )}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </motion.div>

              {/* Appointments List */}
              {filteredAppointments.length > 0 ? (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredAppointments.map((appt, i) => {
                      const isOnline = appt.type === 'ONLINE';
                      const s = appt.status?.toLowerCase();
                      const statusColors: Record<string, string> = {
                        pending: 'from-amber-500 to-orange-600',
                        approved: 'from-emerald-500 to-green-600',
                        completed: 'from-blue-500 to-cyan-600',
                        cancelled: 'from-red-500 to-rose-600',
                      };
                      return (
                        <motion.div
                          key={appt.id} layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="relative bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden">
                            <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-1.5 bg-gradient-to-b ${statusColors[s] || 'from-slate-400 to-slate-500'} rounded-full`} />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                              <div className="flex items-center gap-5">
                                <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/10 flex flex-col items-center justify-center shrink-0">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                                    {new Date(appt.date).toLocaleString('en', { month: 'short' })}
                                  </span>
                                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    {new Date(appt.date).getDate()}
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                                      {isOnline ? tWizard('onlineConsultation') : tWizard('clinicVisit')}
                                    </h4>
                                    {getStatusBadge(appt.status)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-slate-500 dark:text-white/50">
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock size={14} className="text-indigo-400" />
                                      {formatTime12Hour(appt.timeSlot, isRTL)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                      {isOnline ? <Video size={14} className="text-cyan-400" /> : <MapPin size={14} className="text-emerald-400" />}
                                      {isOnline
                                        ? (isRTL ? 'استشارة أونلاين' : 'Online Video')
                                        : (isRTL ? 'حضوري' : 'In-person')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {isOnline && appt.status?.toLowerCase() === 'approved' && (
                                  <Link href={`/dashboard/video/${appt.meetingId || appt.id}`}>
                                    <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all gap-1.5">
                                      <Video size={15} />
                                      {t('joinMeeting')}
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-white/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Calendar size={28} className="text-slate-300 dark:text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white/60 mb-1">{t('noAppointmentsFound')}</h3>
                  <p className="text-[13px] text-slate-400 dark:text-white/30 mb-6 text-center max-w-sm">{t('appointments.noAppointmentsDesc')}</p>
                  <Link href="/booking">
                    <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold shadow-lg shadow-indigo-500/20 gap-2">
                      <Calendar size={16} />
                      {t('appointments.bookNow')}
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
