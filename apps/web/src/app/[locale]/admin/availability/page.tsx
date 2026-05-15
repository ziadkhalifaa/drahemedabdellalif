'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { CalendarDays, X, Plus, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AvailabilityCalendarPage() {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for adding a blocked slot
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState(''); // empty = full day
  const [blockReason, setBlockReason] = useState('');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => {
    if (!token) return;
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

    api.get<any[]>(`/appointments/blocked-slots?start=${start}&end=${end}`, token)
      .then(setBlockedSlots)
      .catch(() => setBlockedSlots([]))
      .finally(() => setLoading(false));
  }, [token, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleBlockDay = async () => {
    if (!token || !blockDate) return;
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
      // Refresh
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      api.get<any[]>(`/appointments/blocked-slots?start=${start}&end=${end}`, token)
        .then(setBlockedSlots)
        .catch(() => {});
    } catch (err: any) {
      toast.error(err.message || 'Failed to block slot');
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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <CalendarDays className="text-[var(--primary)]" />
            Availability Calendar
          </h1>
          <p className="text-sm text-[var(--muted)]">Block days or individual time slots when you&apos;re unavailable.</p>
        </div>
        <Button onClick={() => setShowBlockModal(true)} className="gap-2 rounded-xl font-bold">
          <Plus size={18} /> Block a Slot
        </Button>
      </div>

      {/* Month Navigation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setCurrentMonth(new Date(year, month - 1))}>&larr;</Button>
          <h2 className="text-xl font-black">{monthNames[month]} {year}</h2>
          <Button variant="ghost" onClick={() => setCurrentMonth(new Date(year, month + 1))}>&rarr;</Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-bold uppercase text-[var(--muted)] py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const blocked = isBlocked(day);
            const blockedCount = getBlockedCount(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <div
                key={day}
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  setBlockDate(dateStr);
                  setShowBlockModal(true);
                }}
                className={cn(
                  "relative h-20 p-2 rounded-xl border cursor-pointer transition-all hover:border-[var(--primary)]",
                  isToday && "border-[var(--primary)] border-2",
                  blocked ? "bg-red-500/10 border-red-500/30" : "border-[var(--border)]"
                )}
              >
                <span className={cn("text-sm font-bold", isToday && "text-[var(--primary)]")}>{day}</span>
                {blocked && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[9px] font-bold text-red-500 flex items-center gap-1"><Lock size={10} /> BLOCKED</span>
                  </div>
                )}
                {blockedCount > 0 && !blocked && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[9px] font-bold text-orange-500">{blockedCount} slot(s)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 space-y-5 relative">
            <button onClick={() => setShowBlockModal(false)} className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)]">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black flex items-center gap-2"><Lock className="text-red-500" /> Block a Slot</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Date</label>
              <Input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Time Slot (leave empty to block full day)</label>
              <Input type="time" value={blockTime} onChange={e => setBlockTime(e.target.value)} className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Reason (optional)</label>
              <Input value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="e.g. Conference" className="rounded-xl" />
            </div>

            <Button onClick={handleBlockDay} className="w-full rounded-xl font-bold py-6 bg-red-500 hover:bg-red-600">
              Confirm Block
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
