'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { 
  CalendarDays, FileText, MessageSquare, Star, 
  Download, ArrowUpRight, Pill, Stethoscope,
  Clock, TrendingUp, Users
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { exportToExcel } from '@/lib/export-utils';
import { cn, formatTime12Hour } from '@/lib/utils';

interface DashboardStats {
  overview: {
    appointments: { total: number; pending: number };
    blog: { total: number; published: number };
    messages: { total: number; unread: number };
    testimonials: { total: number; approved: number };
  };
  recentAppointments: any[];
  recentEvents: any[];
  charts: {
    appointments: any[];
    visitors: any[];
  };
}

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboardPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartTab, setChartTab] = useState<'bookings' | 'revenue'>('bookings');

  const fetchStats = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<DashboardStats>('/analytics/dashboard', token)
      .then(res => { setStats(res); setLoading(false); })
      .catch(() => {
        if (attempt < 2) setTimeout(() => fetchStats(attempt + 1), 1500);
        else { setError(true); setLoading(false); }
      });
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { 
      icon: CalendarDays, label: isRTL ? 'المواعيد' : 'Appointments', 
      value: stats?.overview?.appointments?.total ?? 0, 
      sub: `${stats?.overview?.appointments?.pending ?? 0} ${isRTL ? 'قيد الانتظار' : 'pending'}`,
      color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400'
    },
    { 
      icon: MessageSquare, label: isRTL ? 'الرسائل' : 'Messages', 
      value: stats?.overview?.messages?.total ?? 0, 
      sub: `${stats?.overview?.messages?.unread ?? 0} ${isRTL ? 'غير مقروءة' : 'unread'}`,
      color: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400'
    },
    { 
      icon: FileText, label: isRTL ? 'المدونة' : 'Blog', 
      value: stats?.overview?.blog?.total ?? 0, 
      sub: `${stats?.overview?.blog?.published ?? 0} ${isRTL ? 'منشورة' : 'published'}`,
      color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      icon: Star, label: isRTL ? 'التقييمات' : 'Testimonials', 
      value: stats?.overview?.testimonials?.total ?? 0, 
      sub: `${stats?.overview?.testimonials?.approved ?? 0} ${isRTL ? 'معتمدة' : 'approved'}`,
      color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400'
    },
  ];

  const handleExport = () => {
    if (!stats) return;
    exportToExcel([
      { Metric: 'Total Appointments', Value: stats.overview?.appointments?.total ?? 0 },
      { Metric: 'Pending Appointments', Value: stats.overview?.appointments?.pending ?? 0 },
      { Metric: 'Total Messages', Value: stats.overview?.messages?.total ?? 0 },
      { Metric: 'Unread Messages', Value: stats.overview?.messages?.unread ?? 0 },
      { Metric: 'Total Blog Posts', Value: stats.overview?.blog?.total ?? 0 },
      { Metric: 'Approved Testimonials', Value: stats.overview?.testimonials?.approved ?? 0 },
    ], 'Dashboard_Summary');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/10 rounded-xl" />
          <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-xl animate-spin" />
        </div>
        <p className="text-[13px] font-medium text-slate-400 dark:text-white/30">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Stethoscope size={24} className="text-red-500/40" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-white/80 mb-1">{isRTL ? 'فشل الاتصال' : 'Connection Failed'}</p>
        <p className="text-xs text-slate-400 dark:text-white/30 mb-5">{isRTL ? 'تحقق من اتصالك بالإنترنت' : 'Check your connection'}</p>
        <button onClick={() => fetchStats()} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all">
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isRTL ? 'مرحباً بك، د. أحمد' : 'Welcome back, Dr. Ahmed'}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">
            {isRTL ? 'نظرة عامة على أداء المنصة' : 'Here\'s what\'s happening with your platform'}
          </p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all shadow-sm">
          <Download size={14} />
          {isRTL ? 'تصدير التقرير' : 'Export'}
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.light)}>
                <card.icon size={20} className={card.text} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={14} className="text-slate-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{card.value}</p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-white/35 mt-1">{card.label}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <p className="text-[11px] text-slate-400 dark:text-white/25">{card.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts + Sidebar */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-8">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isRTL ? 'إحصائيات الأداء' : 'Performance'}</h3>
                <p className="text-[12px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'حجوزات العيادات مقابل الاستشارات' : 'Clinic vs online consultations'}</p>
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl">
                {(['bookings', 'revenue'] as const).map(tab => (
                  <button key={tab} onClick={() => setChartTab(tab)} className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                    chartTab === tab ? "bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-white/30 hover:text-slate-700"
                  )}>
                    {tab === 'bookings' ? (isRTL ? 'الحجوزات' : 'Bookings') : (isRTL ? 'الإيرادات' : 'Revenue')}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'bookings' ? (
                  <BarChart data={stats?.charts?.appointments || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                    <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: 12 }} />
                    <Bar dataKey="clinicsBookings" name={isRTL ? "عيادات" : "Clinic"} fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="onlineBookings" name={isRTL ? "أونلاين" : "Online"} fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={stats?.charts?.appointments || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                    <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: 12 }} />
                    <Area type="monotone" dataKey="clinicsPayments" name={isRTL ? "إيرادات العيادات" : "Clinic Revenue"} stroke="#6366f1" fillOpacity={1} fill="url(#grad1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="onlinePayments" name={isRTL ? "إيرادات الأونلاين" : "Online Revenue"} stroke="#06b6d4" fillOpacity={1} fill="url(#grad2)" strokeWidth={2} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={fadeUp} className="lg:col-span-4 space-y-5">
          {/* Live Activity */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{isRTL ? 'النشاط الحي' : 'Live Activity'}</h3>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.charts?.visitors || []}>
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} content={<div className="hidden" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">{isRTL ? 'معدل التوفر' : 'Uptime'}</span>
                <span className="text-[11px] font-bold text-emerald-500">99.9%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '99.9%' }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
            <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{isRTL ? 'آخر الأحداث' : 'Recent Events'}</h3>
            <div className="space-y-3">
              {stats?.recentEvents?.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                    <Clock size={13} className="text-slate-400 dark:text-white/25 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-white/60 truncate capitalize">{event.type.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/20 mt-0.5">{new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Appointments */}
      <motion.div variants={fadeUp}>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isRTL ? 'آخر المواعيد' : 'Recent Appointments'}</h3>
              <p className="text-[12px] text-slate-400 dark:text-white/30 mt-0.5">{isRTL ? 'أحدث المواعيد المسجلة' : 'Latest appointment requests'}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 bg-slate-50 dark:bg-white/[0.02]">
                  <th className="px-6 py-3 text-left">{isRTL ? 'المريض' : 'Patient'}</th>
                  <th className="px-6 py-3 text-left">{isRTL ? 'التاريخ والوقت' : 'Schedule'}</th>
                  <th className="px-6 py-3 text-left">{isRTL ? 'النوع' : 'Type'}</th>
                  <th className="px-6 py-3 text-right">{isRTL ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {stats?.recentAppointments?.map((apt) => {
                  const name = apt.patientName || apt.guestName || apt.patient?.name || (isRTL ? 'مجهول' : 'Unknown');
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {name.charAt(0)}
                          </div>
                          <span className="text-[13px] font-medium text-slate-700 dark:text-white/70">{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-[12px] font-medium text-slate-600 dark:text-white/50">
                          {new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">{formatTime12Hour(apt.timeSlot, isRTL)}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={cn("text-[11px] font-medium", apt.type === 'ONLINE' ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-white/40")}>
                          {apt.type === 'ONLINE' ? (isRTL ? 'أونلاين' : 'Online') : (isRTL ? 'عيادة' : 'Clinic')}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          apt.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
                          "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        )}>{apt.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
