'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { Appointment } from '@dr-ahmed/shared';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';
import { Check, X, Download, Pill, Video, Calendar, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';
import { formatTime12Hour } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminAppointmentsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAppointments = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    api.get<{data: Appointment[], total: number}>('/appointments', token)
      .then((res) => setAppointments(res.data || []))
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
    const data = appointments.map(a => ({
      Patient: a.guestName || a.patient?.name || '—',
      Phone: a.guestPhone || a.patient?.phone || '—',
      Email: a.guestEmail || a.patient?.email || '—',
      Date: new Date(a.date).toLocaleDateString(),
      Time: formatTime12Hour(a.timeSlot, false),
      Status: a.status,
      Notes: a.notes || ''
    }));
    exportToExcel(data, 'Appointments_Report');
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesSearch = !searchQuery || 
      (a.guestName || a.patient?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.guestEmail || a.patient?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.guestPhone || a.patient?.phone || '').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const statusTabs = [
    { key: '', label: isRTL ? 'الكل' : 'All', count: statusCounts.total },
    { key: 'pending', label: isRTL ? 'قيد الانتظار' : 'Pending', count: statusCounts.pending },
    { key: 'approved', label: isRTL ? 'مقبول' : 'Approved', count: statusCounts.approved },
    { key: 'completed', label: isRTL ? 'مكتمل' : 'Completed', count: statusCounts.completed },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isRTL ? 'المواعيد' : 'Appointments'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/35 mt-1">
            {isRTL ? 'إدارة حجوزات المرضى والمواعيد' : 'Manage patient bookings and schedules'}
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-gray-600 dark:text-white/50 bg-white dark:bg-[#111b2e] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
        >
          <Download size={14} />
          {isRTL ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111b2e] rounded-xl border border-gray-200/50 dark:border-white/[0.06] p-1">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all flex-1 justify-center",
              statusFilter === tab.key
                ? "bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/50"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              statusFilter === tab.key
                ? "bg-primary/10 text-primary"
                : "bg-gray-100 dark:bg-white/[0.04] text-gray-400 dark:text-white/20"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/25" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isRTL ? 'بحث بالاسم، الإيميل، أو الهاتف...' : 'Search by name, email, or phone...'}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111b2e] border border-gray-200/50 dark:border-white/[0.06] text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          )}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-10 h-10 mb-3">
            <div className="absolute inset-0 border-2 border-gray-200 dark:border-white/10 rounded-xl" />
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-xl animate-spin" />
          </div>
          <p className="text-sm text-gray-400 dark:text-white/30">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111b2e] rounded-2xl border border-gray-200/50 dark:border-white/[0.06]">
          <p className="text-sm font-medium text-gray-600 dark:text-white/60 mb-3">{isRTL ? 'فشل تحميل البيانات' : 'Failed to load data'}</p>
          <button onClick={fetchAppointments} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white dark:bg-[#111b2e] rounded-2xl border border-gray-200/50 dark:border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/25 bg-gray-50 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-left">{isRTL ? 'المريض' : 'Patient'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'الوقت' : 'Time'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'النوع' : 'Type'}</th>
                  <th className="px-5 py-3 text-left">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="px-5 py-3 text-right">{isRTL ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredAppointments.map((apt) => {
                  const name = apt.guestName || apt.patient?.name || '—';
                  const email = apt.guestEmail || apt.patient?.email || '—';
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-gray-700 dark:text-white/70 truncate">{name}</p>
                            <p className="text-[11px] text-gray-400 dark:text-white/25 truncate">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] font-medium text-gray-600 dark:text-white/50">
                          {new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] font-medium text-gray-500 dark:text-white/40">
                          {formatTime12Hour(apt.timeSlot, isRTL)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                          apt.type === 'ONLINE' 
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                            : "bg-gray-100 dark:bg-white/[0.04] text-gray-500 dark:text-white/40"
                        )}>
                          {apt.type === 'ONLINE' ? (isRTL ? 'أونلاين' : 'Online') : (isRTL ? 'عيادة' : 'Clinic')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider",
                          apt.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          apt.status === 'completed' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        )}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {apt.status === AppointmentStatus.PENDING && (
                            <>
                              <button 
                                onClick={() => updateStatus(apt.id, AppointmentStatus.APPROVED)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                title={isRTL ? 'قبول' : 'Approve'}
                              >
                                <Check size={15} />
                              </button>
                              <button 
                                onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                title={isRTL ? 'رفض' : 'Reject'}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          {apt.status === AppointmentStatus.APPROVED && apt.type === AppointmentType.ONLINE && (
                            <a 
                              href={`/dashboard/video/${apt.meetingId || apt.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                              title={isRTL ? 'دخول الفيديو' : 'Join Video'}
                            >
                              <Video size={15} />
                            </a>
                          )}
                          {apt.status === AppointmentStatus.APPROVED && (
                            <a 
                              href={`/admin/prescriptions/new/${apt.id}`}
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                              title={isRTL ? 'وصفة جديدة' : 'New Prescription'}
                            >
                              <Pill size={15} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Calendar size={32} className="mx-auto text-gray-300 dark:text-white/15 mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-white/30">
                        {isRTL ? 'لا توجد مواعيد' : 'No appointments found'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
