'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { Appointment } from '@dr-ahmed/shared';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';
import { Check, X, Download, Pill, Video, Calendar, Search, MoreHorizontal, Filter } from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';
import { formatTime12Hour, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminAppointmentsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAppointments = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    api.get<{ data: Appointment[]; total: number }>('/appointments', token)
      .then(res => setAppointments(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [token]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    if (!token) return;
    await api.patch(`/appointments/${id}/status`, { status }, token);
    fetchAppointments();
  };

  const handleExport = () => {
    exportToExcel(appointments.map(a => ({
      Patient: a.guestName || a.patient?.name || '—',
      Phone: a.guestPhone || a.patient?.phone || '—',
      Email: a.guestEmail || a.patient?.email || '—',
      Date: new Date(a.date).toLocaleDateString(),
      Time: formatTime12Hour(a.timeSlot, false),
      Status: a.status,
      Notes: a.notes || '',
    })), 'Appointments_Report');
  };

  const filtered = appointments.filter(a => {
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchSearch = !searchQuery ||
      (a.guestName || a.patient?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.guestEmail || a.patient?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.guestPhone || a.patient?.phone || '').includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const counts = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const tabs = [
    { key: '', label: isRTL ? 'الكل' : 'All', count: counts.total },
    { key: 'pending', label: isRTL ? 'قيد الانتظار' : 'Pending', count: counts.pending },
    { key: 'approved', label: isRTL ? 'مقبول' : 'Approved', count: counts.approved },
    { key: 'completed', label: isRTL ? 'مكتمل' : 'Completed', count: counts.completed },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{isRTL ? 'المواعيد' : 'Appointments'}</h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{isRTL ? 'إدارة حجوزات المرضى والمواعيد' : 'Manage patient bookings and schedules'}</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all shadow-sm">
          <Download size={14} /> {isRTL ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-white/5 p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)} className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all flex-1 justify-center",
            statusFilter === tab.key ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white" : "text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/50"
          )}>
            {tab.label}
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", statusFilter === tab.key ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-white/5 text-slate-400")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={isRTL ? 'بحث بالاسم، الإيميل، أو الهاتف...' : 'Search by name, email, or phone...'} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all" />
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-10 h-10 mb-3">
            <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/10 rounded-xl" />
            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-xl animate-spin" />
          </div>
          <p className="text-[13px] text-slate-400 dark:text-white/30">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5">
          <p className="text-[13px] font-medium text-slate-600 dark:text-white/60 mb-3">{isRTL ? 'فشل تحميل البيانات' : 'Failed to load'}</p>
          <button onClick={fetchAppointments} className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">{isRTL ? 'إعادة المحاولة' : 'Retry'}</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 bg-slate-50 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-left">{isRTL ? 'المريض' : 'Patient'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'الوقت' : 'Time'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'النوع' : 'Type'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="px-5 py-3 text-right">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(apt => {
                  const name = apt.guestName || apt.patient?.name || '—';
                  const email = apt.guestEmail || apt.patient?.email || '—';
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-slate-700 dark:text-white/70 truncate">{name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-white/25 truncate">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><p className="text-[12px] font-medium text-slate-600 dark:text-white/50">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p></td>
                      <td className="px-5 py-3.5"><p className="text-[12px] font-medium text-slate-500 dark:text-white/40">{formatTime12Hour(apt.timeSlot, isRTL)}</p></td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-md", apt.type === 'ONLINE' ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40")}>
                          {apt.type === 'ONLINE' ? (isRTL ? 'أونلاين' : 'Online') : (isRTL ? 'عيادة' : 'Clinic')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          apt.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          apt.status === 'completed' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        )}>{apt.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {apt.status === AppointmentStatus.PENDING && (
                            <>
                              <button onClick={() => updateStatus(apt.id, AppointmentStatus.APPROVED)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" title={isRTL ? 'قبول' : 'Approve'}><Check size={15} /></button>
                              <button onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title={isRTL ? 'رفض' : 'Reject'}><X size={15} /></button>
                            </>
                          )}
                          {apt.status === AppointmentStatus.APPROVED && apt.type === AppointmentType.ONLINE && (
                            <a href={`/dashboard/video/${apt.meetingId || apt.id}`} target="_blank" className="p-1.5 rounded-lg text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors" title={isRTL ? 'دخول الفيديو' : 'Join Video'}><Video size={15} /></a>
                          )}
                          {apt.status === AppointmentStatus.APPROVED && (
                            <a href={`/admin/prescriptions/new/${apt.id}`} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title={isRTL ? 'وصفة جديدة' : 'Prescription'}><Pill size={15} /></a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <Calendar size={32} className="mx-auto text-slate-300 dark:text-white/15 mb-3" />
                    <p className="text-[13px] font-medium text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد مواعيد' : 'No appointments found'}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
