'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { Appointment } from '@dr-ahmed/shared';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';
import { formatTime12Hour, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, User, Phone, Mail, Video, Building2, Check, X, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'month' | 'week' | 'day';

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getStatusStyle(status: AppointmentStatus) {
  switch (status) {
    case AppointmentStatus.APPROVED: return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', solid: 'bg-emerald-500' };
    case AppointmentStatus.REJECTED: return { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400', solid: 'bg-red-500' };
    default: return { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', solid: 'bg-amber-500' };
  }
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AdminCalendarPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = useCallback(() => {
    if (!token) return;
    setLoading(true); setError(false);
    api.get<{ data: Appointment[]; total: number }>('/appointments', token)
      .then(res => setAppointments(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    if (!token) return;
    setActionLoading(true);
    try { await api.patch(`/appointments/${id}/status`, { status }, token); fetchAppointments(); setSelectedApt(prev => prev ? { ...prev, status } : null); } finally { setActionLoading(false); }
  };

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  };

  const getAptsForDay = (date: Date) => appointments.filter(apt => isSameDay(new Date(apt.date), date)).sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));

  const stats = {
    pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length,
    approved: appointments.filter(a => a.status === AppointmentStatus.APPROVED || a.status === AppointmentStatus.COMPLETED).length,
    rejected: appointments.filter(a => a.status === AppointmentStatus.REJECTED).length,
    online: appointments.filter(a => a.type === AppointmentType.ONLINE).length,
  };

  const getTitle = () => {
    if (viewMode === 'month') return `${MONTHS_EN[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') { const w = getWeekDays(); return `${w[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${w[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`; }
    return currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const today = new Date();

  const AptChip = ({ apt, compact = false }: { apt: Appointment; compact?: boolean }) => {
    const s = getStatusStyle(apt.status);
    const name = apt.guestName || apt.patient?.name || 'Unknown';
    return (
      <button onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }}
        className={cn("w-full text-left rounded-lg border px-2 py-1 transition-all hover:scale-[1.02] active:scale-[0.98] truncate", s.bg, s.border, compact ? 'text-[10px]' : 'text-[11px]', 'font-semibold')}>
        <div className={cn("flex items-center gap-1", s.text)}>
          {apt.type === AppointmentType.ONLINE && <Video size={9} className="shrink-0" />}
          <span className="truncate">{compact ? name.split(' ')[0] : name}</span>
          {!compact && <span className="ml-auto shrink-0 opacity-70">{formatTime12Hour(apt.timeSlot, false)}</span>}
        </div>
      </button>
    );
  };

  const MonthView = () => {
    const days = getMonthDays();
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/5">
          {DAYS_EN.map(d => <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {days.map((date, i) => {
            const isToday = date && isSameDay(date, today);
            const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();
            const dayApts = date ? getAptsForDay(date) : [];
            const extra = dayApts.length > 3 ? dayApts.length - 3 : 0;
            return (
              <div key={i} className={cn("min-h-[110px] p-2 border-b border-r border-slate-100 dark:border-white/5 transition-colors", date ? "hover:bg-slate-50 dark:hover:bg-white/[0.02]" : "bg-slate-50/50 dark:bg-white/[0.01]", !isCurrentMonth && "opacity-30")}>
                {date && <>
                  <div className={cn("inline-flex w-7 h-7 items-center justify-center rounded-lg text-[11px] font-bold mb-1.5", isToday ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" : "text-slate-500 dark:text-white/50")}>{date.getDate()}</div>
                  <div className="space-y-0.5">
                    {dayApts.slice(0, 3).map(apt => <AptChip key={apt.id} apt={apt} compact />)}
                    {extra > 0 && <button className="text-[10px] text-slate-400 dark:text-white/40 font-bold hover:text-indigo-500 transition-colors pl-1">+{extra} more</button>}
                  </div>
                </>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const days = getWeekDays();
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/5">
          {days.map((d, i) => { const isToday = isSameDay(d, today); return (
            <div key={i} className={cn("py-3 text-center border-r border-slate-100 dark:border-white/5", isToday && "bg-indigo-50 dark:bg-indigo-500/5")}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{DAYS_EN[d.getDay()]}</div>
              <div className={cn("text-lg font-bold mt-0.5", isToday ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-white/60")}>{d.getDate()}</div>
            </div>
          );})}
        </div>
        <div className="grid grid-cols-7 min-h-[500px]">
          {days.map((d, i) => {
            const isToday = isSameDay(d, today);
            const dayApts = getAptsForDay(d);
            return (
              <div key={i} className={cn("p-2 space-y-1.5 border-r border-slate-100 dark:border-white/5 min-h-[400px]", isToday && "bg-indigo-50/50 dark:bg-indigo-500/5")}>
                {dayApts.map(apt => <AptChip key={apt.id} apt={apt} />)}
                {dayApts.length === 0 && <div className="text-[10px] text-slate-300 dark:text-white/10 text-center pt-6 font-bold">—</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DayView = () => {
    const dayApts = getAptsForDay(currentDate);
    const isToday = isSameDay(currentDate, today);
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className={cn("rounded-2xl border p-6", isToday ? "border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5" : "border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02]")}>
          <div className="flex items-center gap-3 mb-6">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold", isToday ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60")}>{currentDate.getDate()}</div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold">{DAYS_EN[currentDate.getDay()]}</div>
              <div className="text-slate-400 dark:text-white/40 text-sm">{MONTHS_EN[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            </div>
            <div className="ml-auto"><span className="text-2xl font-bold text-slate-800 dark:text-white/80">{dayApts.length}</span><span className="text-slate-400 dark:text-white/30 text-sm ml-1">{isRTL ? 'مواعيد' : 'appts'}</span></div>
          </div>
          {dayApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-white/20">
              <CalendarDays size={48} className="mb-4 opacity-30" />
              <p className="font-bold text-sm">{isRTL ? 'لا توجد مواعيد' : 'No appointments'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayApts.map(apt => {
                const s = getStatusStyle(apt.status);
                const name = apt.guestName || apt.patient?.name || 'Unknown';
                const phone = apt.guestPhone || apt.patient?.phone || '—';
                const email = apt.guestEmail || apt.patient?.email || '—';
                return (
                  <button key={apt.id} onClick={() => setSelectedApt(apt)} className={cn("w-full text-left rounded-xl border p-4 transition-all hover:scale-[1.01] active:scale-[0.99]", s.bg, s.border)}>
                    <div className="flex items-start gap-4">
                      <div className={cn("w-2 self-stretch rounded-full shrink-0", s.solid)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("font-bold text-sm", s.text)}>{name}</span>
                          {apt.type === AppointmentType.ONLINE && <span className="flex items-center gap-1 text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg px-2 py-0.5"><Video size={9} /> Online</span>}
                          <span className={cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-lg", s.bg, s.text)}>{apt.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 dark:text-white/40 text-[11px] font-medium">
                          <span className="flex items-center gap-1"><Clock size={10} />{formatTime12Hour(apt.timeSlot, true)}</span>
                          <span className="flex items-center gap-1"><Phone size={10} />{phone}</span>
                          <span className="hidden sm:flex items-center gap-1 truncate"><Mail size={10} />{email}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const DetailModal = () => {
    if (!selectedApt) return null;
    const apt = selectedApt;
    const s = getStatusStyle(apt.status);
    const name = apt.guestName || apt.patient?.name || 'Unknown';
    const phone = apt.guestPhone || apt.patient?.phone || '—';
    const email = apt.guestEmail || apt.patient?.email || '—';
    const aptDate = new Date(apt.date);
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApt(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", s.solid, "text-white")}>
                  {apt.type === AppointmentType.ONLINE ? <Video size={18} /> : <Building2 size={18} />}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h2>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg", s.bg, s.text)}>{apt.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedApt(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"><X size={16} /></button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><div className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider mb-1">Date</div><div className="text-slate-900 dark:text-white font-bold text-sm">{aptDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><div className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider mb-1">Time</div><div className="text-slate-900 dark:text-white font-bold text-sm">{formatTime12Hour(apt.timeSlot, true)}</div></div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex items-center gap-3"><Phone size={14} className="text-slate-400 dark:text-white/30 shrink-0" /><div><div className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider">Phone</div><div className="text-slate-900 dark:text-white font-bold text-sm">{phone}</div></div></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex items-center gap-3"><Mail size={14} className="text-slate-400 dark:text-white/30 shrink-0" /><div className="min-w-0"><div className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider">Email</div><div className="text-slate-900 dark:text-white font-bold text-sm truncate">{email}</div></div></div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex items-center gap-3">
                {apt.type === AppointmentType.ONLINE ? <Video size={14} className="text-cyan-500 shrink-0" /> : <Building2 size={14} className="text-slate-400 dark:text-white/30 shrink-0" />}
                <div><div className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider">Type</div><div className="text-slate-900 dark:text-white font-bold text-sm">{apt.type === AppointmentType.ONLINE ? 'Online Consultation' : 'In-Clinic Visit'}</div></div>
              </div>
              {apt.notes && <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><div className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider mb-1">Notes</div><div className="text-slate-600 dark:text-white/70 text-sm">{apt.notes}</div></div>}
            </div>
            {apt.status === AppointmentStatus.PENDING && (
              <div className="flex gap-3">
                <button onClick={() => updateStatus(apt.id, AppointmentStatus.APPROVED)} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Approve
                </button>
                <button onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50">
                  <X size={16} /> Reject
                </button>
              </div>
            )}
            {apt.status === AppointmentStatus.APPROVED && <div className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold"><Check size={16} /> Appointment Approved</div>}
            {apt.status === AppointmentStatus.REJECTED && <div className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold"><AlertCircle size={16} /> Appointment Rejected</div>}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{isRTL ? 'التقويم' : 'Calendar'}</h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{isRTL ? 'نظرة بصرية على جميع المواعيد' : 'Visual overview of all appointments'}</p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-white/5 p-1">
          {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={cn("px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
              viewMode === mode ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25" : "text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/50")}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isRTL ? 'قيد الانتظار' : 'Pending', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
          { label: isRTL ? 'مقبول' : 'Approved', value: stats.approved, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
          { label: isRTL ? 'مرفوض' : 'Rejected', value: stats.rejected, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
          { label: isRTL ? 'أونلاين' : 'Online', value: stats.online, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' },
        ].map(s => (
          <div key={s.label} className={cn("rounded-2xl border px-4 py-3", s.bg)}>
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"><ChevronLeft size={18} /></button>
          <h2 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg">{getTitle()}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date())} className="hidden sm:block px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">Today</button>
            <button onClick={() => navigate(1)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-slate-400 dark:text-white/30">
            <RefreshCw size={32} className="animate-spin mb-4" />
            <p className="font-bold text-sm">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <AlertCircle size={32} className="text-red-400 mb-4" />
            <p className="text-red-500 dark:text-red-400 font-bold mb-4">{isRTL ? 'فشل التحميل' : 'Failed to load'}</p>
            <button onClick={fetchAppointments} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 transition-all">{isRTL ? 'إعادة المحاولة' : 'Retry'}</button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {viewMode === 'month' && <MonthView />}
            {viewMode === 'week' && <WeekView />}
            {viewMode === 'day' && <DayView />}
          </div>
        )}
      </div>

      <DetailModal />
    </div>
  );
}
