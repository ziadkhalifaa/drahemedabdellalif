'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { clinicsApi } from '@/lib/api';
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
  
  // Data States
  const [clinics, setClinics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [workingHours, setWorkingHours] = useState<Record<string, any[]>>({});
  const [blockedSlots, setBlockedSlots] = useState<Record<string, any[]>>({});
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // UI Control States
  const [showHoursConfig, setShowHoursConfig] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Current local date in YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  });
  const [availableSlotsForDate, setAvailableSlotsForDate] = useState<string[]>([]);
  
  // Modals / Input States
  const [blockingSlot, setBlockingSlot] = useState<string | null>(null);
  const [blockReasonText, setBlockReasonText] = useState('');
  const [blockOptionType, setBlockOptionType] = useState<'clinic' | 'busy' | 'custom'>('clinic');
  const [blockDayOptionType, setBlockDayOptionType] = useState<'vacation' | 'closed' | 'custom'>('vacation');
  const [selectedBlockedItem, setSelectedBlockedItem] = useState<any | null>(null);
  const [isBlockingWholeDay, setIsBlockingWholeDay] = useState(false);

  const loadClinics = useCallback(async () => {
    try {
      const data = await clinicsApi.getAll(token);
      setClinics(data);
      
      const wh: Record<string, any[]> = {};
      const bs: Record<string, any[]> = {};
      
      await Promise.all(data.map(async (c: any) => {
        const [hours, blocked] = await Promise.all([
          clinicsApi.getWorkingHours(c.id, token),
          clinicsApi.getBlockedSlots(c.id, token),
        ]);
        
        // Build 7-day array
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

  useEffect(() => { loadClinics(); }, [loadClinics]);

  const clinic = clinics[activeTab];

  // Fetch available slots for the selected date whenever date or active clinic changes
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

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

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
      toast.success(isRTL ? 'تم حفظ مواعيد العمل الأسبوعية بنجاح ✅' : 'Weekly working hours saved successfully ✅');
      fetchAvailableSlots();
    } catch {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedSlot = async (slotTime: string | null, reason: string) => {
    if (!clinic || !token || !selectedDate) return;
    try {
      const payload = {
        date: selectedDate,
        timeSlot: slotTime || undefined,
        reason: reason || undefined
      };
      const slot = await clinicsApi.addBlockedSlot(clinic.id, payload, token);
      
      // Update local state
      setBlockedSlots(prev => ({
        ...prev,
        [clinic.id]: [...(prev[clinic.id] || []), slot]
      }));
      
      toast.success(isRTL ? 'تم الحجب بنجاح ✅' : 'Blocked successfully ✅');
      setBlockingSlot(null);
      setBlockReasonText('');
      setIsBlockingWholeDay(false);
      fetchAvailableSlots();
    } catch {
      toast.error(isRTL ? 'فشل الحجب' : 'Failed to block slot');
    }
  };

  const removeBlockedSlot = async (slotId: string) => {
    if (!clinic || !token) return;
    try {
      await clinicsApi.removeBlockedSlot(clinic.id, slotId, token);
      
      setBlockedSlots(prev => ({
        ...prev,
        [clinic.id]: prev[clinic.id].filter(s => s.id !== slotId),
      }));
      
      toast.success(isRTL ? 'تم إلغاء الحجب الموعد بنجاح' : 'Slot unblocked successfully');
      setSelectedBlockedItem(null);
      fetchAvailableSlots();
    } catch {
      toast.error(isRTL ? 'فشل إلغاء الحجب' : 'Failed to unblock slot');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm text-muted-foreground font-bold">{isRTL ? 'جاري تحميل العيادات ومواعيد العمل...' : 'Loading clinics and working schedules...'}</p>
      </div>
    );
  }

  // Calculate parameters for active day
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay();
  const workingDay = workingHours[clinic?.id]?.[dayOfWeek];
  const isDayActive = workingDay?.isActive;
  
  // Generate all generated slots
  const allSlots = isDayActive ? generateSlots(workingDay.startTime, workingDay.endTime, workingDay.slotDuration) : [];

  // Find if entire day is blocked
  const dayBlockedItem = blockedSlots[clinic?.id]?.find(b => {
    const bDate = new Date(b.date).toISOString().split('T')[0];
    return bDate === selectedDate && !b.timeSlot;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 text-white relative">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/10 border border-primary/20 flex items-center justify-center shadow-lg">
            <Building2 className="text-primary-light" size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isRTL ? 'إدارة مواعيد العيادات' : 'Clinic Schedule Manager'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL ? 'حجب وحجز المواعيد يدوياً للعيادة، وإعداد مواعيد العمل الأسبوعية.' : 'Block & book offline slots, and configure weekly working hours.'}
            </p>
          </div>
        </div>
      </div>

      {/* Clinic Tabs */}
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 flex-wrap gap-1 shadow-inner">
        {clinics.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveTab(idx);
              setShowHoursConfig(false);
            }}
            className={cn(
              'flex-1 min-w-[140px] py-4 px-5 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-3',
              activeTab === idx
                ? c.id === 'clinic-online' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            )}
          >
            {c.id === 'clinic-online' ? <Video size={16} /> : <Building2 size={16} />}
            {isRTL ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>

      {clinic && (
        <div className="space-y-8">
          
          {/* Clinic Details Card */}
          <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-3">
              <span className={cn(
                "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border",
                clinic.id === 'clinic-online' ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-primary-light bg-primary/10 border-primary/20"
              )}>
                {clinic.id === 'clinic-online' ? (isRTL ? 'افتراضية' : 'Virtual') : (isRTL ? 'موقع فعلي' : 'Physical Location')}
              </span>
              <h3 className="text-xl font-black text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</h3>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary-light shrink-0" />
                  {isRTL ? clinic.addressAr : clinic.addressEn}
                </span>
                {clinic.phone && (
                  <span className="flex items-center gap-2">
                    <Phone size={16} className="text-primary-light shrink-0" />
                    <span dir="ltr">{clinic.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
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
                  "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all border duration-300",
                  dayBlockedItem 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                    : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                )}
              >
                {dayBlockedItem ? <Unlock size={14} /> : <Lock size={14} />}
                {dayBlockedItem 
                  ? (isRTL ? 'إلغاء حجب اليوم بالكامل' : 'Unblock Full Day') 
                  : (isRTL ? 'حجب اليوم بالكامل' : 'Block Full Day')}
              </button>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            
            {/* COLUMN 1: Day Scheduler */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-xl">
                
                {/* Header of Scheduler */}
                <div className="p-6 border-b border-white/10 bg-white/3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary-light" size={20} />
                    <h4 className="font-black text-white">{isRTL ? 'المواعيد اليومية وتخصيص الحجز' : 'Daily Schedule & Slots'}</h4>
                  </div>
                  
                  {/* Date Input Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground font-bold">{isRTL ? 'اختر اليوم:' : 'Select Date:'}</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-white text-sm font-bold focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Day status / Slots Grid */}
                <div className="p-6">
                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <span className="text-xs font-bold">{isRTL ? 'جاري جلب حالة المواعيد لليوم المحدد...' : 'Fetching slot status...'}</span>
                    </div>
                  ) : dayBlockedItem ? (
                    // Day Blocked Alert
                    <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
                        <Lock size={28} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-red-400">{isRTL ? 'هذا اليوم محجوب بالكامل' : 'Day Fully Blocked'}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {isRTL 
                            ? `تم حجب هذا اليوم من الحجز تماماً لـ: "${dayBlockedItem.reason || 'موعد أو عطلة طارئة'}". لن يتمكن أي مريض من رؤية أو حجز أي مواعيد في هذا التاريخ.` 
                            : `This entire day is blocked for: "${dayBlockedItem.reason || 'No reason provided'}". Patients cannot book any slots on this date.`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeBlockedSlot(dayBlockedItem.id)}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        {isRTL ? 'إلغاء حجب اليوم الآن' : 'Unblock This Day Now'}
                      </button>
                    </div>
                  ) : !isDayActive ? (
                    // Day Off Alert
                    <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white/50 flex items-center justify-center mx-auto shadow-md">
                        <Calendar size={28} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-white/70">
                          {isRTL ? 'العطلة الأسبوعية للعيادة' : 'Clinic Day Off'}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isRTL 
                            ? 'هذا اليوم غير مفعل في إعدادات ساعات العمل الأسبوعية للعيادة. إذا أردت فتح الحجز في هذا اليوم، يرجى تعديل ساعات العمل الأسبوعية على اليسار.' 
                            : 'This day of the week is marked as inactive in weekly working hours. To enable bookings on this day, modify settings on the right.'}
                        </p>
                      </div>
                    </div>
                  ) : allSlots.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground text-xs font-bold">
                      {isRTL ? 'لم يتم توليد أي مواعيد. يرجى التحقق من إعدادات ساعات العمل.' : 'No slots generated. Please check weekly working hours duration settings.'}
                    </div>
                  ) : (
                    // Slots List View
                    <div className="space-y-6">
                      
                      {/* Explanatory Legend */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground border-b border-white/5 pb-4">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> {isRTL ? 'متاح للحجز (أونلاين/أوفلاين)' : 'Available for booking'}</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> {isRTL ? 'محجوز بالعيادة (أوفلاين)' : 'Blocked / Booked Offline'}</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> {isRTL ? 'محجوز من الموقع (أونلاين)' : 'Booked via Website'}</span>
                      </div>

                      {/* Slots Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {allSlots.map(slot => {
                          // Find if this slot is manually blocked
                          const blockItem = blockedSlots[clinic.id]?.find(b => {
                            const bDate = new Date(b.date).toISOString().split('T')[0];
                            return bDate === selectedDate && b.timeSlot === slot;
                          });

                          const isAvailable = availableSlotsForDate.includes(slot);
                          
                          let status: 'available' | 'blocked' | 'booked' = 'available';
                          if (isAvailable) {
                            status = 'available';
                          } else if (blockItem) {
                            status = 'blocked';
                          } else {
                            status = 'booked';
                          }

                          return (
                            <button
                              key={slot}
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
                                "p-3 rounded-2xl text-center border transition-all duration-300 relative group overflow-hidden flex flex-col justify-center items-center h-20",
                                status === 'available' && "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-emerald-400 cursor-pointer",
                                status === 'blocked' && "border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 text-orange-400 cursor-pointer",
                                status === 'booked' && "border-blue-500/20 bg-blue-500/5 text-blue-400 cursor-not-allowed opacity-90"
                              )}
                            >
                              {/* Time Display */}
                              <span className="font-black text-sm tracking-tight">{formatTime12Hour(slot, isRTL)}</span>
                              
                              {/* Small note / Subtitle */}
                              <span className="text-[9px] font-bold mt-1 text-opacity-80 truncate max-w-full px-1">
                                {status === 'available' && (isRTL ? 'متاح للحجز' : 'Available')}
                                {status === 'blocked' && (blockItem?.reason ? blockItem.reason : (isRTL ? 'محجوز بالعيادة' : 'Blocked'))}
                                {status === 'booked' && (isRTL ? 'محجوز (الموقع)' : 'Booked Online')}
                              </span>

                              {/* Hover border effect */}
                              <span className={cn(
                                "absolute bottom-0 left-0 right-0 h-1 transition-transform duration-300 scale-x-0 group-hover:scale-x-100",
                                status === 'available' && "bg-emerald-500",
                                status === 'blocked' && "bg-orange-500",
                                status === 'booked' && "bg-blue-500"
                              )} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Weekly Hours and Settings */}
            <div className="space-y-6">
              
              {/* Working Hours Card */}
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-xl">
                
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => setShowHoursConfig(!showHoursConfig)}
                  className="w-full p-6 bg-white/3 flex items-center justify-between text-start focus:outline-none hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary-light" size={20} />
                    <div>
                      <h4 className="font-black text-white">{isRTL ? 'ساعات العمل الأسبوعية' : 'Weekly Working Hours'}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'اضغط لتعديل ساعات فتح العيادة المعتادة' : 'Click to configure regular schedule'}</p>
                    </div>
                  </div>
                  {showHoursConfig ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                </button>

                <AnimatePresence initial={false}>
                  {showHoursConfig && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-6">
                        
                        {/* Working hours fields list */}
                        <div className="space-y-4">
                          {(workingHours[clinic.id] || []).map((day, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3",
                                day.isActive 
                                  ? "bg-white/5 border-white/10" 
                                  : "bg-black/10 border-white/5 opacity-50"
                              )}
                            >
                              {/* Day Name and Active status */}
                              <div className="flex items-center justify-between">
                                <span className="font-black text-sm">{isRTL ? DAYS_AR[idx] : DAYS_EN[idx]}</span>
                                <button
                                  onClick={() => handleHoursChange(clinic.id, idx, 'isActive', !day.isActive)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300",
                                    day.isActive 
                                      ? "bg-emerald-500/20 text-emerald-400" 
                                      : "bg-white/10 text-white/30"
                                  )}
                                >
                                  {day.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                </button>
                              </div>

                              {/* Time Configuration Inputs */}
                              {day.isActive && (
                                <div className="grid grid-cols-3 gap-2">
                                  {/* Start */}
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground font-bold">{isRTL ? 'البداية' : 'Start'}</label>
                                    <input
                                      type="time"
                                      value={day.startTime}
                                      onChange={e => handleHoursChange(clinic.id, idx, 'startTime', e.target.value)}
                                      className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white [color-scheme:dark]"
                                    />
                                    <span className="text-[8px] text-primary-light block font-mono mt-0.5">{formatTime12Hour(day.startTime, isRTL)}</span>
                                  </div>
                                  
                                  {/* End */}
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground font-bold">{isRTL ? 'النهاية' : 'End'}</label>
                                    <input
                                      type="time"
                                      value={day.endTime}
                                      onChange={e => handleHoursChange(clinic.id, idx, 'endTime', e.target.value)}
                                      className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white [color-scheme:dark]"
                                    />
                                    <span className="text-[8px] text-primary-light block font-mono mt-0.5">{formatTime12Hour(day.endTime, isRTL)}</span>
                                  </div>

                                  {/* Duration */}
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground font-bold">{isRTL ? 'المدة (د)' : 'Slot (m)'}</label>
                                    <select
                                      value={day.slotDuration}
                                      onChange={e => handleHoursChange(clinic.id, idx, 'slotDuration', +e.target.value)}
                                      className="w-full bg-[#0d1527] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                                    >
                                      {[10, 15, 20, 30, 45, 60].map(d => <option key={d} value={d} className="bg-[#0b1329]">{d}</option>)}
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={saveWorkingHours}
                          disabled={saving}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          {isRTL ? 'حفظ مواعيد العمل الأسبوعية' : 'Save Weekly Working Hours'}
                        </button>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Instructions and tips */}
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4 shadow-xl">
                <h5 className="font-black text-sm flex items-center gap-2">
                  <HelpCircle size={16} className="text-primary-light" />
                  {isRTL ? 'تعليمات الاستخدام للعيادة' : 'Instructional Tips'}
                </h5>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
                  <li>{isRTL ? 'لحجب موعد أو تسجيل حجز تم بالعيادة أوفلاين: اضغط على أي كرت أخضر متاح واكتب الملاحظة.' : 'To book offline or block a slot, click any green slot and input a note.'}</li>
                  <li>{isRTL ? 'لإلغاء الحجب وجعل الموعد متاحاً مجدداً للمرضى على الموقع: اضغط على الكارت البرتقالي واختر إلغاء الحجب.' : 'To make a blocked slot available again for online patients, click the orange slot and click Unblock.'}</li>
                  <li>{isRTL ? 'المواعيد الزرقاء محجوزة بالفعل من قبل المرضى عبر الموقع ولا يمكن حجبها أو حجزها يدوياً.' : 'Blue slots are already booked by patients online and cannot be manually modified here.'}</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: Block / Book Offline Dialog */}
      <AnimatePresence>
        {blockingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a1124] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setBlockingSlot(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
              
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base">{isRTL ? 'حجز موعد أوفلاين في العيادة' : 'Offline / In-Clinic Booking'}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'حجب الموعد عن الموقع وتخصيصه بالعيادة' : 'Block online booking for this time slot'}</p>
                </div>
              </div>

              {/* Slot details */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>{isRTL ? 'العيادة:' : 'Clinic:'}</span>
                  <span className="text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'التاريخ:' : 'Date:'}</span>
                  <span className="text-white">{new Date(selectedDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'الساعة:' : 'Time Slot:'}</span>
                  <span className="text-primary-light font-black text-sm">{formatTime12Hour(blockingSlot, isRTL)}</span>
                </div>
              </div>

              {/* Preset Options */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-white">{isRTL ? 'نوع الحجب / الحجز:' : 'Block/Booking Type:'}</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBlockOptionType('clinic');
                      setBlockReasonText(isRTL ? 'محجوز بالعيادة' : 'Reserved by Clinic');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-300",
                      blockOptionType === 'clinic'
                        ? "border-orange-500 bg-orange-500/10 text-white"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      blockOptionType === 'clinic' ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-white/50"
                    )}>
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black">{isRTL ? 'محجوز بالعيادة (أوفلاين)' : 'Reserved by Clinic'}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{isRTL ? 'حجز موعد داخلي لعدم إتاحته على الموقع' : 'Mark slot as booked physically in clinic'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBlockOptionType('busy');
                      setBlockReasonText(isRTL ? 'الدكتور غير متفرغ' : 'Doctor is busy');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-300",
                      blockOptionType === 'busy'
                        ? "border-orange-500 bg-orange-500/10 text-white"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      blockOptionType === 'busy' ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-white/50"
                    )}>
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black">{isRTL ? 'الدكتور مش فاضي' : 'Doctor is Busy'}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{isRTL ? 'الطبيب غير متفرغ في هذا الوقت لعطلة أو موعد آخر' : 'Doctor has other commitments at this time'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBlockOptionType('custom');
                      setBlockReasonText('');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-300",
                      blockOptionType === 'custom'
                        ? "border-orange-500 bg-orange-500/10 text-white"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      blockOptionType === 'custom' ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-white/50"
                    )}>
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black">{isRTL ? 'اسم مريض أو ملاحظة مخصصة' : 'Patient Name or Custom Note'}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{isRTL ? 'اكتب اسم المريض أو ملاحظة معينة يدوياً' : 'Enter a specific patient name or note'}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Note / Patient Input */}
              {blockOptionType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-white">{isRTL ? 'اسم المريض / الملاحظة:' : 'Patient Name / Note'}</label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'اكتب اسم المريض أو الملاحظة المخصصة...' : 'Type note or patient name...'}
                    value={blockReasonText}
                    onChange={e => setBlockReasonText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
                    autoFocus
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => addBlockedSlot(blockingSlot, blockReasonText)}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 transition-all"
                >
                  {isRTL ? 'حفظ وحجب الموعد الآن' : 'Confirm & Block Slot'}
                </button>
                <button
                  onClick={() => setBlockingSlot(null)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white transition-all"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a1124] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedBlockedItem(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
              
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base">{isRTL ? 'تفاصيل الموعد المحجوب' : 'Blocked Slot Details'}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'تم حجب هذا الموعد يدوياً بالعيادة' : 'Manually blocked slot information'}</p>
                </div>
              </div>

              {/* Slot details */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>{isRTL ? 'العيادة:' : 'Clinic:'}</span>
                  <span className="text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'التاريخ:' : 'Date:'}</span>
                  <span className="text-white">{new Date(selectedBlockedItem.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'الساعة:' : 'Time Slot:'}</span>
                  <span className="text-orange-400 font-black text-sm">
                    {selectedBlockedItem.timeSlot ? formatTime12Hour(selectedBlockedItem.timeSlot, isRTL) : (isRTL ? 'يوم كامل' : 'Full Day')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-2">
                  <span>{isRTL ? 'اسم المريض / الملاحظة:' : 'Note / Reason:'}</span>
                  <span className="text-white text-sm mt-0.5 leading-relaxed">{selectedBlockedItem.reason || (isRTL ? 'لا توجد ملاحظة' : 'No note provided')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => removeBlockedSlot(selectedBlockedItem.id)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Unlock size={14} />
                  {isRTL ? 'إلغاء الحجب وجعله متاحاً للمرضى' : 'Unblock & Make Slot Available'}
                </button>
                <button
                  onClick={() => setSelectedBlockedItem(null)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white transition-all"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a1124] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsBlockingWholeDay(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
              
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base">{isRTL ? 'حجب اليوم بالكامل' : 'Block Entire Day'}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'إلغاء تفعيل كافة المواعيد لهذا التاريخ تماماً' : 'Disable booking for this whole date'}</p>
                </div>
              </div>

              {/* Day details */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>{isRTL ? 'العيادة:' : 'Clinic:'}</span>
                  <span className="text-white">{isRTL ? clinic.nameAr : clinic.nameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'التاريخ المطلوب حجبه:' : 'Target Date:'}</span>
                  <span className="text-red-400 font-black text-sm">
                    {new Date(selectedDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Preset Options for Day Block */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-white">{isRTL ? 'سبب حجب اليوم بالكامل:' : 'Reason for Day Block:'}</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBlockDayOptionType('vacation');
                      setBlockReasonText(isRTL ? 'إجازة طارئة للطبيب' : 'Emergency doctor vacation');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-300",
                      blockDayOptionType === 'vacation'
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      blockDayOptionType === 'vacation' ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"
                    )}>
                      <ShieldAlert size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black">{isRTL ? 'إجازة طارئة للطبيب' : 'Doctor Emergency Vacation'}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{isRTL ? 'حجب اليوم لعدم تواجد الطبيب لظروف طارئة' : 'Block the day due to doctor emergency'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBlockDayOptionType('closed');
                      setBlockReasonText(isRTL ? 'العيادة مغلقة' : 'Clinic is closed');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-300",
                      blockDayOptionType === 'closed'
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      blockDayOptionType === 'closed' ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"
                    )}>
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black">{isRTL ? 'العيادة مغلقة' : 'Clinic is Closed'}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{isRTL ? 'العيادة ستكون مغلقة بالكامل في هذا التاريخ' : 'Clinic will be fully closed on this date'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBlockDayOptionType('custom');
                      setBlockReasonText('');
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-start transition-all duration-300",
                      blockDayOptionType === 'custom'
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      blockDayOptionType === 'custom' ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"
                    )}>
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black">{isRTL ? 'سبب مخصص' : 'Custom Reason'}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{isRTL ? 'كتابة سبب مخصص لحجب اليوم' : 'Enter a specific custom reason'}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Note / Block Reason */}
              {blockDayOptionType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-white">{isRTL ? 'سبب الحجب المخصص:' : 'Custom Reason for Blocking'}</label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'اكتب سبب الحجب المخصص هنا...' : 'Type custom reason for blocking day...'}
                    value={blockReasonText}
                    onChange={e => setBlockReasonText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
                    autoFocus
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => addBlockedSlot(null, blockReasonText)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-500/20 transition-all"
                >
                  {isRTL ? 'حجب اليوم بالكامل الآن' : 'Confirm Block Day'}
                </button>
                <button
                  onClick={() => setIsBlockingWholeDay(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white transition-all"
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
