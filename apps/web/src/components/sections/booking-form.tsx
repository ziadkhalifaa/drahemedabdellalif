'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Input, Textarea, Button } from '@/components/ui';
import { api, clinicsApi, appointmentsApi, siteSettingsApi } from '@/lib/api';
import { Calendar, CheckCircle2, AlertCircle, Clock, Phone, Mail, User, FileText, Building2, BabyIcon, CreditCard, UploadCloud } from 'lucide-react';
import { TIME_SLOTS } from '@dr-ahmed/shared';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

export function BookingForm() {
  const t = useTranslations('booking.form');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    birthDate: '',
    clinicId: '',
    date: '',
    timeSlot: '',
    notes: '',
  });
  const [gender, setGender] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>({});
  const [paymentMethod, setPaymentMethod] = useState<'VODAFONE_CASH' | 'INSTAPAY' | 'CASH'>('CASH');
  const [senderPhone, setSenderPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'conflict'>('idle');

  useEffect(() => {
    clinicsApi.getAll().then(setClinics).catch(console.error);
    siteSettingsApi.getAllPublic().then(data => {
      const settings = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setPaymentSettings(settings);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!token) return;
    setProfileLoading(true);
    api.get<any>('/auth/profile', token)
      .then(data => {
        setForm(prev => ({
          ...prev,
          patientName: data.name || user?.name || '',
          patientPhone: data.phone || '',
          patientEmail: data.email || user?.email || '',
          birthDate: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        }));
        setGender(data.gender || '');
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [token, user]);

  useEffect(() => {
    if (!form.date || !form.clinicId) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    clinicsApi.getAvailableSlots(form.clinicId, form.date)
      .then(setAvailableSlots)
      .catch(console.error)
      .finally(() => setSlotsLoading(false));
  }, [form.date, form.clinicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(isAr ? 'الرجاء تسجيل الدخول أولاً' : 'Please log in first');
      return;
    }
    if (!gender) {
      toast.error(isAr ? 'الرجاء اختيار النوع' : 'Please select gender');
      return;
    }
    if (!form.birthDate) {
      toast.error(isAr ? 'الرجاء إدخال تاريخ الميلاد' : 'Please enter date of birth');
      return;
    }

    if (paymentMethod !== 'CASH') {
      if (!senderPhone) {
        toast.error(isAr ? 'الرجاء إدخال رقم المحول منه' : 'Please enter sender phone number');
        return;
      }
      if (!proofFile) {
        toast.error(isAr ? 'الرجاء رفع صورة الإيصال' : 'Please upload payment receipt');
        return;
      }
    }

    setStatus('loading');
    try {
      // 1. Update patient profile in DB
      await api.post('/auth/profile', {
        name: form.patientName,
        phone: form.patientPhone,
        gender,
        dateOfBirth: form.birthDate,
      }, token);

      // 2. Create Appointment
      const apt = await appointmentsApi.create({
        ...form,
        guestName: form.patientName,
        guestPhone: form.patientPhone,
        guestEmail: form.patientEmail,
        patientId: user?.id,
        type: 'IN_CLINIC',
        paymentMethod,
        paymentSenderNum: senderPhone || undefined,
      });

      if (proofFile && paymentMethod !== 'CASH') {
        await appointmentsApi.uploadPaymentProof(apt.id, proofFile, senderPhone);
      }

      setStatus('success');
      setForm({ patientName: '', patientPhone: '', patientEmail: '', birthDate: '', clinicId: '', date: '', timeSlot: '', notes: '' });
      setGender('');
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
          onClick={() => {
            setStatus('idle');
            setPaymentMethod('CASH');
            setSenderPhone('');
            setProofFile(null);
          }}
          className="mt-8 text-sm text-green-700 dark:text-green-400 font-bold underline"
        >
          {isAr ? 'حجز موعد آخر' : 'Book another appointment'}
        </button>
      </motion.div>
    );
  }

  const renderField = (icon: React.ReactNode, label: string, children: React.ReactNode) => (
    <div className="space-y-1">
      <label className={cn("block text-sm font-bold text-white mb-2", isAr ? "text-right" : "text-left")}>
        {label}
      </label>
      <div className="relative group">
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10 group-focus-within:text-[var(--primary)] transition-colors",
          isAr ? "right-4" : "left-4"
        )}>
          {icon}
        </div>
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <motion.div
        id="booking-form"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-xl text-center space-y-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/15">
          <User size={28} className="text-primary-light" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">
            {isAr ? 'احجز موعدك الآن' : 'Book Your Appointment Now'}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
            {isAr 
              ? 'يرجى تسجيل الدخول أولاً لتتمكن من حجز موعد في العيادة. تسجيل الدخول يضمن حفظ بياناتك الطبية وتأكيد موعدك بأمان.' 
              : 'Please sign in first to book an appointment at our clinic. Logging in keeps your medical files safe and confirms your booking.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => router.push(`/auth/login?redirect=/`)}
            className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:scale-105 shadow-md shadow-primary/20"
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            onClick={() => router.push(`/auth/register?redirect=/`)}
            className="px-8 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all hover:scale-105"
          >
            {isAr ? 'إنشاء حساب جديد' : 'Register'}
          </button>
        </div>
      </motion.div>
    );
  }

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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-4 border border-[var(--primary)]/30">
          <Calendar size={14} />
          {isAr ? 'احجز موعدك' : 'Book Your Visit'}
        </div>
        <h3 className="text-3xl font-black text-white mb-2">
          {isAr ? 'هل تريد حجز موعد؟' : 'Ready to Book?'}
        </h3>
        <p className="text-white/60 text-sm">
          {isAr ? 'أكمل البيانات وسنتواصل معك لتأكيد الموعد' : 'Fill in your details and we\'ll confirm your appointment.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          {renderField(
            <User size={16} />,
            t('name'),
            <Input
              id="patientName"
              placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'}
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              required
              className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors placeholder:text-white/20 h-12", isAr ? "pr-11" : "pl-11")}
            />
          )}

          {/* Phone */}
          {renderField(
            <Phone size={16} />,
            t('phone'),
            <Input
              id="patientPhone"
              placeholder={isAr ? 'رقم الهاتف' : 'Phone Number'}
              type="tel"
              value={form.patientPhone}
              onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
              required
              className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors placeholder:text-white/20 h-12", isAr ? "pr-11" : "pl-11")}
            />
          )}
        </div>

        {/* Email */}
        {renderField(
          <Mail size={16} />,
          t('email'),
          <Input
            id="patientEmail"
            placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'}
            type="email"
            value={form.patientEmail}
            onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
            required
            className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors placeholder:text-white/20 h-12", isAr ? "pr-11" : "pl-11")}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Clinic */}
          {renderField(
            <Building2 size={16} />,
            isAr ? 'العيادة' : 'Clinic',
            <select
              value={form.clinicId}
              onChange={(e) => setForm({ ...form, clinicId: e.target.value })}
              required
              className={cn(
                "w-full h-12 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-white transition-colors appearance-none",
                isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"
              )}
            >
              <option value="" className="bg-[#050e1a]">{isAr ? 'اختر العيادة' : 'Select Clinic'}</option>
              {clinics.filter(c => c.id !== 'clinic-online').map((c) => (
                <option key={c.id} value={c.id} className="bg-[#050e1a]">{isAr ? c.nameAr : c.nameEn}</option>
              ))}
            </select>
          )}

          {/* Gender */}
          {renderField(
            <User size={16} />,
            isAr ? 'النوع' : 'Gender',
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className={cn(
                "w-full h-12 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-white transition-colors appearance-none cursor-pointer",
                isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"
              )}
            >
              <option value="" className="bg-[#050e1a]">{isAr ? 'اختر النوع' : 'Select Gender'}</option>
              <option value="male" className="bg-[#050e1a]">{isAr ? 'ذكر' : 'Male'}</option>
              <option value="female" className="bg-[#050e1a]">{isAr ? 'أنثى' : 'Female'}</option>
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Birth Date */}
          {renderField(
            <BabyIcon size={16} />,
            isAr ? 'تاريخ الميلاد' : 'Date of Birth',
            <Input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              required
              className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors [color-scheme:dark] h-12", isAr ? "pr-11" : "pl-11")}
            />
          )}
          
          {/* Spacer */}
          <div className="hidden sm:block"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Date */}
          {renderField(
            <Calendar size={16} />,
            isAr ? 'تاريخ الحجز' : 'Appointment Date',
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors [color-scheme:dark] h-12", isAr ? "pr-11" : "pl-11")}
            />
          )}

          {/* Time Slot */}
          {renderField(
            <Clock size={16} />,
            t('time'),
            <select
              value={form.timeSlot}
              onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
              required
              disabled={!form.date || !form.clinicId || slotsLoading}
              className={cn(
                "w-full h-12 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-white transition-colors appearance-none",
                isAr ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left",
                (!form.date || !form.clinicId || slotsLoading) && "opacity-50 cursor-not-allowed"
              )}
            >
              <option value="" className="bg-[#050e1a]">{slotsLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر وقتاً' : 'Select a time')}</option>
              {availableSlots.length > 0 ? availableSlots.map((slot) => (
                <option key={slot} value={slot} className="bg-[#050e1a]">{slot}</option>
              )) : (
                form.date && form.clinicId && !slotsLoading && <option value="" disabled className="bg-[#050e1a]">{isAr ? 'لا توجد مواعيد متاحة' : 'No available slots'}</option>
              )}
            </select>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <label className={cn("block text-sm font-bold text-white mb-2", isAr ? "text-right" : "text-left")}>
            {isAr ? 'طريقة الدفع' : 'Payment Method'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={cn(
                'p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all text-sm',
                paymentMethod === 'CASH' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              )}
            >
              {isAr ? 'الدفع بالعيادة' : 'Pay at Clinic'}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('VODAFONE_CASH')}
              className={cn(
                'p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all text-sm',
                paymentMethod === 'VODAFONE_CASH' ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              )}
            >
              {isAr ? 'فودافون كاش' : 'Vodafone Cash'}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('INSTAPAY')}
              className={cn(
                'p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all text-sm col-span-2 sm:col-span-1',
                paymentMethod === 'INSTAPAY' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              )}
            >
              {isAr ? 'انستا باي' : 'InstaPay'}
            </button>
          </div>

          {paymentMethod !== 'CASH' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/10 mt-4">
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-white/70 mb-2">
                  {isAr ? 'الرجاء تحويل المبلغ إلى الرقم/الحساب التالي:' : 'Please transfer the amount to:'}
                </p>
                <p className="text-xl font-bold text-white" dir="ltr">
                  {paymentMethod === 'VODAFONE_CASH' ? (paymentSettings['payment.vodafone']?.number || '+20 10 01516882') : (paymentSettings['payment.instapay']?.number || '+20 10 01516882@instapay')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {renderField(
                  <Phone size={16} />,
                  isAr ? 'رقم المحول منه' : 'Sender Phone',
                  <Input
                    id="senderPhone"
                    dir="ltr"
                    value={senderPhone}
                    onChange={e => setSenderPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    required
                    className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors placeholder:text-white/20 h-12 text-left", isAr ? "pr-11" : "pl-11")}
                  />
                )}

                <div className="space-y-1">
                  <label className={cn("block text-sm font-bold text-white mb-2", isAr ? "text-right" : "text-left")}>
                    {isAr ? 'صورة الإيصال' : 'Receipt Image'}
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-12 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
                    {proofFile ? (
                      <span className="text-emerald-400 font-bold text-sm px-4 truncate w-full text-center flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> {proofFile.name}
                      </span>
                    ) : (
                      <span className="text-white/60 text-sm font-medium flex items-center gap-2">
                        <UploadCloud size={16} /> {isAr ? 'اضغط لرفع الصورة' : 'Upload image'}
                      </span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Notes */}
        {renderField(
          <FileText size={16} />,
          t('notes'),
          <Textarea
            id="notes"
            placeholder={isAr ? 'أضف أي ملاحظات إضافية هنا...' : 'Add any additional notes here...'}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={cn("rounded-xl border-white/10 bg-white/5 text-white focus:border-[var(--primary)] transition-colors resize-none placeholder:text-white/20 min-h-[100px]", isAr ? "pr-11" : "pl-11")}
          />
        )}

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
