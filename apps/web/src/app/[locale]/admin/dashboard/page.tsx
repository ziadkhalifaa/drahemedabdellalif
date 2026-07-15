'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import {
  CalendarDays, FileText, MessageSquare, Star,
  Download, ArrowUpRight, Pill, Stethoscope,
  Clock, TrendingUp, Users, CreditCard, Activity,
  Heart, AlertCircle, CheckCircle, ExternalLink,
  Newspaper, Eye, Zap, Server, Shield, DollarSign,
  Percent, BarChart3, PieChart, Bell, RefreshCw,
  UserPlus, Phone, Mail, MapPin, ArrowRight, ArrowLeft,
  Sparkles, Target, Award, ChevronRight, Video, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line,
  PieChart as RePieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { exportToExcel } from '@/lib/export-utils';
import { cn, formatTime12Hour } from '@/lib/utils';
import { Link } from '@/i18n/routing';

interface DashboardStats {
  overview: {
    appointments: { total: number; pending: number; approved: number; completed: number; cancelled: number };
    blog: { total: number; published: number };
    messages: { total: number; unread: number };
    testimonials: { total: number; approved: number };
    totalRevenue: number;
  };
  recentAppointments: any[];
  recentEvents: any[];
  charts: {
    appointments: any[];
    visitors: any[];
  };
}

interface HealthData {
  status: string;
  uptime: number;
  db: string;
}

interface Notifications {
  pendingAppointments: number;
  unreadMessages: number;
  pendingTestimonials: number;
  total: number;
}

const COLORS = {
  indigo: '#6366f1',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  slate: '#94a3b8',
};

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } };

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AdminDashboardPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [notifications, setNotifications] = useState<Notifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartTab, setChartTab] = useState<'bookings' | 'revenue'>('bookings');
  const [visitorPeriod, setVisitorPeriod] = useState<'7d' | '30d'>('30d');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    Promise.all([
      api.get<DashboardStats>('/analytics/dashboard', token),
      api.get<HealthData>('/health').catch(() => null),
      api.get<Notifications>('/analytics/notifications', token).catch(() => null),
    ]).then(([dashData, healthData, notifData]) => {
      setStats(dashData);
      setHealth(healthData);
      setNotifications(notifData);
      setLoading(false);
    }).catch(() => {
      if (attempt < 2) setTimeout(() => fetchStats(attempt + 1), 1500);
      else { setError(true); setLoading(false); }
    });
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalRevenue = stats?.overview?.totalRevenue ?? 0;
  const totalAppointments = stats?.overview?.appointments?.total ?? 0;
  const pendingCount = stats?.overview?.appointments?.pending ?? 0;
  const approvedCount = stats?.overview?.appointments?.approved ?? 0;
  const completedCount = stats?.overview?.appointments?.completed ?? 0;
  const cancelledCount = stats?.overview?.appointments?.cancelled ?? 0;
  const unreadCount = stats?.overview?.messages?.unread ?? 0;
  const totalMessages = stats?.overview?.messages?.total ?? 0;
  const totalTestimonials = stats?.overview?.testimonials?.total ?? 0;
  const approvedTestimonials = stats?.overview?.testimonials?.approved ?? 0;
  const totalBlog = stats?.overview?.blog?.total ?? 0;
  const publishedBlog = stats?.overview?.blog?.published ?? 0;

  const pendingReviews = totalTestimonials - approvedTestimonials;
  const approvalRate = totalTestimonials > 0 ? Math.round((approvedTestimonials / totalTestimonials) * 100) : 0;
  const messageReadRate = totalMessages > 0 ? Math.round(((totalMessages - unreadCount) / totalMessages) * 100) : 0;

  const appointmentData = stats?.charts?.appointments || [];

  const pieData = [
    { name: isRTL ? 'مكتمل' : 'Completed', value: completedCount, color: PIE_COLORS[0] },
    { name: isRTL ? 'قيد الانتظار' : 'Pending', value: pendingCount, color: PIE_COLORS[1] },
    { name: isRTL ? 'مقبول' : 'Approved', value: approvedCount, color: PIE_COLORS[2] },
    { name: isRTL ? 'ملغي' : 'Cancelled', value: cancelledCount, color: PIE_COLORS[3] },
  ];

  const handleExport = () => {
    if (!stats) return;
    exportToExcel([
      { Metric: 'Total Appointments', Value: totalAppointments },
      { Metric: 'Pending Appointments', Value: pendingCount },
      { Metric: 'Approved Appointments', Value: approvedCount },
      { Metric: 'Completed Appointments', Value: completedCount },
      { Metric: 'Total Revenue (EGP)', Value: totalRevenue },
      { Metric: 'Total Messages', Value: totalMessages },
      { Metric: 'Unread Messages', Value: unreadCount },
      { Metric: 'Total Blog Posts', Value: totalBlog },
      { Metric: 'Published Posts', Value: publishedBlog },
      { Metric: 'Total Testimonials', Value: totalTestimonials },
      { Metric: 'Approved Testimonials', Value: approvedTestimonials },
    ], 'Dashboard_Summary');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-[3px] border-slate-200 dark:border-white/10 rounded-2xl" />
          <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-2xl animate-spin" />
          <div className="absolute inset-2 border-2 border-cyan-400 border-b-transparent rounded-xl animate-spin -reverse" />
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-white/40">{isRTL ? 'جاري تحميل لوحة التحكم...' : 'Loading dashboard...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-5">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <p className="text-base font-bold text-slate-800 dark:text-white/90 mb-1.5">{isRTL ? 'فشل الاتصال' : 'Connection Failed'}</p>
        <p className="text-xs text-slate-400 dark:text-white/30 mb-6">{isRTL ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى' : 'Check your connection and try again'}</p>
        <button onClick={() => fetchStats()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
          <RefreshCw size={14} />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  const visitorData = stats?.charts?.visitors || [];
  const filteredVisitors = visitorPeriod === '7d' ? visitorData.slice(-7) : visitorData;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Banner */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-900/80 dark:via-indigo-950/80 dark:to-purple-950/80 p-6 lg:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-lg font-black text-white shadow-lg border border-white/10">
                {notifications?.pendingAppointments ? notifications.pendingAppointments : 'DA'}
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                  {isRTL ? `صباح الخير، د. أحمد 👋` : `Good morning, Dr. Ahmed 👋`}
                </h1>
                <p className="text-sm text-indigo-200/80 mt-0.5">
                  {formatDate(currentTime)} — {formatTime(currentTime)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-semibold text-white/90 border border-white/10">
                <CalendarDays size={12} /> {totalAppointments} {isRTL ? 'موعد' : 'appointments'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-semibold text-white/90 border border-white/10">
                <DollarSign size={12} /> EGP {totalRevenue.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-semibold text-white/90 border border-white/10">
                <Users size={12} /> {stats?.overview?.testimonials?.total ?? 0} {isRTL ? 'مريض' : 'patients'}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm text-[11px] font-semibold border", health?.status === 'ok' ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/30" : "bg-red-500/20 text-red-200 border-red-500/30")}>
                <Server size={12} /> {health?.status === 'ok' ? (isRTL ? 'النظام يعمل' : 'System Online') : (isRTL ? 'عطل' : 'System Down')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-indigo-900 bg-white/90 hover:bg-white transition-all shadow-lg shadow-black/10">
              <Download size={14} />
              {isRTL ? 'تصدير' : 'Export'}
            </button>
            <Link href="/admin/appointments" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm">
              <CalendarDays size={14} />
              {isRTL ? 'موعد جديد' : 'New Appointment'}
              {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Premium Stat Cards */}
      <motion.div variants={fadeUp} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: CalendarDays, label: isRTL ? 'إجمالي المواعيد' : 'Total Appointments',
            value: totalAppointments, sub: `${pendingCount} ${isRTL ? 'قيد الانتظار' : 'pending'}`,
            gradient: 'from-indigo-500 to-blue-600',
            light: 'bg-indigo-50 dark:bg-indigo-500/10',
            progress: totalAppointments > 0 ? Math.round((approvedCount / totalAppointments) * 100) : 0,
            progressLabel: isRTL ? 'مقبول' : 'approved',
            href: '/admin/appointments'
          },
          {
            icon: DollarSign, label: isRTL ? 'الإيرادات' : 'Total Revenue',
            value: `EGP ${totalRevenue.toLocaleString()}`, sub: isRTL ? 'الشهر الحالي' : 'This month',
            gradient: 'from-emerald-500 to-green-600',
            light: 'bg-emerald-50 dark:bg-emerald-500/10',
            progress: totalRevenue > 0 ? 65 : 0,
            progressLabel: isRTL ? 'نسبة التحصيل' : 'collection rate',
            href: '/admin/payments'
          },
          {
            icon: MessageSquare, label: isRTL ? 'الرسائل' : 'Messages',
            value: totalMessages, sub: `${unreadCount} ${isRTL ? 'غير مقروءة' : 'unread'}`,
            gradient: 'from-violet-500 to-purple-600',
            light: 'bg-violet-50 dark:bg-violet-500/10',
            progress: messageReadRate,
            progressLabel: isRTL ? 'مقروءة' : 'read rate',
            href: '/admin/messages'
          },
          {
            icon: Star, label: isRTL ? 'التقييمات' : 'Testimonials',
            value: totalTestimonials, sub: `${approvalRate}% ${isRTL ? 'موافقة' : 'approval'}`,
            gradient: 'from-amber-500 to-orange-600',
            light: 'bg-amber-50 dark:bg-amber-500/10',
            progress: approvalRate,
            progressLabel: isRTL ? 'موافق عليها' : 'approved',
            href: '/admin/testimonials'
          },
        ].map((card, idx) => (
          <Link key={idx} href={card.href as any}
            className="group relative bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 block overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-50/50 dark:to-white/[0.02] rounded-full transform translate-x-8 -translate-y-8" />
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", card.gradient)}>
                <card.icon size={20} className="text-white" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <ArrowUpRight size={14} className={cn("text-slate-400", isRTL && "scale-x-[-1]")} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-white/35 mt-1">{card.label}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-slate-400 dark:text-white/25">{card.sub}</p>
                <span className="text-[10px] font-bold text-slate-500 dark:text-white/40">{card.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                  className={cn("h-full rounded-full bg-gradient-to-r", card.gradient)}
                />
              </div>
              <p className="text-[9px] text-slate-400 dark:text-white/20 mt-1">{card.progressLabel}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Quick Action + Alerts Row */}
      <motion.div variants={fadeUp} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CalendarDays, label: isRTL ? 'مواعيد اليوم' : 'Today\'s Appointments', count: pendingCount, href: '/admin/appointments', color: '#6366f1' },
          { icon: MessageSquare, label: isRTL ? 'رسائل غير مقروءة' : 'Unread Messages', count: unreadCount, href: '/admin/messages', color: '#8b5cf6' },
          { icon: Star, label: isRTL ? 'تقييمات معلقة' : 'Pending Reviews', count: pendingReviews, href: '/admin/testimonials', color: '#f59e0b' },
          { icon: FileText, label: isRTL ? 'مسودات المدونة' : 'Blog Drafts', count: totalBlog - publishedBlog, href: '/admin/blog', color: '#10b981' },
        ].map((action, idx) => (
          <Link key={idx} href={action.href as any}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/0 group-hover:to-slate-50/50 dark:group-hover:to-white/[0.02] transition-all duration-500" />
            <div className="relative flex items-center gap-4 w-full">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-200",
                "bg-gradient-to-br shadow-lg",
                idx === 0 && "from-indigo-500 to-blue-600",
                idx === 1 && "from-violet-500 to-purple-600",
                idx === 2 && "from-amber-500 to-orange-600",
                idx === 3 && "from-emerald-500 to-green-600",
              )}>
                <action.icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 dark:text-white/80 truncate">{action.label}</p>
                <p className="text-[11px] text-slate-400 dark:text-white/30">{action.count > 0 ? `${action.count} ${isRTL ? 'في انتظار المتابعة' : 'awaiting action'}` : (isRTL ? 'لا توجد إجراءات مطلوبة' : 'all clear')}</p>
              </div>
              {action.count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg",
                    idx === 0 && "bg-indigo-500",
                    idx === 1 && "bg-violet-500",
                    idx === 2 && "bg-amber-500",
                    idx === 3 && "bg-emerald-500",
                  )}>
                  {action.count > 99 ? '99+' : action.count}
                </motion.div>
              )}
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Main Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isRTL ? 'تحليلات الأداء' : 'Performance Analytics'}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'حجوزات العيادة مقابل الاستشارات أونلاين' : 'Clinic vs online appointments over time'}</p>
                </div>
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl">
                {(['bookings', 'revenue'] as const).map(tab => (
                  <button key={tab} onClick={() => setChartTab(tab)} className={cn(
                    "px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200",
                    chartTab === tab ? "bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/30 hover:text-slate-600"
                  )}>
                    {tab === 'bookings' ? (isRTL ? 'الحجوزات' : 'Bookings') : (isRTL ? 'الإيرادات' : 'Revenue')}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-4 pb-3 border-b border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-white/40">{isRTL ? 'عيادة' : 'Clinic'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-white/40">{isRTL ? 'أونلاين' : 'Online'}</span>
                </div>
                <div className="flex-1" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">
                  {isRTL ? 'آخر 12 شهراً' : 'Last 12 months'}
                </span>
              </div>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartTab === 'bookings' ? (
                    <BarChart data={appointmentData} margin={{ top: 0, right: isRTL ? -20 : 0, left: isRTL ? 0 : -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                      <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(99,102,241,0.04)' }}
                        contentStyle={{ borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '10px 16px', fontSize: 12 }}
                      />
                      <Bar dataKey="clinicsBookings" name={isRTL ? "عيادة" : "Clinic"} fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="onlineBookings" name={isRTL ? "أونلاين" : "Online"} fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  ) : (
                    <AreaChart data={appointmentData} margin={{ top: 0, right: isRTL ? -20 : 0, left: isRTL ? 0 : -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                        <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                      <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(99,102,241,0.04)' }}
                        contentStyle={{ borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '10px 16px', fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="clinicsPayments" name={isRTL ? "إيرادات العيادات" : "Clinic Revenue"} stroke="#6366f1" fillOpacity={1} fill="url(#revGrad1)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="onlinePayments" name={isRTL ? "إيرادات الأونلاين" : "Online Revenue"} stroke="#06b6d4" fillOpacity={1} fill="url(#revGrad2)" strokeWidth={2.5} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Donut + Traffic */}
        <motion.div variants={fadeUp} className="lg:col-span-5 space-y-5">
          {/* Appointment Distribution Donut */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <PieChart size={15} className="text-white" />
                </div>
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{isRTL ? 'توزيع المواعيد' : 'Appointment Distribution'}</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">{totalAppointments} {isRTL ? 'موعد' : 'total'}</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[140px] w-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: 'none', background: '#1e293b', color: 'white', fontSize: 11, padding: '6px 10px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {pieData.filter(d => d.value > 0).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] text-slate-500 dark:text-white/40 min-w-[60px]">{entry.name}</span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white/80">{entry.value}</span>
                  </div>
                ))}
                {pieData.filter(d => d.value > 0).length === 0 && (
                  <p className="text-[11px] text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد بيانات' : 'No data'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Visitor Traffic + System Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-slate-500 dark:text-white/40" />
                  <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{isRTL ? 'الزيارات' : 'Traffic'}</h3>
                </div>
                <div className="flex gap-0.5 bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg">
                  {(['7d', '30d'] as const).map(p => (
                    <button key={p} onClick={() => setVisitorPeriod(p)} className={cn(
                      "px-2 py-1 rounded-md text-[9px] font-bold transition-all",
                      visitorPeriod === p ? "bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/30"
                    )}>
                      {p === '7d' ? '7' : '30'} {isRTL ? 'ي' : 'd'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[72px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredVisitors} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none', background: '#1e293b', color: 'white', fontSize: 11, padding: '6px 10px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                  {filteredVisitors.reduce((sum: number, v: any) => sum + v.count, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Server size={14} className="text-slate-500 dark:text-white/40" />
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{isRTL ? 'النظام' : 'System'}</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", health?.status === 'ok' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                    <span className="text-[11px] text-slate-600 dark:text-white/50">{isRTL ? 'الخادم' : 'Server'}</span>
                  </div>
                  <span className={cn("text-[10px] font-bold", health?.status === 'ok' ? "text-emerald-500" : "text-red-500")}>
                    {health?.status === 'ok' ? (isRTL ? 'يعمل' : 'Live') : (isRTL ? 'معطل' : 'Down')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", health?.db === 'healthy' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                    <span className="text-[11px] text-slate-600 dark:text-white/50">{isRTL ? 'قاعدة البيانات' : 'Database'}</span>
                  </div>
                  <span className={cn("text-[10px] font-bold", health?.db === 'healthy' ? "text-emerald-500" : "text-red-500")}>
                    {health?.db === 'healthy' ? (isRTL ? 'متصل' : 'Up') : (isRTL ? 'معطل' : 'Down')}
                  </span>
                </div>
                {health?.uptime && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[11px] text-slate-500">{isRTL ? 'وقت التشغيل' : 'Uptime'}</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-white/70">{formatUptime(health.uptime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-transparent dark:from-indigo-500/10 dark:via-cyan-500/5 dark:to-transparent rounded-2xl border border-indigo-200/30 dark:border-indigo-500/10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">{isRTL ? 'نظرة سريعة' : 'Quick Insight'}</h4>
                <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">
                  {isRTL
                    ? `لديك ${pendingCount} موعداً في انتظار التأكيد و ${unreadCount} رسالة غير مقروءة.`
                    : `You have ${pendingCount} pending appointments and ${unreadCount} unread messages.`}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{isRTL ? 'نسبة الإشغال' : 'Occupancy'}: {totalAppointments > 0 ? Math.round(((approvedCount + completedCount) / totalAppointments) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">{isRTL ? 'معدل التحصيل' : 'Collection'}: {totalAppointments > 0 ? Math.round((approvedCount / totalAppointments) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Appointments + Activity */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Recent Appointments Table */}
        <motion.div variants={fadeUp} className="lg:col-span-8">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <CalendarDays size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isRTL ? 'آخر المواعيد' : 'Recent Appointments'}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'أحدث 10 مواعيد مسجلة' : 'Latest 10 appointment requests'}</p>
                </div>
              </div>
              <Link href="/admin/appointments" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all">
                {isRTL ? 'عرض الكل' : 'View All'}
                {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 bg-slate-50 dark:bg-white/[0.02]">
                    <th className={cn("px-6 py-3", isRTL ? "text-right" : "text-left")}>{isRTL ? 'المريض' : 'Patient'}</th>
                    <th className={cn("px-6 py-3", isRTL ? "text-right" : "text-left")}>{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th className={cn("px-6 py-3", isRTL ? "text-right" : "text-left")}>{isRTL ? 'النوع' : 'Type'}</th>
                    <th className={cn("px-6 py-3", isRTL ? "text-right" : "text-left")}>{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className={cn("px-6 py-3", isRTL ? "text-left" : "text-right")}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {stats?.recentAppointments?.slice(0, 8).map((apt, idx) => {
                    const name = apt.patientName || apt.guestName || apt.patient?.name || (isRTL ? 'مجهول' : 'Unknown');
                    return (
                      <motion.tr
                        key={apt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                              {name.charAt(0)}
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-white/70">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-[12px] font-medium text-slate-600 dark:text-white/50">
                            {new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-white/25 mt-0.5">{formatTime12Hour(apt.timeSlot, isRTL)}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", apt.type === 'ONLINE' ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-white/40")}>
                            {apt.type === 'ONLINE' ? (
                              <><Video size={11} /> {isRTL ? 'أونلاين' : 'Online'}</>
                            ) : (
                              <><Building2 size={11} /> {isRTL ? 'عيادة' : 'Clinic'}</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                            apt.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            apt.status === 'completed' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                            "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                          )}>{apt.status}</span>
                        </td>
                        <td className={cn("px-6 py-3.5", isRTL ? "text-left" : "text-right")}>
                          <Link href={`/admin/appointments`} className="text-slate-300 hover:text-indigo-500 transition-colors">
                            <ChevronRight size={15} className={cn(isRTL && "rotate-180")} />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {(!stats?.recentAppointments || stats.recentAppointments.length === 0) && (
                <div className="py-12 text-center">
                  <CalendarDays size={24} className="mx-auto mb-3 text-slate-300 dark:text-white/15" />
                  <p className="text-[12px] font-medium text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد مواعيد حديثة' : 'No recent appointments'}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div variants={fadeUp} className="lg:col-span-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Zap size={15} className="text-white" />
                </div>
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{isRTL ? 'النشاطات الأخيرة' : 'Recent Activity'}</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">{isRTL ? 'مباشر' : 'LIVE'}</span>
            </div>
            <div className="space-y-0 relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/30 via-cyan-500/20 to-transparent" />
              {stats?.recentEvents?.slice(0, 6).map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="relative flex items-start gap-4 pb-4 last:pb-0"
                >
                  <div className="relative z-10 mt-0.5">
                    <div className={cn(
                      "w-[7px] h-[7px] rounded-full ring-2 ring-white dark:ring-[#111827]",
                      idx === 0 ? "bg-indigo-500 animate-pulse" :
                      idx === 1 ? "bg-cyan-500" :
                      idx === 2 ? "bg-emerald-500" :
                      idx === 3 ? "bg-amber-500" :
                      "bg-slate-300 dark:bg-slate-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-white/70 truncate capitalize">
                      {event.type?.replace(/_/g, ' ') || (isRTL ? 'حدث' : 'Event')}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-white/25 mt-0.5">
                      {new Date(event.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {(!stats?.recentEvents || stats.recentEvents.length === 0) && (
                <div className="py-8 text-center">
                  <Activity size={20} className="mx-auto mb-2 text-slate-300 dark:text-white/15" />
                  <p className="text-[11px] text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد أحداث حديثة' : 'No recent activity'}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
