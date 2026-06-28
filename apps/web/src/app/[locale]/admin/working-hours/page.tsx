'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Clock, Save, AlertCircle, CalendarX, Plus, Trash2, ShieldAlert } from 'lucide-react';
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
  
  // Schedule State
  const [hours, setHours] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Exceptions State
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
      
      // Refresh blocked slots
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
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-black">{t('title')}</h1>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-6 h-24 animate-pulse bg-[var(--card)] border-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white shadow-lg shadow-blue-500/20">
              <Clock size={28} />
            </div>
            {isRTL ? 'إدارة المواعيد' : 'Schedule Management'}
          </h1>
          <p className="text-[var(--muted)]">
            {isRTL 
              ? 'تحكم في أوقات العمل الأسبوعية، وقم بإضافة استثناءات وحجب لأوقات محددة.' 
              : 'Control your weekly working hours and add exceptions to block specific times.'}
          </p>
        </div>

        <div className="flex bg-[var(--card)] p-1.5 rounded-2xl border border-[var(--border)] shadow-sm">
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative",
              activeTab === 'schedule' ? "text-white" : "text-[var(--muted)] hover:text-white"
            )}
          >
            {activeTab === 'schedule' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-[var(--primary)] rounded-xl" />
            )}
            <span className="relative z-10">{isRTL ? 'الجدول الأسبوعي' : 'Weekly Schedule'}</span>
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative flex items-center gap-2",
              activeTab === 'exceptions' ? "text-white" : "text-[var(--muted)] hover:text-white"
            )}
          >
            {activeTab === 'exceptions' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-rose-500 rounded-xl" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <CalendarX size={16} />
              {isRTL ? 'الاستثناءات (حجب)' : 'Exceptions (Block)'}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedule' ? (
          <motion.div 
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {hours.map((hour) => (
              <Card key={hour.dayOfWeek} className={cn(
                "p-5 md:p-6 border-[var(--border)] transition-all duration-300 hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5", 
                !hour.isActive && "opacity-60 bg-black/20"
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left side: Day and Toggle */}
                  <div className="flex items-center gap-6 w-full md:w-1/4">
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={hour.isActive}
                          onChange={(e) => handleToggle(hour.dayOfWeek, hour, e.target.checked)}
                          disabled={savingId === hour.dayOfWeek}
                        />
                        <div className="w-12 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all dark:border-gray-600 peer-checked:bg-[var(--primary)] shadow-inner"></div>
                      </label>
                      <span className={cn("font-black text-lg", hour.isActive ? "text-white" : "text-[var(--muted)]")}>
                        {daysOfWeek[hour.dayOfWeek]}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Times and Duration */}
                  <div className={cn("grid grid-cols-2 lg:grid-cols-4 items-end gap-4 w-full md:flex-1", !hour.isActive && "pointer-events-none opacity-50")}>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] block px-1">{t('startTime', { fallback: 'Start Time' })}</label>
                      <Input 
                        type="time" 
                        value={hour.startTime} 
                        onChange={(e) => setHours(prev => prev.map(h => h.dayOfWeek === hour.dayOfWeek ? { ...h, startTime: e.target.value } : h))}
                        className="font-bold text-base h-11 bg-[var(--background)]/50 border-[var(--border)] rounded-xl focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] block px-1">{t('endTime', { fallback: 'End Time' })}</label>
                      <Input 
                        type="time" 
                        value={hour.endTime} 
                        onChange={(e) => setHours(prev => prev.map(h => h.dayOfWeek === hour.dayOfWeek ? { ...h, endTime: e.target.value } : h))}
                        className="font-bold text-base h-11 bg-[var(--background)]/50 border-[var(--border)] rounded-xl focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] block px-1 truncate">{t('slotDuration', { fallback: 'Duration' })}</label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          min="5"
                          step="5"
                          value={hour.slotDuration} 
                          onChange={(e) => setHours(prev => prev.map(h => h.dayOfWeek === hour.dayOfWeek ? { ...h, slotDuration: parseInt(e.target.value) } : h))}
                          className="font-bold text-base h-11 bg-[var(--background)]/50 border-[var(--border)] rounded-xl pl-4 pr-10 focus:border-[var(--primary)]"
                        />
                        <span className={cn("absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)] pointer-events-none", isRTL ? "left-3" : "right-3")}>min</span>
                      </div>
                    </div>
                    
                    <div className="col-span-2 lg:col-span-1">
                      <Button 
                        onClick={() => handleUpdate(hour.dayOfWeek, { startTime: hour.startTime, endTime: hour.endTime, slotDuration: hour.slotDuration, isActive: hour.isActive })}
                        disabled={savingId === hour.dayOfWeek || !hour.isActive}
                        variant="default"
                        className="w-full bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] h-11 px-6 rounded-xl font-bold shadow-md shadow-[var(--primary)]/20"
                      >
                        <Save size={18} className={cn(isRTL ? "ml-2" : "mr-2")} />
                        {savingId === hour.dayOfWeek ? tCommon('loading', { fallback: 'Saving...' }) : tCommon('save', { fallback: 'Save' })}
                      </Button>
                    </div>
                  </div>

                </div>
                
                {!hour.isActive && (
                   <div className="mt-5 p-3 rounded-xl bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-sm flex items-center gap-3 font-medium">
                      <AlertCircle size={18} className="text-zinc-500" />
                      {t('closed', { fallback: 'No online consultations on this day.' })}
                   </div>
                )}
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="exceptions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Form Side */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 border-[var(--border)] shadow-xl shadow-black/40 bg-gradient-to-b from-[var(--card)] to-[var(--background)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-rose-400">
                  <ShieldAlert size={20} />
                  {isRTL ? 'إضافة حجب جديد' : 'Add New Block'}
                </h3>
                
                <form onSubmit={handleAddBlock} className="space-y-5 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">{isRTL ? 'التاريخ' : 'Date'} *</label>
                    <Input 
                      type="date" 
                      required
                      value={blockDate}
                      onChange={e => setBlockDate(e.target.value)}
                      className="bg-black/50 border-white/10 h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      {isRTL ? 'الوقت (اختياري)' : 'Time Slot (Optional)'}
                    </label>
                    <Input 
                      type="time" 
                      value={blockTime}
                      onChange={e => setBlockTime(e.target.value)}
                      className="bg-black/50 border-white/10 h-12"
                    />
                    <p className="text-[10px] text-white/40">
                      {isRTL ? 'اتركه فارغاً لإغلاق اليوم بالكامل' : 'Leave empty to block the entire day'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">{isRTL ? 'السبب (اختياري)' : 'Reason (Optional)'}</label>
                    <Input 
                      type="text" 
                      placeholder={isRTL ? 'مثال: استراحة غداء، ظرف طارئ...' : 'e.g., Lunch break, Emergency...'}
                      value={blockReason}
                      onChange={e => setBlockReason(e.target.value)}
                      className="bg-black/50 border-white/10 h-12"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isBlocking || !blockDate}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white h-12 rounded-xl font-black text-sm"
                  >
                    {isBlocking ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> {isRTL ? 'جاري الإضافة...' : 'Adding...'}</span>
                    ) : (
                      <span className="flex items-center gap-2"><Plus size={18} /> {isRTL ? 'إغلاق الموعد' : 'Block Slot'}</span>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* List Side */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-black mb-6 px-2">{isRTL ? 'الاستثناءات القادمة' : 'Upcoming Blocked Slots'}</h3>
              
              {blockedSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4">
                    <CalendarX size={32} />
                  </div>
                  <p className="text-white/50 font-medium">
                    {isRTL ? 'لا توجد أوقات استثنائية محجوبة قادمة.' : 'No upcoming blocked slots.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {blockedSlots.map(slot => {
                    const slotDate = new Date(slot.date);
                    const formattedDate = slotDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                    
                    return (
                      <Card key={slot.id} className="p-4 md:p-5 flex items-center justify-between gap-4 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <CalendarX size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                              {formattedDate}
                              {slot.timeSlot && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/80 uppercase tracking-wider">
                                  {slot.timeSlot}
                                </span>
                              )}
                              {!slot.timeSlot && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 uppercase tracking-wider font-bold">
                                  {isRTL ? 'مغلق بالكامل' : 'Whole Day'}
                                </span>
                              )}
                            </div>
                            {slot.reason && (
                              <p className="text-sm text-white/50 mt-1">{slot.reason}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBlock(slot.id)}
                          className="text-white/40 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                          title={isRTL ? 'حذف الاستثناء' : 'Remove Exception'}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </Card>
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
