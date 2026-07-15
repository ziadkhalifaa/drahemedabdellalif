'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';
import { Check, X, Download, Pill, Video, Calendar, Search, Filter, Clock, ChevronDown, CheckCheck, Ban, User } from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';
import { formatTime12Hour, cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type DateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'custom';

export default function AdminAppointmentsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDate, setCustomDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchAppointments = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    api.get<{ data: any[]; total: number }>('/appointments', token)
      .then(res => setAppointments(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [token]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    if (!token) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status }, token);
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
      fetchAppointments();
    } catch {
      toast.error(isRTL ? 'فشل التحديث' : 'Update failed');
    }
  };

  const bulkUpdateStatus = async (status: AppointmentStatus) => {
    if (!token || selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => api.patch(`/appointments/${id}/status`, { status }, token))
      );
      toast.success(isRTL ? `تم تحديث ${selectedIds.size} موعد` : `Updated ${selectedIds.size} appointments`);
      setSelectedIds(new Set());
      fetchAppointments();
    } catch {
      toast.error(isRTL ? 'فشل التحديث' : 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(a => a.id)));
    }
  };

  const handleExport = () => {
    exportToExcel(filtered.map(a => ({
      Patient: a.guestName || a.patient?.name || '—',
      Phone: a.guestPhone || a.patient?.phone || '—',
      Email: a.guestEmail || a.patient?.email || '—',
      Date: new Date(a.date).toLocaleDateString(),
      Time: formatTime12Hour(a.timeSlot, false),
      Type: a.type,
      Status: a.status,
      Clinic: a.type === 'ONLINE' ? (isRTL ? 'أونلاين' : 'Online') : (isRTL ? 'حضوري' : 'In-person'),
    })), 'Appointments_Report');
    toast.success(isRTL ? 'تم التصدير' : 'Exported');
  };

  const getDateRange = (filter: DateFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (filter) {
      case 'today': return { start: today, end: new Date(today.getTime() + 86400000) };
      case 'tomorrow': return { start: new Date(today.getTime() + 86400000), end: new Date(today.getTime() + 172800000) };
      case 'week': {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return { start: today, end: weekEnd };
      }
      case 'month': {
        const monthEnd = new Date(today);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        return { start: today, end: monthEnd };
      }
      case 'custom':
        if (!customDate) return null;
        const custom = new Date(customDate);
        const customEnd = new Date(custom);
        customEnd.setDate(customEnd.getDate() + 1);
        return { start: custom, end: customEnd };
      default: return null;
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchStatus = !statusFilter || a.status === statusFilter;
      const matchSearch = !searchQuery ||
        (a.guestName || a.patient?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.guestEmail || a.patient?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.guestPhone || a.patient?.phone || '').includes(searchQuery);
      const dateRange = getDateRange(dateFilter);
      let matchDate = true;
      if (dateRange) {
        const aptDate = new Date(a.date);
        matchDate = aptDate >= dateRange.start && aptDate < dateRange.end;
      }
      return matchStatus && matchSearch && matchDate;
    });
  }, [appointments, statusFilter, dateFilter, customDate, searchQuery]);

  const counts = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    rejected: appointments.filter(a => a.status === 'rejected').length,
  };

  const todayCount = appointments.filter(a => {
    const d = new Date(a.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const tabs = [
    { key: '', label: isRTL ? 'الكل' : 'All', count: counts.total, icon: null },
    { key: 'pending', label: isRTL ? 'قيد الانتظار' : 'Pending', count: counts.pending, icon: Clock },
    { key: 'approved', label: isRTL ? 'مقبول' : 'Approved', count: counts.approved, icon: CheckCheck },
    { key: 'completed', label: isRTL ? 'مكتمل' : 'Completed', count: counts.completed, icon: Check },
  ];

  const dateTabs: { key: DateFilter; label: string }[] = [
    { key: 'all', label: isRTL ? 'الكل' : 'All' },
    { key: 'today', label: isRTL ? 'اليوم' : 'Today' },
    { key: 'tomorrow', label: isRTL ? 'غداً' : 'Tomorrow' },
    { key: 'week', label: isRTL ? 'هذا الأسبوع' : 'This Week' },
    { key: 'month', label: isRTL ? 'هذا الشهر' : 'This Month' },
    { key: 'custom', label: isRTL ? 'تاريخ مخصص' : 'Custom' },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {isRTL ? 'المواعيد' : 'Appointments'}
            {todayCount > 0 && (
              <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg">
                {todayCount} {isRTL ? 'اليوم' : 'today'}
              </span>
            )}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{isRTL ? 'إدارة حجوزات المرضى والمواعيد' : 'Manage patient bookings and schedules'}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className={cn("flex items-center gap-2", isRTL ? "ml-2" : "mr-2")}>
              <span className="text-[11px] font-bold text-indigo-500">{selectedIds.size} {isRTL ? 'محدد' : 'selected'}</span>
              <button onClick={() => bulkUpdateStatus(AppointmentStatus.APPROVED)} disabled={bulkLoading}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-1">
                {bulkLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={12} />}
                {isRTL ? 'قبول الكل' : 'Approve All'}
              </button>
              <button onClick={() => bulkUpdateStatus(AppointmentStatus.REJECTED)} disabled={bulkLoading}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1">
                <Ban size={12} />
                {isRTL ? 'رفض الكل' : 'Reject All'}
              </button>
            </div>
          )}
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all shadow-sm">
            <Download size={14} /> {isRTL ? 'تصدير' : 'Export'}
          </button>
        </div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-white/5 p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setSelectedIds(new Set()); }} className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all flex-1 justify-center",
            statusFilter === tab.key ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white" : "text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/50"
          )}>
            {tab.label}
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center", statusFilter === tab.key ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-white/5 text-slate-400")}>
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Date Filter + Search Row */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-white/5 p-1 flex-wrap">
          {dateTabs.map(tab => (
            <button key={tab.key} onClick={() => setDateFilter(tab.key)} className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
              dateFilter === tab.key ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 dark:text-white/30 hover:bg-slate-50 dark:hover:bg-white/5"
            )}>
              {tab.label}
            </button>
          ))}
        </div>
        {dateFilter === 'custom' && (
          <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-xl px-3 py-2 text-[12px] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]" />
        )}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25", isRTL ? "right-3" : "left-3")} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث بالاسم، الإيميل، أو الهاتف...' : 'Search by name, email, or phone...'}
            className={cn("w-full py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all", isRTL ? "pr-9 pl-4" : "pl-9 pr-4")} />
        </div>
      </motion.div>

      {/* Content */}
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
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer" />
                  </th>
                  <th className="px-4 py-3 text-left">{isRTL ? 'المريض' : 'Patient'}</th>
                  <th className="px-4 py-3 text-left">{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</th>
                  <th className="px-4 py-3 text-left">{isRTL ? 'النوع' : 'Type'}</th>
                  <th className="px-4 py-3 text-left">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-right">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(apt => {
                  const name = apt.guestName || apt.patient?.name || '—';
                  const email = apt.guestEmail || apt.patient?.email || '—';
                  const phone = apt.guestPhone || apt.patient?.phone;
                  return (
                    <tr key={apt.id} className={cn("hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors", selectedIds.has(apt.id) && "bg-indigo-50/50 dark:bg-indigo-500/5")}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.has(apt.id)} onChange={() => toggleSelect(apt.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center text-[12px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white/80 truncate">{name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-slate-400 dark:text-white/25 truncate">{email}</p>
                              {phone && <span className="text-[10px] text-slate-400 dark:text-white/20" dir="ltr">· {phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[12px] font-bold text-slate-700 dark:text-white/60">
                          {new Date(apt.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {formatTime12Hour(apt.timeSlot, isRTL)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex text-[11px] font-bold px-2 py-0.5 rounded-md", apt.type === 'ONLINE' ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400")}>
                          {apt.type === 'ONLINE' ? (isRTL ? 'أونلاين' : 'Online') : (isRTL ? 'حضوري' : 'In-person')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          apt.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          apt.status === 'completed' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        )}>{apt.status}</span>
                      </td>
                      <td className={cn("px-4 py-3.5", isRTL ? "text-left" : "text-right")}>
                        <div className={cn("flex items-center gap-1", isRTL ? "justify-start" : "justify-end")}>
                          {apt.status === AppointmentStatus.PENDING && (
                            <>
                              <button onClick={() => updateStatus(apt.id, AppointmentStatus.APPROVED)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" title={isRTL ? 'قبول' : 'Approve'}><Check size={15} /></button>
                              <button onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title={isRTL ? 'رفض' : 'Reject'}><X size={15} /></button>
                            </>
                          )}
                          {apt.status === AppointmentStatus.APPROVED && apt.type === AppointmentType.ONLINE && (
                            <Link href={`/dashboard/video/${apt.meetingId || apt.id}`} className="p-1.5 rounded-lg text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors" title={isRTL ? 'دخول الفيديو' : 'Join Video'}><Video size={15} /></Link>
                          )}
                          {apt.status === AppointmentStatus.APPROVED && (
                            <Link href={`/admin/prescriptions/new/${apt.id}`} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title={isRTL ? 'وصفة جديدة' : 'Prescription'}><Pill size={15} /></Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <Calendar size={32} className="mx-auto text-slate-300 dark:text-white/15 mb-3" />
                    <p className="text-[13px] font-medium text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد مواعيد في هذا الفلتر' : 'No appointments match this filter'}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 dark:text-white/25">
              <span>{filtered.length} {isRTL ? 'نتيجة' : 'results'}</span>
              <span>{isRTL ? 'إجمالي:' : 'Total:'} {appointments.length} {isRTL ? 'موعد' : 'appointments'}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
