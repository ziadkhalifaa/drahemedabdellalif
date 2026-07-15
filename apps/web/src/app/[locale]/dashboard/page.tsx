'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import {
  Calendar, FileText, User as UserIcon, LogOut, Video,
  Clock, Pill, History, LayoutDashboard, HeartPulse, Activity, Star,
  ArrowRight, ArrowLeft, MapPin, ChevronRight,
  Download, Sparkles, BarChart3, AlertCircle,
  CheckCircle, XCircle, Hourglass
} from 'lucide-react';
import { cn, formatTime12Hour } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MedicalTimeline } from '@/components/dashboard/medical-timeline';
import { useAuth } from '@/context/auth-context';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

function DashboardContent() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, logout, isLoading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  const rateAppointmentId = searchParams.get('rateAppointmentId');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (rateAppointmentId) {
      setShowReviewModal(true);
    }
  }, [rateAppointmentId]);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [apptsData, reportsData, presData] = await Promise.all([
          api.get<any[]>('/appointments/my', token),
          api.get<any[]>('/reports/my', token),
          api.get<any[]>('/prescriptions/my', token).catch(() => [])
        ]);
        setAppointments(apptsData);
        setReports(reportsData);
        setPrescriptions(presData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, authLoading, router]);

  const pendingAppts = useMemo(() => appointments.filter((a: any) => a.status === 'pending'), [appointments]);
  const approvedAppts = useMemo(() => appointments.filter((a: any) => a.status === 'approved'), [appointments]);
  const completedAppts = useMemo(() => appointments.filter((a: any) => a.status === 'completed'), [appointments]);
  const cancelledAppts = useMemo(() => appointments.filter((a: any) => a.status === 'cancelled'), [appointments]);
  const activeAppointments = useMemo(() => [...pendingAppts, ...approvedAppts], [pendingAppts, approvedAppts]);
  const upcomingApt = useMemo(() => activeAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0], [activeAppointments]);

  const isMorning = currentTime.getHours() < 12;

  const appointmentChartData = useMemo(() => {
    const months: Record<string, { month: string; total: number; online: number; clinic: number }> = {};
    const monthNames = isRTL
      ? ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    appointments.forEach((apt: any) => {
      const d = new Date(apt.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) {
        months[key] = { month: monthNames[d.getMonth()], total: 0, online: 0, clinic: 0 };
      }
      months[key].total += 1;
      if (apt.type === 'ONLINE') months[key].online += 1;
      else months[key].clinic += 1;
    });

    return Object.values(months).slice(-12);
  }, [appointments, isRTL]);

  const timelineItems = useMemo(() => [
    ...appointments.map(a => ({ id: a.id, type: 'appointment' as const, title: a.service?.titleAr || a.service?.titleEn || t('medicalConsultation'), date: new Date(a.date), status: a.status })),
    ...reports.map(r => ({ id: r.id, type: 'report' as const, title: r.title, date: new Date(r.createdAt) })),
    ...prescriptions.map(p => ({ id: p.id, type: 'prescription' as const, title: p.diagnosisAr || p.diagnosisEn || t('prescriptionsLabel'), date: new Date(p.createdAt), data: { ...p, patient: user } }))
  ], [appointments, reports, prescriptions, t, user]);

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('menu.overview'), onClick: () => setActiveTab('overview'), active: activeTab === 'overview' },
    { id: 'timeline', icon: History, label: t('menu.medicalJourney'), onClick: () => setActiveTab('timeline'), active: activeTab === 'timeline' },
    { id: 'appointments', icon: Calendar, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { id: 'reports', icon: FileText, label: t('menu.reports'), href: '/dashboard/reports' },
    { id: 'prescriptions', icon: Pill, label: t('menu.prescriptions'), href: '/dashboard/prescriptions' },
    { id: 'profile', icon: UserIcon, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Hourglass size={12} className="text-amber-500" />;
      case 'approved': return <CheckCircle size={12} className="text-emerald-500" />;
      case 'completed': return <CheckCircle size={12} className="text-blue-500" />;
      case 'cancelled': return <XCircle size={12} className="text-red-500" />;
      default: return <AlertCircle size={12} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20', label: t('status_pending') },
      approved: { cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20', label: t('status_approved') },
      completed: { cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20', label: t('status_completed') },
      cancelled: { cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-500/20', label: t('status_cancelled') },
    };
    const m = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${m.cls}`}>
        {getStatusIcon(status)} {m.label}
      </span>
    );
  };

  const formatDateStr = (d: string | Date) => {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#0b1120] dark:to-indigo-950/20">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-indigo-200 dark:border-indigo-800/40 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin animation-delay-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-600 dark:text-white/60">{t('subtitle')}</p>
            <p className="text-[11px] text-slate-400 dark:text-white/30 mt-1 animate-pulse">{isRTL ? 'جاري تحميل بياناتك...' : 'Loading your data...'}</p>
          </div>
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
          <div className="absolute top-[40%] left-[30%] w-[20vw] h-[20vw] bg-amber-500/3 rounded-full blur-[80px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block space-y-5">
              <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/30 dark:border-white/5 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
                {/* User Card */}
                <div className="relative overflow-hidden px-5 pt-8 pb-6 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900/80 dark:to-indigo-950/80">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl transform -translate-x-1/3 translate-y-1/3" />
                  <div className="relative text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/10 mb-3">
                      <span className="text-2xl font-black text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'Patient'}</p>
                    <p className="text-[10px] font-semibold text-indigo-200/70 uppercase tracking-widest mt-1">{isRTL ? 'حساب مريض' : 'Patient Account'}</p>
                    <div className="flex justify-center gap-1.5 mt-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white/80">{appointments.length} {isRTL ? 'موعد' : 'appts'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white/80">{reports.length} {isRTL ? 'تقرير' : 'reports'}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-3">
                  <div className="space-y-0.5">
                    {sidebarItems.map((item) =>
                      item.href ? (
                        <Link key={item.id} href={item.href as any}
                          className="group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-white/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all"
                        >
                          <item.icon size={17} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                          <ChevronRight size={13} className={cn("ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", isRTL && "rotate-180")} />
                        </Link>
                      ) : (
                        <button key={item.id} onClick={item.onClick}
                          className={cn(
                            "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all",
                            item.active
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                              : "text-slate-500 dark:text-white/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
                          )}
                        >
                          <item.icon size={17} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button onClick={logout}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={17} className="shrink-0" />
                      {t('menu.logout')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Support Banner */}
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
            <div className="space-y-6">
              {/* Hero Banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-900/80 dark:via-indigo-950/80 dark:to-purple-950/80 p-6 lg:p-8"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-lg font-black text-white shadow-lg border border-white/10">
                        <HeartPulse size={22} className="text-white/90" />
                      </div>
                      <div>
                        <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                          {isMorning ? t('goodMorning', { name: user?.name?.split(' ')[0] || 'Patient' }) : t('goodEvening', { name: user?.name?.split(' ')[0] || 'Patient' })}
                        </h1>
                        <p className="text-sm text-indigo-200/80 mt-0.5">{t('greetingSubtitle')}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-semibold text-white/90 border border-white/10">
                        <Calendar size={12} /> {appointments.length} {isRTL ? 'موعد' : 'appointments'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-semibold text-white/90 border border-white/10">
                        <FileText size={12} /> {reports.length} {isRTL ? 'تقرير' : 'reports'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-semibold text-white/90 border border-white/10">
                        <Pill size={12} /> {prescriptions.length} {isRTL ? 'روشتة' : 'prescriptions'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard/appointments" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm">
                      <Calendar size={14} />
                      {t('myAppointments')}
                    </Link>
                    <Link href="/booking" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-indigo-900 bg-white/90 hover:bg-white transition-all shadow-lg shadow-black/10">
                      {t('bookAppointment')}
                      {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                    </Link>
                  </div>
                </div>
              </motion.div>

              {activeTab === 'overview' ? (
                <>
                  {/* Stat Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {[
                      { icon: Calendar, label: t('totalAppointments'), value: appointments.length.toString(), gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', sub: `${activeAppointments.length} ${t('upcomingCount')}`, href: '/dashboard/appointments' },
                      { icon: Clock, label: t('upcomingAppointment'), value: activeAppointments.length.toString(), gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', sub: `${completedAppts.length} ${t('completedCount')}`, href: '/dashboard/appointments' },
                      { icon: FileText, label: t('reportsLabel'), value: reports.length.toString(), gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', sub: `${reports.length > 0 ? isRTL ? 'آخر تقرير' : 'latest report' : isRTL ? 'لا توجد' : 'none yet'}`, href: '/dashboard/reports' },
                      { icon: Pill, label: t('prescriptionsLabel'), value: prescriptions.length.toString(), gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', sub: `${prescriptions.length > 0 ? isRTL ? 'آخر روشتة' : 'latest scrip' : isRTL ? 'لا توجد' : 'none yet'}`, href: '/dashboard/prescriptions' },
                    ].map((card, idx) => (
                      <Link key={idx} href={card.href as any}
                        className="group relative bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/0 to-slate-50/50 dark:to-white/[0.02] rounded-full transform translate-x-6 -translate-y-6" />
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ${card.gradient}`}>
                            <card.icon size={18} className="text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-white/35 mt-0.5">{card.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-white/25 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-white/5">{card.sub}</p>
                      </Link>
                    ))}
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} className="text-indigo-500" />
                      <h3 className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">{t('quickActions')}</h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { icon: Calendar, label: t('bookAppointment'), href: '/booking', gradient: 'from-indigo-500 to-blue-600' },
                        { icon: Clock, label: t('myAppointments'), href: '/dashboard/appointments', gradient: 'from-emerald-500 to-green-600' },
                        { icon: FileText, label: t('viewReports'), href: '/dashboard/reports', gradient: 'from-violet-500 to-purple-600' },
                        { icon: Pill, label: t('myPrescriptions'), href: '/dashboard/prescriptions', gradient: 'from-amber-500 to-orange-600' },
                      ].map((action, idx) => (
                        <Link key={idx} href={action.href as any}
                          className="group flex items-center gap-3.5 p-4 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform ${action.gradient}`}>
                            <action.icon size={16} className="text-white" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-800 dark:text-white/80 truncate">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Appointments + Chart Row */}
                  <div className="grid lg:grid-cols-12 gap-5">
                    {/* Upcoming Appointment */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="lg:col-span-7"
                    >
                      <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6 h-full">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                              <Clock size={16} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('upcomingAppointment')}</h3>
                              <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'موعدك القادم' : 'Your next scheduled visit'}</p>
                            </div>
                          </div>
                          <Link href="/dashboard/appointments" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">{t('viewAll')}</Link>
                        </div>

                        {upcomingApt ? (
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-white/[0.03] dark:to-indigo-500/5 border border-slate-200/50 dark:border-white/5 p-5">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/10 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                                  {new Date(upcomingApt.date).toLocaleString('en', { month: 'short' })}
                                </span>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                  {new Date(upcomingApt.date).getDate()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1.5 truncate">
                                  {upcomingApt.service?.titleAr || upcomingApt.service?.titleEn || t('medicalConsultation')}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-white/50">
                                    <Clock size={13} className="text-indigo-500" />
                                    {upcomingApt.timeSlot ? formatTime12Hour(upcomingApt.timeSlot, isRTL) : '--:--'}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-white/50">
                                    {upcomingApt.type === 'ONLINE' ? <Video size={13} className="text-cyan-500" /> : <MapPin size={13} className="text-emerald-500" />}
                                    {upcomingApt.type === 'ONLINE' ? (isRTL ? 'استشارة أونلاين' : 'Online') : (isRTL ? 'زيارة حضورية' : 'In-person')}
                                  </span>
                                  {getStatusBadge(upcomingApt.status)}
                                </div>
                              </div>
                              <div className="shrink-0">
                                {upcomingApt.type === 'ONLINE' && upcomingApt.status === 'approved' ? (
                                  <Link href={`/dashboard/video/${upcomingApt.meetingId || 'room'}`}>
                                    <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all">
                                      <Video size={14} />
                                      {t('joinMeeting')}
                                    </Button>
                                  </Link>
                                ) : (
                                  <div className="h-10 px-5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 flex items-center gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    <Hourglass size={14} />
                                    {t('status_pending')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                            <Calendar size={28} className="text-slate-300 dark:text-white/15 mb-3" />
                            <p className="text-sm font-bold text-slate-500 dark:text-white/40">{t('noUpcoming')}</p>
                            <Link href="/booking">
                              <Button className="mt-4 h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold shadow-lg shadow-indigo-500/20">
                                {t('bookAppointment')}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Appointment Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      className="lg:col-span-5"
                    >
                      <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6 h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                              <BarChart3 size={14} className="text-white" />
                            </div>
                            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{t('appointmentTimeline')}</h3>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-white/25 mb-4">{t('monthlyDistribution')}</p>
                        {appointmentChartData.length > 0 ? (
                          <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={appointmentChartData} margin={{ top: 0, right: isRTL ? -20 : 0, left: isRTL ? 0 : -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                  cursor={{ fill: 'rgba(99,102,241,0.04)' }}
                                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '8px 14px', fontSize: 11 }}
                                />
                                <Bar dataKey="online" name={isRTL ? 'أونلاين' : 'Online'} fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={24} stackId="a" />
                                <Bar dataKey="clinic" name={isRTL ? 'حضوري' : 'In-person'} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={24} stackId="a" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-[180px] flex items-center justify-center">
                            <p className="text-[11px] text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد بيانات كافية' : 'Not enough data yet'}</p>
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40">{isRTL ? 'حضوري' : 'In-person'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40">{isRTL ? 'أونلاين' : 'Online'}</span>
                          </div>
                          <div className="flex-1" />
                          <span className="text-[10px] font-bold text-slate-400 dark:text-white/25">{appointments.length} {t('totalLabel')}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Prescriptions + Reports Row */}
                  <div className="grid lg:grid-cols-2 gap-5">
                    {/* Prescriptions */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 }}
                    >
                      <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                              <Pill size={16} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('latestPrescriptions')}</h3>
                              <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'أحدث الروشتات' : 'Your recent prescriptions'}</p>
                            </div>
                          </div>
                          <Link href="/dashboard/prescriptions" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">{t('viewAll')}</Link>
                        </div>
                        {prescriptions.length > 0 ? (
                          <div className="space-y-2.5">
                            {prescriptions.slice(0, 4).map((rx, idx) => (
                              <motion.div
                                key={rx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/5 hover:border-amber-200/50 dark:hover:border-amber-500/20 hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-all group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                    <Pill size={15} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[12px] font-bold text-slate-800 dark:text-white/70 truncate">
                                      {rx.diagnosisAr || rx.diagnosisEn || t('prescriptionsLabel')}
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-white/25 mt-0.5">{formatDateStr(rx.createdAt)}</p>
                                  </div>
                                </div>
                                <div className="shrink-0 ml-2">
                                  {getStatusBadge(rx.status || 'approved')}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                            <Pill size={24} className="text-slate-300 dark:text-white/15 mb-2" />
                            <p className="text-[12px] font-bold text-slate-400 dark:text-white/30">{t('noPrescriptionsYet')}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Reports */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16 }}
                    >
                      <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                              <FileText size={16} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('latestReports')}</h3>
                              <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'أحدث التقارير' : 'Your recent medical reports'}</p>
                            </div>
                          </div>
                          <Link href="/dashboard/reports" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">{t('viewAll')}</Link>
                        </div>
                        {reports.length > 0 ? (
                          <div className="space-y-2.5">
                            {reports.slice(0, 4).map((report, idx) => (
                              <motion.div
                                key={report.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/5 hover:border-violet-200/50 dark:hover:border-violet-500/20 hover:bg-violet-50/30 dark:hover:bg-violet-500/5 transition-all group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                                    <Activity size={15} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[12px] font-bold text-slate-800 dark:text-white/70 truncate">{report.title}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-white/25 mt-0.5">{formatDateStr(report.createdAt)}</p>
                                  </div>
                                </div>
                                <a href={report.fileUrl ? getMediaUrl(report.fileUrl) : '/dashboard/reports'} target="_blank" rel="noopener noreferrer" className="shrink-0 ltr:ml-2 rtl:mr-2 w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-500/10 hover:text-violet-500 transition-all">
                                  <Download size={13} />
                                </a>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                            <FileText size={24} className="text-slate-300 dark:text-white/15 mb-2" />
                            <p className="text-[12px] font-bold text-slate-400 dark:text-white/30">{t('noReportsYet')}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Health Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-transparent dark:from-indigo-500/10 dark:via-cyan-500/5 dark:to-transparent rounded-3xl border border-indigo-200/30 dark:border-indigo-500/10 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t('healthTips')}</h4>
                        <p className="text-[12px] text-slate-500 dark:text-white/50 leading-relaxed">
                          {isRTL ? t('stayHydrated') : `${isMorning ? '☀️ ' : '🌙 '}${t('stayHydrated')}`}
                        </p>
                        <p className="text-[12px] text-slate-500 dark:text-white/50 leading-relaxed mt-1">
                          {t('regularCheckup')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                /* Timeline Tab */
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-xl shadow-black/5">
                    <MedicalTimeline items={timelineItems} />
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="fill-current animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('review.title')}</h3>
              <p className="text-slate-500 dark:text-white/50 text-sm mb-6 leading-relaxed">{t('review.subtitle')}</p>
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} className="text-amber-400 transition-transform active:scale-95 hover:scale-110">
                    <Star size={40} className={cn("transition-colors", star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-700")} />
                  </button>
                ))}
              </div>
              <div className="space-y-2 mb-8">
                <label className={cn("text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/40 block", isRTL ? "text-right" : "text-left")}>{t('review.commentLabel')}</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t('review.commentPlaceholder')}
                  className={cn("w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-sm font-bold text-slate-900 dark:text-white", isRTL ? "text-right" : "text-left")}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={async () => {
                    setSubmittingReview(true);
                    try {
                      await api.post(`/appointments/${rateAppointmentId}/review`, { rating: reviewRating, comment: reviewComment || undefined }, token);
                      toast.success(t('review.submitSuccess'));
                      setShowReviewModal(false);
                      const url = new URL(window.location.href);
                      url.searchParams.delete('rateAppointmentId');
                      window.history.replaceState({}, '', url.pathname + url.search);
                    } catch (e: any) {
                      toast.error(e.message || t('review.submitFailed'));
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                  disabled={submittingReview}
                  className="flex-1 py-6 text-sm font-black rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25 text-white"
                >
                  {submittingReview ? t('review.submitting') : t('review.submit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewModal(false);
                    const url = new URL(window.location.href);
                    url.searchParams.delete('rateAppointmentId');
                    window.history.replaceState({}, '', url.pathname + url.search);
                  }}
                  disabled={submittingReview}
                  className="py-6 text-sm font-black rounded-2xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white bg-transparent"
                >
                  {t('review.skip')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#0b1120] dark:to-indigo-950/20">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-[3px] border-indigo-200 dark:border-indigo-800/40 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
