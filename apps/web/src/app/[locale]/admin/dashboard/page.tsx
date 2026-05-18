'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { 
  CalendarDays, FileText, MessageSquare, Star, 
  TrendingUp, Users, Activity, Download, 
  Eye, MousePointerClick, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { cn } from '@/lib/utils';


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

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1); // Only show main loader spinner on first attempt
    setError(false);
    api.get<DashboardStats>('/analytics/dashboard', token)
      .then(res => {
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch admin dashboard stats (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchStats(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    { 
      icon: CalendarDays, 
      label: t('appointments'), 
      value: stats?.overview?.appointments?.total ?? 0, 
      sub: `${stats?.overview?.appointments?.pending ?? 0} ${t('pending')}`, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      icon: MessageSquare, 
      label: t('messages'), 
      value: stats?.overview?.messages?.total ?? 0, 
      sub: `${stats?.overview?.messages?.unread ?? 0} ${t('unread')}`, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    { 
      icon: FileText, 
      label: t('blog'), 
      value: stats?.overview?.blog?.total ?? 0, 
      sub: `${stats?.overview?.blog?.published ?? 0} ${t('published')}`, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      icon: Star, 
      label: t('testimonials'), 
      value: stats?.overview?.testimonials?.total ?? 0, 
      sub: `${stats?.overview?.testimonials?.approved ?? 0} ${t('approved')}`, 
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
  ];

  const handleExport = () => {
    if (!stats) return;
    const reportData = [
      { Metric: 'Total Appointments', Value: stats.overview?.appointments?.total ?? 0 },
      { Metric: 'Pending Appointments', Value: stats.overview?.appointments?.pending ?? 0 },
      { Metric: 'Total Messages', Value: stats.overview?.messages?.total ?? 0 },
      { Metric: 'Unread Messages', Value: stats.overview?.messages?.unread ?? 0 },
      { Metric: 'Total Blog Posts', Value: stats.overview?.blog?.total ?? 0 },
      { Metric: 'Approved Testimonials', Value: stats.overview?.testimonials?.approved ?? 0 },
    ];
    exportToExcel(reportData, 'Dashboard_Summary');
  };

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -ml-40 pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
            {t('dashboard_overview') || 'Dashboard Overview'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest opacity-70">
              {t('system_status')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <Button variant="destructive" size="sm" onClick={fetchStats} className="gap-2 rounded-xl shadow-lg shadow-red-500/20">
              Retry Connection
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 h-11 px-5 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-md border-white/20 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group" disabled={loading || error}>
            <Download size={16} className="group-hover:scale-110 transition-transform" /> 
            <span className="text-[10px] font-black uppercase tracking-widest">{t('export_summary')}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-[var(--muted)] bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/20">
          <div className="relative w-16 h-16 mb-6">
             <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-black text-lg tracking-tight text-[var(--foreground)]">Loading Intelligence...</p>
          <p className="text-xs font-bold mt-1 opacity-60">Fetching latest clinical analytics</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-red-500 bg-red-500/5 backdrop-blur-xl rounded-[2.5rem] border border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
             <Activity size={32} className="opacity-50" />
          </div>
          <p className="font-black text-lg tracking-tight text-[var(--foreground)]">Synchronization Failed</p>
          <p className="text-xs font-bold mt-1 mb-8 opacity-60 uppercase tracking-widest">The neural link to server was interrupted</p>
          <Button variant="outline" onClick={fetchStats} className="rounded-xl border-red-500/30 hover:bg-red-500 hover:text-white transition-all">Reconnect Now</Button>
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <Card key={card.label} className="relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 hover:border-primary/30 p-6 rounded-[2rem]">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${card.bg} opacity-20 blur-3xl group-hover:opacity-40 transition-all duration-700`} />
            
            <div className="relative flex flex-col gap-5">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                <card.icon size={28} className={card.color} />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">{card.label}</p>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
                </div>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1 tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60">{card.sub}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Analytics Section */}
        <div className="lg:col-span-8 space-y-8">
           {/* Primary Chart */}
           <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-2xl shadow-black/5">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <TrendingUp size={20} />
                    </div>
                    {t('appointment_trends')}
                  </h3>
                  <p className="text-xs font-bold text-[var(--muted)] mt-1 ml-13">{t('monthly_performance')}</p>
                </div>
                <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                   {['Week', 'Month', 'Year'].map((period) => (
                     <button key={period} className={cn(
                       "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                       period === 'Month' ? "bg-white dark:bg-white/10 shadow-sm text-primary" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                     )}>{period}</button>
                   ))}
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.charts?.appointments || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} strokeOpacity={0.05} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted)', fontWeight: 800 }} 
                    />
                    <YAxis 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted)', fontWeight: 800 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        padding: '12px 16px'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '900' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="var(--primary)" 
                      fillOpacity={1} 
                      fill="url(#premiumGradient)" 
                      strokeWidth={4} 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>

           {/* Tables Section */}
           <Card className="p-0 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/30 dark:bg-white/5">
                <h3 className="text-lg font-black flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Clock size={20} />
                  </div>
                  {t('incoming_queue')}
                </h3>
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 hover:text-primary transition-all">{t('explore_all')}</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] bg-white/20 dark:bg-white/5">
                      <th className="px-8 py-5">{t('patient_identity')}</th>
                      <th className="px-8 py-5">{t('schedule')}</th>
                      <th className="px-8 py-5 text-right">{t('verification')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {stats?.recentAppointments?.map((apt) => {
                      const name = apt.patientName || apt.guestName || apt.patient?.name || 'مجهول';
                      return (
                      <tr key={apt.id} className="group hover:bg-primary/5 transition-all duration-300">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-black text-xs text-primary border border-primary/10">
                                {name.charAt(0)}
                              </div>
                              <span className="font-black text-sm tracking-tight">{name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[var(--foreground)]">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-1">{apt.timeSlot}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-block shadow-sm",
                            apt.status === 'approved' ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                            apt.status === 'pending' ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-red-500 text-white shadow-red-500/20"
                          )}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-8">
           {/* Activity Bar Chart */}
           <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-2xl shadow-black/5">
              <h3 className="font-black text-sm flex items-center gap-2 mb-8 uppercase tracking-widest">
                <Activity size={16} className="text-emerald-500" />
                {t('live_pulse')}
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts?.visitors || []}>
                    <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    <Tooltip cursor={{ fill: 'rgba(var(--primary-rgb), 0.05)' }} content={<div className="hidden"/>} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                 <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] mb-2 text-center">{t('system_reliability')}</p>
                 <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '99.9%' }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    />
                 </div>
              </div>
           </Card>

           {/* Event Stream */}
           <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-2xl shadow-black/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  {t('realtime_log')}
                </h3>
              </div>
              <div className="space-y-8">
                {stats?.recentEvents?.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-4 group">
                    {idx !== (stats?.recentEvents?.length - 1) && (
                      <div className="absolute top-8 left-4 bottom-[-32px] w-[2px] bg-white/5" />
                    )}
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shrink-0 shadow-lg border border-white/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {event.type.includes('click') ? <MousePointerClick size={14} /> : <Eye size={14} />}
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-[11px] font-black tracking-tight text-[var(--foreground)] truncate capitalize group-hover:text-primary transition-colors">
                        {event.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>

      </div>
      </>
      )}
    </div>
  );
}
