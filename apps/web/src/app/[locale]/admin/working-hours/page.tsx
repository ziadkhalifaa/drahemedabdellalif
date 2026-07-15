'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { toast } from 'sonner';
import { Clock, Save, AlertCircle, CalendarX, Plus, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkingHoursPage() {
  const t = useTranslations('admin.workingHours');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<'schedule' | 'exceptions'>('schedule');
  const [loading, setLoading] = useState(true);

  const [hours, setHours] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const daysOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysOfWeekAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysOfWeek = isRTL ? daysOfWeekAr : daysOfWeekEn;

  const defaultHours = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false },
  ];

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [hoursRes, blockedRes] = await Promise.all([
        api.get<any[]>('/working-hours', token),
        api.get<any[]>('/working-hours/blocked', token)
      ]);

      const merged = defaultHours.map(def => {
        const existing = hoursRes.find(h => h.dayOfWeek === def.dayOfWeek);
        return existing ? existing : def;
      });
      setHours(merged);
      setBlockedSlots(blockedRes || []);
    } catch (err: any) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdate = async (dayOfWeek: number, updates: any) => {
    if (!token) return;
    setSavingId(dayOfWeek);
    try {
      const res = await api.put(`/working-hours`, { dayOfWeek, ...updates }, token);
      setHours(prev => prev.map(h => h.dayOfWeek === dayOfWeek ? { ...h, ...res } : h));
      toast.success(tCommon('success') || 'Updated successfully');
    } catch (err: any) {
      toast.error(err.message || tCommon('error'));
    } finally {
      setSavingId(null);
    }
  };

  const handleToggle = (dayOfWeek: number, currentHour: any, isActive: boolean) => {
    handleUpdate(dayOfWeek, {
      startTime: currentHour.startTime,
      endTime: currentHour.endTime,
      slotDuration: currentHour.slotDuration,
      isActive
    });
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !blockDate) return;
    setIsBlocking(true);
    try {
      await api.post('/working-hours/block', {
        date: blockDate,
        timeSlot: blockTime || undefined,
        reason: blockReason || undefined
      }, token);

      toast.success(isRTL ? 'تم إضافة الاستثناء بنجاح' : 'Exception added successfully');
      setBlockDate('');
      setBlockTime('');
      setBlockReason('');

      const res = await api.get<any[]>('/working-hours/blocked', token);
      setBlockedSlots(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Error adding block');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/working-hours/block/${id}`, token);
      setBlockedSlots(prev => prev.filter(b => b.id !== id));
      toast.success(isRTL ? 'تم مسح الاستثناء' : 'Exception removed');
    } catch (err: any) {
      toast.error(err.message || 'Error removing block');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <Clock size={18} className="text-indigo-500" />
            </div>
            {isRTL ? 'إدارة المواعيد' : 'Schedule Management'}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-1.5 ml-12">
            {isRTL
              ? 'تحكم في أوقات العمل الأسبوعية، وقم بإضافة استثناءات وحجب لأوقات محددة.'
              : 'Control your weekly working hours and add exceptions to block specific times.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-bold transition-all relative",
              activeTab === 'schedule'
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-white/35 hover:text-slate-700 dark:hover:text-white/50"
            )}
          >
            {isRTL ? 'الجدول الأسبوعي' : 'Weekly Schedule'}
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-bold transition-all relative flex items-center gap-2",
              activeTab === 'exceptions'
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-white/35 hover:text-slate-700 dark:hover:text-white/50"
            )}
          >
            <CalendarX size={14} />
            {isRTL ? 'الاستثناءات' : 'Exceptions'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedule' ? (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {hours.map((hour) => (
              <div
                key={hour.dayOfWeek}
                className={cn(
                  "bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 transition-all",
                  !hour.isActive && "opacity-50"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Day + Toggle */}
                  <div className="flex items-center gap-4 w-full md:w-48 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={hour.isActive}
                        onChange={(e) => handleToggle(hour.dayOfWeek, hour, e.target.checked)}
                        disabled={savingId === hour.dayOfWeek}
                      />
                      <div className="w-10 h-[22px] bg-slate-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-indigo-500 shadow-inner" />
                    </label>
                    <span className={cn(
                      "text-[13px] font-bold",
                      hour.isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/25"
                    )}>
                      {daysOfWeek[hour.dayOfWeek]}
                    </span>
                  </div>

                  {/* Fields */}
                  <div className={cn(
                    "grid grid-cols-2 lg:grid-cols-4 items-end gap-3 flex-1",
                    !hour.isActive && "pointer-events-none"
                  )}>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 block px-1">
                        {t('startTime', { fallback: 'Start' })}
                      </label>
                      <input
                        type="time"
                        value={hour.startTime}
                        onChange={(e) => setHours(prev => prev.map(h => h.dayOfWeek === hour.dayOfWeek ? { ...h, startTime: e.target.value } : h))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 block px-1">
                        {t('endTime', { fallback: 'End' })}
                      </label>
                      <input
                        type="time"
                        value={hour.endTime}
                        onChange={(e) => setHours(prev => prev.map(h => h.dayOfWeek === hour.dayOfWeek ? { ...h, endTime: e.target.value } : h))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 block px-1">
                        {t('slotDuration', { fallback: 'Duration' })}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={hour.slotDuration}
                          onChange={(e) => setHours(prev => prev.map(h => h.dayOfWeek === hour.dayOfWeek ? { ...h, slotDuration: parseInt(e.target.value) } : h))}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <span className={cn(
                          "absolute top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 dark:text-white/25 pointer-events-none",
                          isRTL ? "left-3" : "right-3"
                        )}>min</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpdate(hour.dayOfWeek, { startTime: hour.startTime, endTime: hour.endTime, slotDuration: hour.slotDuration, isActive: hour.isActive })}
                      disabled={savingId === hour.dayOfWeek || !hour.isActive}
                      className={cn(
                        "h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all",
                        savingId === hour.dayOfWeek
                          ? "bg-indigo-500/20 text-indigo-400 cursor-not-allowed"
                          : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
                      )}
                    >
                      {savingId === hour.dayOfWeek ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {savingId === hour.dayOfWeek ? tCommon('loading', { fallback: 'Saving...' }) : tCommon('save', { fallback: 'Save' })}
                    </button>
                  </div>
                </div>

                {!hour.isActive && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-white/35 text-[12px] flex items-center gap-2">
                    <AlertCircle size={14} />
                    {t('closed', { fallback: 'No online consultations on this day.' })}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="exceptions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Add Block Form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 space-y-5 sticky top-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
                    <ShieldAlert size={18} className="text-indigo-500" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                    {isRTL ? 'إضافة حجب جديد' : 'Add New Block'}
                  </h3>
                </div>

                <form onSubmit={handleAddBlock} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
                      {isRTL ? 'التاريخ' : 'Date'} *
                    </label>
                    <input
                      type="date"
                      required
                      value={blockDate}
                      onChange={e => setBlockDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
                      {isRTL ? 'الوقت (اختياري)' : 'Time Slot (Optional)'}
                    </label>
                    <input
                      type="time"
                      value={blockTime}
                      onChange={e => setBlockTime(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-white/25">
                      {isRTL ? 'اتركه فارغاً لإغلاق اليوم بالكامل' : 'Leave empty to block the entire day'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
                      {isRTL ? 'السبب (اختياري)' : 'Reason (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRTL ? 'مثال: استراحة غداء' : 'e.g., Lunch break'}
                      value={blockReason}
                      onChange={e => setBlockReason(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBlocking || !blockDate}
                    className={cn(
                      "w-full h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all",
                      isBlocking || !blockDate
                        ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/25 cursor-not-allowed"
                        : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
                    )}
                  >
                    {isBlocking ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    {isBlocking ? (isRTL ? 'جاري الإضافة...' : 'Adding...') : (isRTL ? 'إغلاق الموعد' : 'Block Slot')}
                  </button>
                </form>
              </div>
            </div>

            {/* Blocked Slots List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {isRTL ? 'الاستثناءات القادمة' : 'Upcoming Blocked Slots'}
              </h3>

              {blockedSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-100 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200/60 dark:border-white/5">
                  <div className="w-14 h-14 bg-slate-200/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 dark:text-white/25 mb-3">
                    <CalendarX size={24} />
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-white/35 font-medium">
                    {isRTL ? 'لا توجد أوقات استثنائية محجوبة قادمة.' : 'No upcoming blocked slots.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedSlots.map(slot => {
                    const slotDate = new Date(slot.date);
                    const formattedDate = slotDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

                    return (
                      <div
                        key={slot.id}
                        className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                            <CalendarX size={16} className="text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                              {formattedDate}
                              {slot.timeSlot && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/35 uppercase tracking-wider">
                                  {slot.timeSlot}
                                </span>
                              )}
                              {!slot.timeSlot && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-500 uppercase tracking-wider">
                                  {isRTL ? 'مغلق بالكامل' : 'Whole Day'}
                                </span>
                              )}
                            </div>
                            {slot.reason && (
                              <p className="text-[12px] text-slate-500 dark:text-white/35 mt-0.5 truncate">{slot.reason}</p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBlock(slot.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-white/25 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                          title={isRTL ? 'حذف الاستثناء' : 'Remove Exception'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
