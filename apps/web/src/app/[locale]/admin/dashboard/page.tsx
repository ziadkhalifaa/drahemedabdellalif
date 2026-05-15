'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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

  useEffect(() => {
    if (token) {
      api.get<DashboardStats>('/analytics/dashboard', token).then(setStats).catch(() => {});
    }
  }, [token]);

  const cards = [
    { 
      icon: CalendarDays, 
      label: t('appointments'), 
      value: stats?.overview?.appointments?.total ?? 0, 
      sub: `${stats?.overview?.appointments?.pending ?? 0} pending`, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      icon: MessageSquare, 
      label: t('messages'), 
      value: stats?.overview?.messages?.total ?? 0, 
      sub: `${stats?.overview?.messages?.unread ?? 0} unread`, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    { 
      icon: FileText, 
      label: t('blog'), 
      value: stats?.overview?.blog?.total ?? 0, 
      sub: `${stats?.overview?.blog?.published ?? 0} published`, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      icon: Star, 
      label: t('testimonials'), 
      value: stats?.overview?.testimonials?.total ?? 0, 
      sub: `${stats?.overview?.testimonials?.approved ?? 0} approved`, 
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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard Overview</h1>
          <p className="text-sm text-[var(--muted)]">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download size={16} /> Export Summary
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden group hover:border-[var(--primary)] transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${card.bg} blur-2xl group-hover:blur-xl transition-all`} />
            <div className="relative flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={24} className={card.color} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">{card.label}</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{card.value}</p>
                <p className="text-[10px] font-medium text-[var(--muted)]">{card.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--primary)]" />
              Appointment Trends
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.charts?.appointments || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              Visitor Activity (30 Days)
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.visitors || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="date" fontSize={8} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Appointments */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Recent Appointments
            </h3>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-[var(--muted)] border-b">
                  <th className="pb-3 font-bold">Patient</th>
                  <th className="pb-3 font-bold">Date & Time</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats?.recentAppointments?.map((apt) => (
                  <tr key={apt.id} className="text-sm">
                    <td className="py-4 font-medium">{apt.patientName}</td>
                    <td className="py-4 text-[var(--muted)]">
                      {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        apt.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                        apt.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Activity size={18} className="text-[var(--accent)]" />
              Live Feed
            </h3>
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-6">
            {stats?.recentEvents?.map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  {event.type.includes('click') ? <MousePointerClick size={14} /> : <Eye size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate capitalize">{event.type.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
