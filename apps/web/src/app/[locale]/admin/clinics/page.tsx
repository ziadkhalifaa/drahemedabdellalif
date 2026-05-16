'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { clinicsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Clock, Save, Plus, Trash2, Phone,
  MapPin, CheckCircle, XCircle, Loader2, Calendar, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const [newBlock, setNewBlock] = useState<{ date: string; timeSlot: string; reason: string }>({ date: '', timeSlot: '', reason: '' });

  const loadClinics = useCallback(async () => {
    try {
      const data = await clinicsApi.getAll(token);
      setClinics(data);
      // load working hours and blocked slots for each clinic
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
    } catch (e) {
      toast.error('فشل تحميل العيادات');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadClinics(); }, [loadClinics]);

  const clinic = clinics[activeTab];

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
      toast.success('تم حفظ مواعيد العمل ✅');
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedSlot = async () => {
    if (!clinic || !token || !newBlock.date) return;
    try {
      const slot = await clinicsApi.addBlockedSlot(clinic.id, newBlock, token);
      setBlockedSlots(prev => ({ ...prev, [clinic.id]: [...(prev[clinic.id] || []), slot] }));
      setNewBlock({ date: '', timeSlot: '', reason: '' });
      toast.success('تم حجب الوقت ✅');
    } catch {
      toast.error('فشل الحجب');
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
      toast.success('تم إلغاء الحجب');
    } catch {
      toast.error('فشل إلغاء الحجب');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Building2 className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            {isRTL ? 'إدارة العيادات' : 'Clinic Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'ساعات العمل والأوقات المحجوبة' : 'Working hours and blocked slots'}
          </p>
        </div>
      </div>

      {/* Clinic Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
        {clinics.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setActiveTab(idx)}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all',
              activeTab === idx
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            {isRTL ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>

      {clinic && (
        <AnimatePresence mode="wait">
          <motion.div
            key={clinic.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Clinic Info Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <h3 className="text-white font-bold text-lg">{isRTL ? clinic.nameAr : clinic.nameEn}</h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="mt-0.5 text-primary shrink-0" />
                <span>{isRTL ? clinic.addressAr : clinic.addressEn}</span>
              </div>
              {clinic.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={14} className="text-primary" />
                  <span dir="ltr">{clinic.phone}</span>
                </div>
              )}
            </div>

            {/* Working Hours Grid */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <h4 className="font-bold text-foreground">{isRTL ? 'ساعات العمل' : 'Working Hours'}</h4>
                </div>
                <button
                  onClick={saveWorkingHours}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isRTL ? 'حفظ' : 'Save'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-start">{isRTL ? 'اليوم' : 'Day'}</th>
                      <th className="px-4 py-3 text-start">{isRTL ? 'البداية' : 'Start'}</th>
                      <th className="px-4 py-3 text-start">{isRTL ? 'النهاية' : 'End'}</th>
                      <th className="px-4 py-3 text-start">{isRTL ? 'مدة السلوت (د)' : 'Slot (min)'}</th>
                      <th className="px-4 py-3 text-center">{isRTL ? 'مفعّل' : 'Active'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(workingHours[clinic.id] || []).map((day, idx) => (
                      <tr key={idx} className={cn('transition-colors', day.isActive ? 'bg-white/3' : 'opacity-50')}>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {isRTL ? DAYS_AR[idx] : DAYS_EN[idx]}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={e => handleHoursChange(clinic.id, idx, 'startTime', e.target.value)}
                            disabled={!day.isActive}
                            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-foreground text-xs disabled:opacity-30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={e => handleHoursChange(clinic.id, idx, 'endTime', e.target.value)}
                            disabled={!day.isActive}
                            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-foreground text-xs disabled:opacity-30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={day.slotDuration}
                            onChange={e => handleHoursChange(clinic.id, idx, 'slotDuration', +e.target.value)}
                            disabled={!day.isActive}
                            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-foreground text-xs disabled:opacity-30"
                          >
                            {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleHoursChange(clinic.id, idx, 'isActive', !day.isActive)}
                            className={cn('w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors', day.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30')}
                          >
                            {day.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blocked Slots */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-400" />
                <h4 className="font-bold text-foreground">{isRTL ? 'الأوقات المحجوبة' : 'Blocked Slots'}</h4>
              </div>
              <div className="p-5 space-y-4">
                {/* Add new block */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="date"
                    value={newBlock.date}
                    onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))}
                    className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-foreground text-sm col-span-1"
                  />
                  <input
                    type="time"
                    value={newBlock.timeSlot}
                    onChange={e => setNewBlock(p => ({ ...p, timeSlot: e.target.value }))}
                    placeholder={isRTL ? 'الوقت (اتركه فارغاً لحجب اليوم)' : 'Time (empty = full day)'}
                    className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-foreground text-sm col-span-1"
                  />
                  <input
                    value={newBlock.reason}
                    onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))}
                    placeholder={isRTL ? 'السبب (اختياري)' : 'Reason (optional)'}
                    className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-foreground text-sm col-span-1"
                  />
                  <button
                    onClick={addBlockedSlot}
                    className="flex items-center justify-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl px-4 py-2 text-sm font-bold hover:bg-orange-500/30 transition-colors"
                  >
                    <Plus size={14} />
                    {isRTL ? 'حجب' : 'Block'}
                  </button>
                </div>

                {/* Existing blocked slots */}
                <div className="space-y-2">
                  {(blockedSlots[clinic.id] || []).length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      {isRTL ? 'لا توجد أوقات محجوبة' : 'No blocked slots'}
                    </p>
                  ) : (
                    (blockedSlots[clinic.id] || []).map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar size={14} className="text-orange-400" />
                          <span className="text-foreground font-medium">
                            {new Date(slot.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB')}
                          </span>
                          {slot.timeSlot
                            ? <span className="text-muted-foreground">@ {slot.timeSlot}</span>
                            : <span className="text-orange-400 text-xs font-bold">{isRTL ? 'يوم كامل' : 'Full Day'}</span>
                          }
                          {slot.reason && <span className="text-muted-foreground">— {slot.reason}</span>}
                        </div>
                        <button
                          onClick={() => removeBlockedSlot(slot.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
