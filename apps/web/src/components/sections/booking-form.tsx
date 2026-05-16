'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Input, Textarea, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { Calendar, CheckCircle2, AlertCircle, Clock, Phone, Mail, User, FileText } from 'lucide-react';
import { TIME_SLOTS } from '@dr-ahmed/shared';
import { cn } from '@/lib/utils';

export function BookingForm() {
  const t = useTranslations('booking.form');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    date: '',
    timeSlot: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'conflict'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/appointments', form);
      setStatus('success');
      setForm({ patientName: '', patientPhone: '', patientEmail: '', date: '', timeSlot: '', notes: '' });
    } catch (err: any) {
      if (err.message?.includes('already booked')) setStatus('conflict');
      else setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl rounded-3xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-12 shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-black text-green-700 dark:text-green-400 mb-3">
          {isAr ? 'تم الحجز بنجاح!' : 'Booking Successful!'}
        </h3>
        <p className="text-green-600 dark:text-green-500 leading-relaxed">
          {isAr
            ? 'سيتم التواصل معك قريباً لتأكيد الموعد. شكراً لثقتك بنا.'
            : 'We will contact you soon to confirm the appointment. Thank you for your trust.'}
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-8 text-sm text-green-700 dark:text-green-400 font-bold underline"
        >
          {isAr ? 'حجز موعد آخر' : 'Book another appointment'}
        </button>
      </motion.div>
    );
  }

  const inputIcon = (icon: React.ReactNode) => (
    <div className="absolute top-1/2 -translate-y-1/2 ltr:left-4 rtl:right-4 text-[var(--muted)]">
      {icon}
    </div>
  );

  return (
    <motion.div
      id="booking-form"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="mx-auto max-w-2xl"
    >
      {/* Header */}
      <div className={cn("mb-10", isAr ? "text-right" : "text-left")}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-4">
          <Calendar size={14} />
          {isAr ? 'احجز موعدك' : 'Book Your Visit'}
        </div>
        <h3 className="text-3xl font-black text-[var(--foreground)] mb-2">
          {isAr ? 'هل تريد حجز موعد؟' : 'Ready to Book?'}
        </h3>
        <p className="text-[var(--muted)] text-sm">
          {isAr ? 'أكمل البيانات وسنتواصل معك لتأكيد الموعد' : 'Fill in your details and we\'ll confirm your appointment.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="relative">
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-[var(--muted)]", isAr ? "right-4" : "left-4")}>
              <User size={16} />
            </div>
            <Input
              id="patientName"
              label={t('name')}
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              required
              className={cn("rounded-xl border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] transition-colors", isAr ? "pr-10" : "pl-10")}
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-[var(--muted)]", isAr ? "right-4" : "left-4")}>
              <Phone size={16} />
            </div>
            <Input
              id="patientPhone"
              label={t('phone')}
              type="tel"
              value={form.patientPhone}
              onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
              required
              className={cn("rounded-xl border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] transition-colors", isAr ? "pr-10" : "pl-10")}
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <div className={cn("absolute top-1/2 -translate-y-1/2 text-[var(--muted)]", isAr ? "right-4" : "left-4")}>
            <Mail size={16} />
          </div>
          <Input
            id="patientEmail"
            label={t('email')}
            type="email"
            value={form.patientEmail}
            onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
            required
            className={cn("rounded-xl border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] transition-colors", isAr ? "pr-10" : "pl-10")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Date */}
          <div className="relative">
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-[var(--muted)]", isAr ? "right-4" : "left-4")}>
              <Calendar size={16} />
            </div>
            <Input
              id="date"
              label={t('date')}
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className={cn("rounded-xl border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] transition-colors", isAr ? "pr-10" : "pl-10")}
            />
          </div>

          {/* Time Slot */}
          <div className="space-y-1">
            <label className={cn("block text-sm font-bold text-[var(--foreground)]", isAr ? "text-right" : "text-left")}>
              {t('time')}
            </label>
            <div className="relative">
              <div className={cn("absolute top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10", isAr ? "right-4" : "left-4")}>
                <Clock size={16} />
              </div>
              <select
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                required
                className={cn(
                  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] transition-colors appearance-none",
                  isAr ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                )}
              >
                <option value="">{isAr ? 'اختر وقتاً' : 'Select a time'}</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="relative">
          <div className={cn("absolute top-4 text-[var(--muted)]", isAr ? "right-4" : "left-4")}>
            <FileText size={16} />
          </div>
          <Textarea
            id="notes"
            label={t('notes')}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={cn("rounded-xl border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] transition-colors resize-none", isAr ? "pr-10" : "pl-10")}
          />
        </div>

        {/* Error states */}
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle size={18} />
            {t('error')}
          </div>
        )}
        {status === 'conflict' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <AlertCircle size={18} />
            {t('conflict')}
          </div>
        )}

        <Button
          type="submit"
          disabled={status === 'loading'}
          size="lg"
          className="w-full h-14 text-base bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-black rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5 gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Calendar size={20} />
          {status === 'loading'
            ? (isAr ? 'جاري الحجز...' : 'Booking...')
            : t('submit')}
        </Button>
      </form>
    </motion.div>
  );
}
