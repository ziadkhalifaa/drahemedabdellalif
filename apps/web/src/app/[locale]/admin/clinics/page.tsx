'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { clinicsApi, siteSettingsApi } from '@/lib/api';
import { cn, formatTime12Hour } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Clock, Save, Plus, Trash2, Phone,
  MapPin, CheckCircle, XCircle, Loader2, Calendar, AlertCircle, Video,
  ChevronDown, ChevronUp, Lock, Unlock, HelpCircle, UserPlus, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function generateSlots(startTime: string, endTime: string, duration: number): string[] {
  const slots: string[] = [];
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    const end = new Date();
    end.setHours(endH, endM, 0, 0);
    while (current < end) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current.setMinutes(current.getMinutes() + duration);
    }
  } catch (e) {
    console.error('Error generating slots:', e);
  }
  return slots;
}

export default function AdminClinicsPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();

  const [clinics, setClinics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [workingHours, setWorkingHours] = useState<Record<string, any[]>>({});
  const [blockedSlots, setBlockedSlots] = useState<Record<string, any[]>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [maxBookingWeeks, setMaxBookingWeeks] = useState(2);
  const [savingSettings, setSavingSettings] = useState(false);

  const [showHoursConfig, setShowHoursConfig] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  });
  const [availableSlotsForDate, setAvailableSlotsForDate] = useState<string[]>([]);

  const [blockingSlot, setBlockingSlot] = useState<string | null>(null);
  const [blockReasonText, setBlockReasonText] = useState('');
  const [blockOptionType, setBlockOptionType] = useState<'clinic' | 'busy' | 'custom'>('clinic');
  const [blockDayOptionType, setBlockDayOptionType] = useState<'vacation' | 'closed' | 'custom'>('vacation');
  const [selectedBlockedItem, setSelectedBlockedItem] = useState<any | null>(null);
  const [isBlockingWholeDay, setIsBlockingWholeDay] = useState(false);
  const [blockingInProgress, setBlockingInProgress] = useState(false);
  const [unblockingInProgress, setUnblockingInProgress] = useState(false);

  const loadClinics = useCallback(async () => {
    try {
      const data = await clinicsApi.getAll(token);
      setClinics(data);
      const wh: Record<string, any[]> = {};
      const bs: Record<string, any[]> = {};
      try {
        const settingsList = await siteSettingsApi.getAllPublic();
        const maxWeeksSetting = settingsList.find((s: any) => s.key === 'maxBookingWeeks');
        if (maxWeeksSetting) setMaxBookingWeeks(Number(maxWeeksSetting.value) || 2);
      } catch (err) {
        console.error('Failed to load max booking weeks settings:', err);
      }
      await Promise.all(data.map(async (c: any) => {
        const [hours, blocked] = await Promise.all([
          clinicsApi.getWorkingHours(c.id, token),
          clinicsApi.getBlockedSlots(c.id, token),
        ]);
        wh[c.id] = Array.from({ length: 7 }, (_, i) => {
          const existing = hours.find((h: any) => h.dayOfWeek === i);
          return existing || { dayOfWeek: i, startTime: '09:00', endTime: '17:00', slotDuration: 30, isActive: false };
        });
        bs[c.id] = blocked;
      }));
      setWorkingHours(wh);
      setBlockedSlots(bs);
    } catch (e: any) {
      console.error('Failed to load clinics details:', e);
      toast.error(isRTL ? `فشل تحميل العيادات: ${e?.message || e}` : `Failed to load clinics: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }, [token, isRTL]);

  const handleSaveBookingWindow = async (weeks: number) => {
    if (!token) return;
    setSavingSettings(true);
    try {
      await siteSettingsApi.updateMultiple([{ key: 'maxBookingWeeks', value: String(weeks) }], token);
      setMaxBookingWeeks(weeks);
      toast.success(isRTL ? 'تم حفظ حد الحجز بنجاح' : 'Booking limit saved successfully');
    } catch (err) {
      console.error('Failed to save booking window settings:', err);
      toast.error(isRTL ? 'فشل حفظ حد الحجز' : 'Failed to save booking limit');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => { loadClinics(); }, [loadClinics]);

  const clinic = clinics[activeTab];

  const fetchAvailableSlots = useCallback(async () => {
    if (!clinic || !selectedDate) return;
    setSlotsLoading(true);
    try {
      const slots = await clinicsApi.getAvailableSlots(clinic.id, selectedDate);
      setAvailableSlotsForDate(slots);
    } catch (e) {
      console.error('Failed to fetch available slots:', e);
    } finally {
      setSlotsLoading(false);
    }
  }, [clinic, selectedDate]);

  useEffect(() => { fetchAvailableSlots(); }, [fetchAvailableSlots]);

  const handleHoursChange = (clinicId: string, dayIndex: number, field: string, value: any) => {
    setWorkingHours(prev => ({
      ...prev,
      [clinicId]: prev[clinicId].map((d, i) => i === dayIndex ? { ...d, [field]: value } : d),
    }));
  };

  const saveWorkingHours = async () => {
    if (!clinic || !token) return;
    setSaving(true);
    try {
      await clinicsApi.setWorkingHours(clinic.id, workingHours[clinic.id], token);
      toast.success(isRTL ? 'تم حفظ مواعيد العمل الأسبوعية بنجاح' : 'Weekly working hours saved successfully');
      fetchAvailableSlots();
    } catch {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedSlot = async (slotTime: string | null, reason: string) => {
    if (!clinic || !token || !selectedDate || blockingInProgress) return;
    setBlockingInProgress(true);
    try {
      const payload = { date: selectedDate, timeSlot: slotTime || undefined, reason: reason || undefined };
      const slot = await clinicsApi.addBlockedSlot(clinic.id, payload, token);
      setBlockedSlots(prev => ({
        ...prev,
        [clinic.id]: [...(prev[clinic.id] || []), slot]
      }));
      toast.success(isRTL ? 'تم الحجب بنجاح' : 'Blocked successfully');
      setBlockingSlot(null);
      setBlockReasonText('');
      setIsBlockingWholeDay(false);
      fetchAvailableSlots();
    } catch {
      toast.error(isRTL ? 'فشل الحجب' : 'Failed to block slot');
    } finally {
      setBlockingInProgress(false);
    }
  };

  const removeBlockedSlot = async (slotId: string) => {
    if (!clinic || !token || unblockingInProgress) return;
    setUnblockingInProgress(true);
    try {
      await clinicsApi.removeBlockedSlot(clinic.id, slotId, token);
      setBlockedSlots(prev => ({
        ...prev,
        [clinic.id]: prev[clinic.id].filter(s => s.id !== slotId),
      }));
      toast.success(isRTL ? 'تم إلغاء الحجب بنجاح' : 'Slot unblocked successfully');
      setSelectedBlockedItem(null);
      fetchAvailableSlots();
    } catch {
      toast.error(isRTL ? 'فشل إلغاء الحجب' : 'Failed to unblock slot');
    } finally {
      setUnblockingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" size={22} />
        </div>
        <p className="text-[13px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'جاري تحميل العيادات ومواعيد العمل...' : 'Loading clinics and working schedules...'}</p>
      </div>
    );
  }

  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay();
  const workingDay = workingHours[clinic?.id]?.[dayOfWeek];
  const isDayActive = workingDay?.isActive;
  const allSlots = isDayActive ? generateSlots(workingDay.startTime, workingDay.endTime, workingDay.slotDuration) : [];

  const dayBlockedItem = blockedSlots[clinic?.id]?.find(b => {
    const bDate = new Date(b.date).toISOString().split('T')[0];
    return bDate === selectedDate && !b.timeSlot;
  });

  const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
            <Building2 className="text-indigo-500" size={22} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">
              {isRTL ? 'إدارة مواعيد العيادات' : 'Clinic Schedule Manager'}
            </h1>
            <p className="text-[12px] text-slate-500 dark:text-white/40 mt-0.5">
              {isRTL ? 'حجب وحجز المواعيد يدوياً وإعداد مواعيد العمل الأسبوعية' : 'Block & book offline slots, and configure weekly working hours'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Clinic Tabs */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 flex-wrap gap-1">
          {clinics.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => { setActiveTab(idx); setShowHoursConfig(false); }}
              className={cn(
                'flex-1 min-w-[140px] py-3 px-5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-2',
                activeTab === idx
                  ? c.id === 'clinic-online'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
              )}
            >
              {c.id === 'clinic-online' ? <Video size={15} /> : <Building2 size={15} />}
              {isRTL ? c.nameAr : c.nameEn}
            </button>
          ))}
        </div>
      </motion.div>

      {clinic && (
        <div className="space-y-6">
          {/* Clinic Details Card */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
            <div className="space-y-3">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                clinic.id === 'clinic-online'
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  : "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
              )}>
                {clinic.id === 'clinic-online' ? (isRTL ? 'افتراضية' : 'Virtual') : (isRTL ? 'موقع فعلي' : 'Physical Location')}
              </span>
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</h3>
              <div className="flex flex-wrap items-center gap-5 text-[12px] text-slate-500 dark:text-white/40">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-500 shrink-0" />
                  {isRTL ? clinic.addressAr : clinic.addressEn}
                </span>
                {clinic.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-indigo-500 shrink-0" />
                    <span dir="ltr">{clinic.phone}</span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (dayBlockedItem) {
                  removeBlockedSlot(dayBlockedItem.id);
                } else {
                  setIsBlockingWholeDay(true);
                  setBlockDayOptionType('vacation');
                  setBlockReasonText(isRTL ? 'إجازة طارئة للطبيب' : 'Emergency doctor vacation');
                }
              }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all border",
                dayBlockedItem
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                  : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
              )}
            >
              {dayBlockedItem ? <Unlock size={14} /> : <Lock size={14} />}
              {dayBlockedItem
                ? (isRTL ? 'إلغاء حجب اليوم بالكامل' : 'Unblock Full Day')
                : (isRTL ? 'حجب اليوم بالكامل' : 'Block Full Day')}
            </button>
          </motion.div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
            {/* COLUMN 1: Day Scheduler */}
            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="space-y-6">
              <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
                {/* Scheduler Header */}
                <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={18} className="text-indigo-500" />
                    <h4 className="font-bold text-[14px] text-slate-900 dark:text-white">{isRTL ? 'المواعيد اليومية وتخصيص الحجز' : 'Daily Schedule & Slots'}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[12px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'اختر اليوم:' : 'Select Date:'}</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Day Status / Slots Grid */}
                <div className="p-5">
                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-500" size={20} />
                      </div>
                      <span className="text-[12px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'جاري جلب حالة المواعيد...' : 'Fetching slot status...'}</span>
                    </div>
                  ) : dayBlockedItem ? (
                    <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto">
                        <Lock size={24} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-[15px] font-bold text-red-600 dark:text-red-400">{isRTL ? 'هذا اليوم محجوب بالكامل' : 'Day Fully Blocked'}</h4>
                        <p className="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">
                          {isRTL
                            ? `تم حجب هذا اليوم من الحجز تماماً لـ: "${dayBlockedItem.reason || 'موعد أو عطلة طارئة'}". لن يتمكن أي مريض من رؤية أو حجز أي مواعيد في هذا التاريخ.`
                            : `This entire day is blocked for: "${dayBlockedItem.reason || 'No reason provided'}". Patients cannot book any slots on this date.`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeBlockedSlot(dayBlockedItem.id)}
                        className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/25 transition-all"
                      >
                        {isRTL ? 'إلغاء حجب اليوم الآن' : 'Unblock This Day Now'}
                      </button>
                    </div>
                  ) : !isDayActive ? (
                    <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 flex items-center justify-center mx-auto">
                        <Calendar size={24} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-[15px] font-bold text-slate-700 dark:text-white/60">
                          {isRTL ? 'العطلة الأسبوعية للعيادة' : 'Clinic Day Off'}
                        </h4>
                        <p className="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">
                          {isRTL
                            ? 'هذا اليوم غير مفعل في إعدادات ساعات العمل الأسبوعية. لتفعيل الحجز في هذا اليوم، عدّل ساعات العمل.'
                            : 'This day is marked as inactive in weekly working hours. Modify settings to enable bookings.'}
                        </p>
                      </div>
                    </div>
                  ) : allSlots.length === 0 ? (
                    <div className="text-center py-16 text-[12px] text-slate-500 dark:text-white/40 font-bold">
                      {isRTL ? 'لم يتم توليد أي مواعيد. يرجى التحقق من إعدادات ساعات العمل.' : 'No slots generated. Please check weekly working hours settings.'}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-white/40 font-bold border-b border-slate-100 dark:border-white/5 pb-3">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {isRTL ? 'متاح للحجز' : 'Available'}</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> {isRTL ? 'محجوز بالعيادة' : 'Blocked Offline'}</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> {isRTL ? 'محجوز من الموقع' : 'Booked Online'}</span>
                      </div>
                      {/* Slots Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {allSlots.map(slot => {
                          const blockItem = blockedSlots[clinic.id]?.find(b => {
                            const bDate = new Date(b.date).toISOString().split('T')[0];
                            return bDate === selectedDate && b.timeSlot === slot;
                          });
                          const isAvailable = availableSlotsForDate.includes(slot);
                          let status: 'available' | 'blocked' | 'booked' = 'available';
                          if (isAvailable) status = 'available';
                          else if (blockItem) status = 'blocked';
                          else status = 'booked';

                          return (
                            <motion.button
                              key={slot}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                if (status === 'available') {
                                  setBlockingSlot(slot);
                                  setBlockOptionType('clinic');
                                  setBlockReasonText(isRTL ? 'محجوز بالعيادة' : 'Reserved by Clinic');
                                } else if (status === 'blocked' && blockItem) {
                                  setSelectedBlockedItem(blockItem);
                                }
                              }}
                              className={cn(
                                "p-3 rounded-xl text-center border transition-all duration-200 relative group overflow-hidden flex flex-col justify-center items-center h-[72px]",
                                status === 'available' && "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer",
                                status === 'blocked' && "border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 hover:bg-orange-100 dark:hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 cursor-pointer",
                                status === 'booked' && "border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 text-blue-500 dark:text-blue-400 cursor-not-allowed opacity-80"
                              )}
                            >
                              <span className="font-bold text-[13px] tracking-tight">{formatTime12Hour(slot, isRTL)}</span>
                              <span className="text-[9px] font-bold mt-1 opacity-70 truncate max-w-full px-1">
                                {status === 'available' && (isRTL ? 'متاح' : 'Open')}
                                {status === 'blocked' && (blockItem?.reason ? blockItem.reason : (isRTL ? 'محجوز' : 'Blocked'))}
                                {status === 'booked' && (isRTL ? 'محجوز (الموقع)' : 'Booked')}
                              </span>
                              <span className={cn(
                                "absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-200 scale-x-0 group-hover:scale-x-100",
                                status === 'available' && "bg-emerald-500",
                                status === 'blocked' && "bg-orange-500",
                                status === 'booked' && "bg-blue-500"
                              )} />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* COLUMN 2: Weekly Hours and Settings */}
            <div className="space-y-6">
              {/* Booking Window Setting */}
              <motion.div {...fadeUp} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Calendar size={18} className="text-indigo-500" />
                  <div>
                    <h4 className="font-bold text-[14px] text-slate-900 dark:text-white">{isRTL ? 'نطاق الحجز المتاح' : 'Available Booking Range'}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">
                      {isRTL ? 'أقصى مدة مستقبلية بالأسابيع للمرضى' : 'Max future range in weeks for patients'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'الحد الأقصى:' : 'Maximum:'}</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={maxBookingWeeks}
                      onChange={e => handleSaveBookingWindow(Number(e.target.value))}
                      disabled={savingSettings}
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                        <option key={w} value={w} className="bg-white dark:bg-[#111827]">
                          {isRTL
                            ? `${w} ${w === 1 ? 'أسبوع' : w === 2 ? 'أسبوعين' : 'أسابيع'}`
                            : `${w} ${w === 1 ? 'Week' : 'Weeks'}`}
                        </option>
                      ))}
                    </select>
                    {savingSettings && <Loader2 className="animate-spin text-indigo-500" size={18} />}
                  </div>
                </div>
              </motion.div>

              {/* Working Hours Card */}
              <motion.div {...fadeUp} transition={{ delay: 0.25 }}
                className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowHoursConfig(!showHoursConfig)}
                  className="w-full p-5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={18} className="text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-900 dark:text-white">{isRTL ? 'ساعات العمل الأسبوعية' : 'Weekly Working Hours'}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">{isRTL ? 'اضغط لتعديل مواعيد فتح العيادة' : 'Click to configure regular schedule'}</p>
                    </div>
                  </div>
                  {showHoursConfig ? <ChevronUp size={18} className="text-slate-400 dark:text-white/30" /> : <ChevronDown size={18} className="text-slate-400 dark:text-white/30" />}
                </button>

                <AnimatePresence initial={false}>
                  {showHoursConfig && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-100 dark:border-white/5 overflow-hidden"
                    >
                      <div className="p-5 space-y-5">
                        <div className="space-y-3">
                          {(workingHours[clinic.id] || []).map((day, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "p-4 rounded-xl border transition-all duration-200 flex flex-col gap-3",
                                day.isActive
                                  ? "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/10"
                                  : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.03] opacity-50"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[13px] text-slate-900 dark:text-white">{isRTL ? DAYS_AR[idx] : DAYS_EN[idx]}</span>
                                <button
                                  onClick={() => handleHoursChange(clinic.id, idx, 'isActive', !day.isActive)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200",
                                    day.isActive
                                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                                      : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20"
                                  )}
                                >
                                  {day.isActive ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                </button>
                              </div>
                              {day.isActive && (
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[11px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'البداية' : 'Start'}</label>
                                    <input
                                      type="time"
                                      value={day.startTime}
                                      onChange={e => handleHoursChange(clinic.id, idx, 'startTime', e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-900 dark:text-white [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                                    />
                                    <span className="text-[10px] text-indigo-500 block font-mono mt-0.5">{formatTime12Hour(day.startTime, isRTL)}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'النهاية' : 'End'}</label>
                                    <input
                                      type="time"
                                      value={day.endTime}
                                      onChange={e => handleHoursChange(clinic.id, idx, 'endTime', e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-900 dark:text-white [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                                    />
                                    <span className="text-[10px] text-indigo-500 block font-mono mt-0.5">{formatTime12Hour(day.endTime, isRTL)}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] text-slate-500 dark:text-white/40 font-bold">{isRTL ? 'المدة (د)' : 'Slot (m)'}</label>
                                    <select
                                      value={day.slotDuration}
                                      onChange={e => handleHoursChange(clinic.id, idx, 'slotDuration', +e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[12px] text-slate-900 dark:text-white focus:outline-none"
                                    >
                                      {[10, 15, 20, 30, 45, 60].map(d => <option key={d} value={d} className="bg-white dark:bg-[#111827]">{d}</option>)}
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={saveWorkingHours}
                          disabled={saving}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[12px] font-bold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          {isRTL ? 'حفظ مواعيد العمل الأسبوعية' : 'Save Weekly Working Hours'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Instructions */}
              <motion.div {...fadeUp} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] p-5 space-y-3 shadow-sm">
                <h5 className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle size={15} className="text-indigo-500" />
                  {isRTL ? 'تعليمات الاستخدام' : 'How It Works'}
                </h5>
                <ul className="text-[12px] text-slate-500 dark:text-white/40 space-y-2 list-disc list-inside leading-relaxed">
                  <li>{isRTL ? 'لحجب أو تسجيل حجز أوفلاين: اضغط على أي كرت أخضر متاح واكتب الملاحظة.' : 'To book or block a slot offline, click any green slot and add a note.'}</li>
                  <li>{isRTL ? 'لإلغاء الحجب وجعل الموعد متاحاً للمرضى: اضغط على الكارت البرتقالي واختر إلغاء الحجب.' : 'To unblock a slot, click the orange card and choose unblock.'}</li>
                  <li>{isRTL ? 'المواعيد الزرقاء محجوزة بالفعل من المرضى عبر الموقع ولا يمكن تعديلها يدوياً.' : 'Blue slots are booked by patients online and cannot be modified manually.'}</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Block / Book Offline Dialog */}
      <AnimatePresence>
        {blockingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setBlockingSlot(null)}
                className="absolute top-4 right-4 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <XCircle size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-500 dark:text-orange-400 flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">{isRTL ? 'حجز موعد أوفلاين' : 'Offline / In-Clinic Booking'}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">{isRTL ? 'حجب الموعد عن الموقع وتخصيصه بالعيادة' : 'Block online booking for this time slot'}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-2 text-[12px] text-slate-500 dark:text-white/40 font-bold">
                <div className="flex justify-between">
                  <span>{isRTL ? 'العيادة:' : 'Clinic:'}</span>
                  <span className="text-slate-900 dark:text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'التاريخ:' : 'Date:'}</span>
                  <span className="text-slate-900 dark:text-white">{new Date(selectedDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'الساعة:' : 'Time Slot:'}</span>
                  <span className="text-indigo-500 font-bold text-[13px]">{formatTime12Hour(blockingSlot, isRTL)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-slate-900 dark:text-white">{isRTL ? 'نوع الحجب / الحجز:' : 'Block/Booking Type:'}</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { type: 'clinic' as const, icon: Building2, titleAr: 'محجوز بالعيادة (أوفلاين)', titleEn: 'Reserved by Clinic', descAr: 'حجز موعد داخلي لعدم إتاحته على الموقع', descEn: 'Mark slot as booked physically in clinic', defaultReason: isRTL ? 'محجوز بالعيادة' : 'Reserved by Clinic' },
                    { type: 'busy' as const, icon: Clock, titleAr: 'الدكتور مش فاضي', titleEn: 'Doctor is Busy', descAr: 'الطبيب غير متفرغ في هذا الوقت', descEn: 'Doctor has other commitments at this time', defaultReason: isRTL ? 'الدكتور غير متفرغ' : 'Doctor is busy' },
                    { type: 'custom' as const, icon: UserPlus, titleAr: 'اسم مريض أو ملاحظة مخصصة', titleEn: 'Patient Name or Custom Note', descAr: 'اكتب اسم المريض أو ملاحظة معينة', descEn: 'Enter a specific patient name or note', defaultReason: '' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => { setBlockOptionType(opt.type); setBlockReasonText(opt.defaultReason); }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-start transition-all duration-200",
                        blockOptionType === opt.type
                          ? "border-orange-300 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        blockOptionType === opt.type ? "bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400" : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30"
                      )}>
                        <opt.icon size={15} />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold">{isRTL ? opt.titleAr : opt.titleEn}</div>
                        <div className="text-[10px] text-slate-500 dark:text-white/30 mt-0.5">{isRTL ? opt.descAr : opt.descEn}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {blockOptionType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 dark:text-white">{isRTL ? 'اسم المريض / الملاحظة:' : 'Patient Name / Note'}</label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'اكتب اسم المريض أو الملاحظة...' : 'Type note or patient name...'}
                    value={blockReasonText}
                    onChange={e => setBlockReasonText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    autoFocus
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => addBlockedSlot(blockingSlot, blockReasonText)}
                  disabled={blockingInProgress}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[12px] font-bold shadow-md shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {blockingInProgress && <Loader2 size={14} className="animate-spin" />}
                  {blockingInProgress
                    ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                    : (isRTL ? 'حفظ وحجب الموعد' : 'Confirm & Block Slot')}
                </button>
                <button
                  onClick={() => setBlockingSlot(null)}
                  disabled={blockingInProgress}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-bold text-slate-600 dark:text-white/60 transition-all disabled:opacity-50"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: View Blocked Slot / Unblock Dialog */}
      <AnimatePresence>
        {selectedBlockedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedBlockedItem(null)}
                className="absolute top-4 right-4 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <XCircle size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-500 dark:text-orange-400 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">{isRTL ? 'تفاصيل الموعد المحجوب' : 'Blocked Slot Details'}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">{isRTL ? 'تم حجب هذا الموعد يدوياً بالعيادة' : 'Manually blocked slot information'}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-2 text-[12px] text-slate-500 dark:text-white/40 font-bold">
                <div className="flex justify-between">
                  <span>{isRTL ? 'العيادة:' : 'Clinic:'}</span>
                  <span className="text-slate-900 dark:text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'التاريخ:' : 'Date:'}</span>
                  <span className="text-slate-900 dark:text-white">{new Date(selectedBlockedItem.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'الساعة:' : 'Time Slot:'}</span>
                  <span className="text-orange-500 dark:text-orange-400 font-bold text-[13px]">
                    {selectedBlockedItem.timeSlot ? formatTime12Hour(selectedBlockedItem.timeSlot, isRTL) : (isRTL ? 'يوم كامل' : 'Full Day')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-white/5 pt-2 mt-2">
                  <span>{isRTL ? 'الملاحظة:' : 'Note:'}</span>
                  <span className="text-slate-900 dark:text-white text-[13px] mt-0.5 leading-relaxed">{selectedBlockedItem.reason || (isRTL ? 'لا توجد ملاحظة' : 'No note provided')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => removeBlockedSlot(selectedBlockedItem.id)}
                  disabled={unblockingInProgress}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[12px] font-bold shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {unblockingInProgress ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                  {unblockingInProgress
                    ? (isRTL ? 'جاري إلغاء الحجب...' : 'Unblocking...')
                    : (isRTL ? 'إلغاء الحجب وجعله متاحاً' : 'Unblock & Make Available')}
                </button>
                <button
                  onClick={() => setSelectedBlockedItem(null)}
                  disabled={unblockingInProgress}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-bold text-slate-600 dark:text-white/60 transition-all disabled:opacity-50"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Block Entire Day Reason Dialog */}
      <AnimatePresence>
        {isBlockingWholeDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setIsBlockingWholeDay(false)}
                className="absolute top-4 right-4 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <XCircle size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">{isRTL ? 'حجب اليوم بالكامل' : 'Block Entire Day'}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">{isRTL ? 'إلغاء تفعيل كافة المواعيد لهذا التاريخ' : 'Disable booking for this whole date'}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-2 text-[12px] text-slate-500 dark:text-white/40 font-bold">
                <div className="flex justify-between">
                  <span>{isRTL ? 'العيادة:' : 'Clinic:'}</span>
                  <span className="text-slate-900 dark:text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'التاريخ المطلوب حجبه:' : 'Target Date:'}</span>
                  <span className="text-red-500 dark:text-red-400 font-bold text-[13px]">
                    {new Date(selectedDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-slate-900 dark:text-white">{isRTL ? 'سبب حجب اليوم:' : 'Reason for Day Block:'}</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { type: 'vacation' as const, icon: ShieldAlert, titleAr: 'إجازة طارئة للطبيب', titleEn: 'Doctor Emergency Vacation', descAr: 'حجب اليوم لعدم تواجد الطبيب', descEn: 'Block the day due to doctor emergency', defaultReason: isRTL ? 'إجازة طارئة للطبيب' : 'Emergency doctor vacation' },
                    { type: 'closed' as const, icon: Building2, titleAr: 'العيادة مغلقة', titleEn: 'Clinic is Closed', descAr: 'العيادة ستكون مغلقة بالكامل', descEn: 'Clinic will be fully closed on this date', defaultReason: isRTL ? 'العيادة مغلقة' : 'Clinic is closed' },
                    { type: 'custom' as const, icon: UserPlus, titleAr: 'سبب مخصص', titleEn: 'Custom Reason', descAr: 'كتابة سبب مخصص لحجب اليوم', descEn: 'Enter a specific custom reason', defaultReason: '' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => { setBlockDayOptionType(opt.type); setBlockReasonText(opt.defaultReason); }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-start transition-all duration-200",
                        blockDayOptionType === opt.type
                          ? "border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        blockDayOptionType === opt.type ? "bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400" : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30"
                      )}>
                        <opt.icon size={15} />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold">{isRTL ? opt.titleAr : opt.titleEn}</div>
                        <div className="text-[10px] text-slate-500 dark:text-white/30 mt-0.5">{isRTL ? opt.descAr : opt.descEn}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {blockDayOptionType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 dark:text-white">{isRTL ? 'سبب الحجب المخصص:' : 'Custom Reason for Blocking'}</label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'اكتب سبب الحجب هنا...' : 'Type custom reason for blocking day...'}
                    value={blockReasonText}
                    onChange={e => setBlockReasonText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    autoFocus
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => addBlockedSlot(null, blockReasonText)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[12px] font-bold shadow-md shadow-red-500/25 transition-all"
                >
                  {isRTL ? 'حجب اليوم بالكامل الآن' : 'Confirm Block Day'}
                </button>
                <button
                  onClick={() => setIsBlockingWholeDay(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-bold text-slate-600 dark:text-white/60 transition-all"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
