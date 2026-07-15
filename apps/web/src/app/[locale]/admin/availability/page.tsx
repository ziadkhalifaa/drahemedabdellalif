'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { toast } from 'sonner';
import { CalendarDays, X, Plus, Lock, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AvailabilityCalendarPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => {
    if (!token) return;
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

    setLoading(true);
    api.get<any[]>(`/appointments/blocked-slots?start=${start}&end=${end}`, token)
      .then(setBlockedSlots)
      .catch(() => setBlockedSlots([]))
      .finally(() => setLoading(false));
  }, [token, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleBlockDay = async () => {
    if (!token || !blockDate) return;
    setSubmitting(true);
    try {
      await api.post('/appointments/block-slot', {
        date: blockDate,
        timeSlot: blockTime || null,
        reason: blockReason,
      }, token);
      toast.success('Slot blocked successfully');
      setShowBlockModal(false);
      setBlockDate('');
      setBlockTime('');
      setBlockReason('');
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      api.get<any[]>(`/appointments/blocked-slots?start=${start}&end=${end}`, token)
        .then(setBlockedSlots)
        .catch(() => {});
    } catch (err: any) {
      toast.error(err.message || 'Failed to block slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/appointments/blocked-slots/${id}`, token);
      setBlockedSlots(prev => prev.filter(s => s.id !== id));
      toast.success('Slot unblocked');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unblock');
    }
  };

  const isBlocked = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedSlots.some(s => {
      const d = new Date(s.date).toISOString().split('T')[0];
      return d === dateStr && !s.timeSlot;
    });
  };

  const getBlockedCount = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedSlots.filter(s => {
      const d = new Date(s.date).toISOString().split('T')[0];
      return d === dateStr && s.timeSlot;
    }).length;
  };

  const getBlockedSlotsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedSlots.filter(s => {
      const d = new Date(s.date).toISOString().split('T')[0];
      return d === dateStr;
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const today = new Date();
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
          <div className="h-10 w-48 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse mx-auto mb-6" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <CalendarDays size={18} className="text-indigo-500" />
            </div>
            Availability Calendar
          </h1>
          <p className={cn("text-[13px] text-slate-500 dark:text-white/35 mt-1.5", isRTL ? "mr-12" : "ml-12")}>
            Block days or individual time slots when you&apos;re unavailable.
          </p>
        </div>
        <button
          onClick={() => setShowBlockModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 text-[13px] font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={15} />
          Block a Slot
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 dark:text-white/25 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 dark:text-white/25 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const blocked = isBlocked(day);
            const blockedCount = getBlockedCount(day);
            const todayMark = isToday(day);
            const daySlots = getBlockedSlotsForDay(day);

            return (
              <div
                key={day}
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  setBlockDate(dateStr);
                  setShowBlockModal(true);
                }}
                className={cn(
                  "relative h-20 p-2 rounded-xl border cursor-pointer transition-all hover:border-indigo-500/50",
                  todayMark && "border-indigo-500 border-2",
                  blocked ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 dark:border-red-500/30" : "border-slate-200/60 dark:border-white/5",
                  !blocked && !todayMark && "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                )}
              >
                <span className={cn(
                  "text-[13px] font-bold",
                  todayMark ? "text-indigo-500" : blocked ? "text-red-500" : "text-slate-700 dark:text-white/60"
                )}>
                  {day}
                </span>
                {blocked && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                      <Lock size={9} /> BLOCKED
                    </span>
                  </div>
                )}
                {blockedCount > 0 && !blocked && (
                  <div className={cn("absolute bottom-2", isRTL ? "right-2" : "left-2")}>
                    <span className="text-[9px] font-bold text-orange-500">{blockedCount} slot(s)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Slots for Current Month */}
      {blockedSlots.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
            Blocked Slots ({blockedSlots.length})
          </h3>
          <div className="space-y-2">
            {blockedSlots.map(slot => {
              const slotDate = new Date(slot.date);
              const formattedDate = slotDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                      <Lock size={13} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {formattedDate}
                        {slot.timeSlot && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/35 uppercase">
                            {slot.timeSlot}
                          </span>
                        )}
                        {!slot.timeSlot && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-500 uppercase">
                            Full Day
                          </span>
                        )}
                      </div>
                      {slot.reason && (
                        <p className="text-[12px] text-slate-500 dark:text-white/35 mt-0.5">{slot.reason}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(slot.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-white/25 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 w-full max-w-md p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowBlockModal(false)}
              className={cn("absolute top-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-white/25 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all", isRTL ? "left-4" : "right-4")}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
                <Lock size={18} className="text-indigo-500" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Block a Slot</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Date</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={e => setBlockDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
                  Time Slot (leave empty for full day)
                </label>
                <input
                  type="time"
                  value={blockTime}
                  onChange={e => setBlockTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Reason (optional)</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="e.g. Conference"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleBlockDay}
              disabled={submitting || !blockDate}
              className={cn(
                "w-full h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all",
                submitting || !blockDate
                  ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/25 cursor-not-allowed"
                  : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
              )}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              {submitting ? 'Blocking...' : 'Confirm Block'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
