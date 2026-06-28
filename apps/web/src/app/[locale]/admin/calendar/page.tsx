'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { Appointment } from '@dr-ahmed/shared';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';
import { formatTime12Hour } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Video,
  Building2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'month' | 'week' | 'day';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getStatusColor(status: AppointmentStatus) {
  switch (status) {
    case AppointmentStatus.APPROVED:
      return {
        bg: 'bg-emerald-500/20 border-emerald-500/40',
        dot: 'bg-emerald-400',
        text: 'text-emerald-300',
        badge: 'bg-emerald-500/30 text-emerald-200',
        solid: 'bg-emerald-500',
      };
    case AppointmentStatus.REJECTED:
      return {
        bg: 'bg-red-500/20 border-red-500/40',
        dot: 'bg-red-400',
        text: 'text-red-300',
        badge: 'bg-red-500/30 text-red-200',
        solid: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-amber-500/20 border-amber-500/40',
        dot: 'bg-amber-400',
        text: 'text-amber-300',
        badge: 'bg-amber-500/30 text-amber-200',
        solid: 'bg-amber-500',
      };
  }
}

function getAppointmentDate(apt: Appointment): Date {
  return new Date(apt.date);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function AdminCalendarPage() {
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
    setLoading(true);
    setError(false);
    api.get<{ data: Appointment[]; total: number }>('/appointments', token)
      .then((res) => setAppointments(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.patch(`/appointments/${id}/status`, { status }, token);
      fetchAppointments();
      setSelectedApt(prev => prev ? { ...prev, status } : null);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const getAptsForDay = (date: Date) =>
    appointments.filter(apt => isSameDay(getAppointmentDate(apt), date))
      .sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    pending: appointments.filter(a => a.status === AppointmentStatus.PENDING).length,
    approved: appointments.filter(a => a.status === AppointmentStatus.APPROVED || a.status === AppointmentStatus.COMPLETED).length,
    rejected: appointments.filter(a => a.status === AppointmentStatus.REJECTED).length,
    online: appointments.filter(a => a.type === AppointmentType.ONLINE).length,
  };

  // ── Title ────────────────────────────────────────────────────────────────────
  const getTitle = () => {
    if (viewMode === 'month') {
      return `${MONTHS_EN[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const week = getWeekDays();
      return `${week[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${week[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const today = new Date();

  // ── Appointment Card (small) ─────────────────────────────────────────────────
  const AptChip = ({ apt, compact = false }: { apt: Appointment; compact?: boolean }) => {
    const colors = getStatusColor(apt.status);
    const name = apt.guestName || apt.patient?.name || 'Unknown';
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); }}
        className={`w-full text-left rounded-lg border px-2 py-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${colors.bg} ${compact ? 'text-[10px]' : 'text-[11px]'} font-bold truncate`}
      >
        <div className={`flex items-center gap-1 ${colors.text}`}>
          {apt.type === AppointmentType.ONLINE && <Video size={9} className="shrink-0" />}
          <span className="truncate">{compact ? name.split(' ')[0] : name}</span>
          {!compact && <span className="ml-auto shrink-0 opacity-70">{formatTime12Hour(apt.timeSlot, false)}</span>}
        </div>
      </button>
    );
  };

  // ── MONTH VIEW ────────────────────────────────────────────────────────────────
  const MonthView = () => {
    const days = getMonthDays();
    return (
      <div className="flex-1 overflow-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {DAYS_EN.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-white/30">{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1">
          {days.map((date, i) => {
            const isToday = date && isSameDay(date, today);
            const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();
            const dayApts = date ? getAptsForDay(date) : [];
            const extra = dayApts.length > 3 ? dayApts.length - 3 : 0;
            return (
              <div
                key={i}
                className={`min-h-[110px] p-2 border-b border-r border-white/5 transition-colors ${
                  date ? 'hover:bg-white/[0.02]' : 'bg-white/[0.01]'
                } ${!isCurrentMonth ? 'opacity-30' : ''}`}
              >
                {date && (
                  <>
                    <div className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-[11px] font-black mb-1.5 ${
                      isToday ? 'bg-primary text-white shadow-lg shadow-primary/50' : 'text-white/50'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayApts.slice(0, 3).map(apt => (
                        <AptChip key={apt.id} apt={apt} compact />
                      ))}
                      {extra > 0 && (
                        <button className="text-[10px] text-white/40 font-bold hover:text-white/70 transition-colors pl-1">
                          +{extra} more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── WEEK VIEW ─────────────────────────────────────────────────────────────────
  const WeekView = () => {
    const days = getWeekDays();
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-white/10">
          {days.map((d, i) => {
            const isToday = isSameDay(d, today);
            return (
              <div key={i} className={`py-3 text-center border-r border-white/5 ${isToday ? 'bg-primary/10' : ''}`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{DAYS_EN[d.getDay()]}</div>
                <div className={`text-lg font-black mt-0.5 ${isToday ? 'text-primary' : 'text-white/60'}`}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 min-h-[500px]">
          {days.map((d, i) => {
            const isToday = isSameDay(d, today);
            const dayApts = getAptsForDay(d);
            return (
              <div key={i} className={`p-2 space-y-1.5 border-r border-white/5 min-h-[400px] ${isToday ? 'bg-primary/5' : ''}`}>
                {dayApts.map(apt => (
                  <AptChip key={apt.id} apt={apt} />
                ))}
                {dayApts.length === 0 && (
                  <div className="text-[10px] text-white/10 text-center pt-6 font-bold">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── DAY VIEW ──────────────────────────────────────────────────────────────────
  const DayView = () => {
    const dayApts = getAptsForDay(currentDate);
    const isToday = isSameDay(currentDate, today);
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className={`rounded-2xl border ${isToday ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-white/[0.02]'} p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/10 text-white/60'}`}>
              {currentDate.getDate()}
            </div>
            <div>
              <div className="text-white font-black">{DAYS_EN[currentDate.getDay()]}</div>
              <div className="text-white/40 text-sm">{MONTHS_EN[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            </div>
            <div className="ml-auto">
              <span className="text-2xl font-black text-white/80">{dayApts.length}</span>
              <span className="text-white/30 text-sm ml-1">appointments</span>
            </div>
          </div>

          {dayApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/20">
              <CalendarDays size={48} className="mb-4 opacity-30" />
              <p className="font-bold text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayApts.map(apt => {
                const colors = getStatusColor(apt.status);
                const name = apt.guestName || apt.patient?.name || 'Unknown';
                const phone = apt.guestPhone || apt.patient?.phone || '—';
                const email = apt.guestEmail || apt.patient?.email || '—';
                return (
                  <button
                    key={apt.id}
                    onClick={() => setSelectedApt(apt)}
                    className={`w-full text-left rounded-xl border p-4 transition-all hover:scale-[1.01] active:scale-[0.99] ${colors.bg}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2 self-stretch rounded-full ${colors.solid} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-black text-sm ${colors.text}`}>{name}</span>
                          {apt.type === AppointmentType.ONLINE && (
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded-full px-2 py-0.5">
                              <Video size={9} /> Online
                            </span>
                          )}
                          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-white/40 text-[11px] font-bold">
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

  // ── APPOINTMENT DETAIL MODAL ──────────────────────────────────────────────────
  const DetailModal = () => {
    if (!selectedApt) return null;
    const apt = selectedApt;
    const colors = getStatusColor(apt.status);
    const name = apt.guestName || apt.patient?.name || 'Unknown';
    const phone = apt.guestPhone || apt.patient?.phone || '—';
    const email = apt.guestEmail || apt.patient?.email || '—';
    const aptDate = getAppointmentDate(apt);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedApt(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="bg-[#0d1f2d] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors.solid} bg-opacity-20`}>
                  {apt.type === AppointmentType.ONLINE ? (
                    <Video size={18} className="text-white" />
                  ) : (
                    <Building2 size={18} className="text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-black text-white text-sm">{name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedApt(null)}
                className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Date</div>
                  <div className="text-white font-bold text-sm">
                    {aptDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Time</div>
                  <div className="text-white font-bold text-sm">{formatTime12Hour(apt.timeSlot, true)}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                <Phone size={14} className="text-white/30 shrink-0" />
                <div>
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Phone</div>
                  <div className="text-white font-bold text-sm">{phone}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                <Mail size={14} className="text-white/30 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Email</div>
                  <div className="text-white font-bold text-sm truncate">{email}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                {apt.type === AppointmentType.ONLINE ? (
                  <Video size={14} className="text-blue-400 shrink-0" />
                ) : (
                  <Building2 size={14} className="text-white/30 shrink-0" />
                )}
                <div>
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Type</div>
                  <div className="text-white font-bold text-sm">
                    {apt.type === AppointmentType.ONLINE ? 'Online Consultation' : 'In-Clinic Visit'}
                  </div>
                </div>
              </div>

              {apt.notes && (
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Notes</div>
                  <div className="text-white/70 text-sm">{apt.notes}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            {apt.status === AppointmentStatus.PENDING && (
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(apt.id, AppointmentStatus.APPROVED)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-sm hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 font-black text-sm hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <X size={16} />}
                  Reject
                </button>
              </div>
            )}
            {apt.status === AppointmentStatus.APPROVED && (
              <div className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                <Check size={16} />
                Appointment Approved
              </div>
            )}
            {apt.status === AppointmentStatus.REJECTED && (
              <div className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                <AlertCircle size={16} />
                Appointment Rejected
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Calendar</h1>
          <p className="text-sm text-[var(--muted)]">Visual overview of all appointments.</p>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-2 bg-white/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl p-1">
          {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === mode
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-[var(--muted)] hover:text-foreground hover:bg-white/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Online', value: stats.online, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border px-4 py-3 ${s.bg}`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Calendar Card ─────────────────────────────────────────────────────── */}
      <div className="flex-1 rounded-3xl border border-white/10 bg-[#0d1f2d] dark:bg-slate-900/50 overflow-hidden flex flex-col">
        {/* Calendar Header: navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <h2 className="text-white font-black text-base sm:text-lg">{getTitle()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="hidden sm:block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/30 text-primary hover:bg-primary/10 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-white/30">
            <RefreshCw size={32} className="animate-spin mb-4" />
            <p className="font-bold text-sm">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <AlertCircle size={32} className="text-red-400 mb-4" />
            <p className="text-red-400 font-bold mb-4">Failed to load appointments</p>
            <Button variant="outline" onClick={fetchAppointments}>Retry</Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {viewMode === 'month' && <MonthView />}
            {viewMode === 'week' && <WeekView />}
            {viewMode === 'day' && <DayView />}
          </div>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      <DetailModal />
    </div>
  );
}
