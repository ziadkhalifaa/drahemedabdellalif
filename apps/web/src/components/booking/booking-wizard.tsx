'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { clinicsApi, appointmentsApi, siteSettingsApi, api } from '@/lib/api';
import {
  Calendar, Clock, User, Phone, Mail, Building2,
  Video, ChevronRight, ChevronLeft, CreditCard,
  UploadCloud, CheckCircle, AlertCircle, MapPin
} from 'lucide-react';
import { cn, formatTime12Hour } from '@/lib/utils';
import { toast } from 'sonner';
import { AppointmentType } from '@dr-ahmed/shared';
import { useAuth } from '@/context/auth-context';
import { useRouter } from '@/i18n/routing';

const steps = [
  { id: 1, nameAr: 'الموعد', nameEn: 'Date & Time' },
  { id: 2, nameAr: 'البيانات', nameEn: 'Details' },
  { id: 3, nameAr: 'الدفع', nameEn: 'Payment' },
  { id: 4, nameAr: 'تأكيد', nameEn: 'Confirm' },
];

export default function BookingWizard() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>({});
  const [maxBookingWeeks, setMaxBookingWeeks] = useState(2);
  
  // Form State
  const [type, setType] = useState<AppointmentType>(AppointmentType.ONLINE);
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [patient, setPatient] = useState({ name: '', phone: '', email: '' });
  const [gender, setGender] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<'VODAFONE_CASH' | 'INSTAPAY'>('VODAFONE_CASH');
  const [senderPhone, setSenderPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  // Available Slots
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  
  useEffect(() => {
    // Load settings
    siteSettingsApi.getAllPublic().then((settingsData) => {
      
      const settings = settingsData.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setPaymentSettings(settings);
      // Read doctor-configured max booking window (in weeks)
      if (settings.maxBookingWeeks) {
        setMaxBookingWeeks(Number(settings.maxBookingWeeks) || 2);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!token) return;
    setProfileLoading(true);
    api.get<any>('/auth/profile', token)
      .then(data => {
        setPatient({
          name: data.name || user?.name || '',
          phone: data.phone || '',
          email: data.email || user?.email || '',
        });
        setGender(data.gender || '');
        setBirthDate(data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '');
        setAddress(data.address || '');
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [token, user]);

  // Fetch available slots — used both on mount and for polling
  const fetchSlots = (targetDate: string, showLoading = false) => {
    if (!targetDate) return;
    if (showLoading) setSlotsLoading(true);
    setSlotsError(false);
    appointmentsApi.getAvailableSlots(targetDate)
      .then(res => {
        // The backend returns { slots: [{ time: '10:00', available: true }, ...] }
        let slots: string[] = [];
        if (res.slots && res.slots.length > 0) {
           if (typeof res.slots[0] === 'string') {
              slots = res.slots as any;
           } else {
              slots = res.slots.filter((s: any) => s.available).map((s: any) => s.time);
           }
        }
        setAvailableSlots(slots);
        // Clear selected time if it was removed (blocked after selection)
        setTimeSlot(prev => slots.includes(prev) ? prev : '');
      })
      .catch(() => {
        setSlotsError(true);
        if (showLoading) toast.error(isRTL ? 'خطأ في تحميل المواعيد' : 'Error loading slots');
      })
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    if (!date) return;

    // Initial load with spinner
    setSlotsLoading(true);
    fetchSlots(date, true);

    // Poll every 10 seconds for real-time updates (no spinner for background refresh)
    const interval = setInterval(() => {
      fetchSlots(date, false);
    }, 10000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Compute max bookable date from maxBookingWeeks
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + maxBookingWeeks * 7);
    return d.toISOString().split('T')[0];
  })();

  const handleNext = () => {
    if (currentStep === 1) {
      if (!date || !timeSlot) return toast.error(isRTL ? 'اختر التاريخ والوقت' : 'Select date and time');
    }
    if (currentStep === 2) {
      if (!patient.name || !patient.phone) return toast.error(isRTL ? 'أدخل الاسم ورقم الهاتف' : 'Enter name and phone');
      if (!gender) return toast.error(isRTL ? 'الرجاء اختيار النوع' : 'Please select gender');
      if (!birthDate) return toast.error(isRTL ? 'الرجاء إدخال تاريخ الميلاد' : 'Please enter date of birth');
    }
    if (currentStep === 3) {
      if (!senderPhone) return toast.error(isRTL ? 'أدخل رقم الهاتف الذي حولت منه' : 'Enter sender phone number');
      if (!proofFile) return toast.error(isRTL ? 'ارفع صورة إيصال التحويل — هذه خطوة إلزامية' : 'Upload payment receipt — this is required');
    }
    setCurrentStep(p => Math.min(p + 1, 4));
  };
  
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 1));
  
  const submitBooking = async () => {
    setLoading(true);
    try {
      // 1. Sync data to patient profile
      if (token) {
        await api.post('/auth/profile', {
          name: patient.name,
          phone: patient.phone,
          gender,
          dateOfBirth: birthDate,
          address,
        }, token);
      }

      // 2. Create Appointment
      const apt = await appointmentsApi.create({
        type,
        date,
        timeSlot,
        guestName: patient.name,
        guestPhone: patient.phone,
        guestEmail: patient.email || undefined,
        patientId: user?.id,
        paymentMethod,
        paymentSenderNum: senderPhone || undefined,
      });
      
      // 3. Upload Proof (mandatory for clinic bookings)
      if (proofFile) {
        await appointmentsApi.uploadPaymentProof(apt.id, proofFile, senderPhone);
      }
      
      toast.success(isRTL ? 'تم تأكيد الحجز بنجاح!' : 'Booking confirmed successfully!');
      // Reset or redirect
      setTimeout(() => {
        window.location.href = `/${locale}/booking/success?id=${apt.id}`;
      }, 1500);
      
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
      setLoading(false);
    }
  };

  const DEPOSIT_AMOUNT = 100;
  const TOTAL_AMOUNT = Number(paymentSettings['payment.price']?.amount || 400);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-12 bg-[#0b1329] border border-white/15 rounded-3xl backdrop-blur-md text-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-10 bg-[#0b1329] border border-white/15 rounded-3xl backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden text-white text-center space-y-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/15">
          <User size={36} className="text-primary" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-black">
            {isRTL ? 'تسجيل الدخول مطلوب لحجز موعد' : 'Login Required to Book'}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
            {isRTL 
              ? 'يرجى تسجيل الدخول أولاً لتتمكن من حجز موعد. تسجيل الدخول يضمن ربط تاريخك الطبي وتسهيل تواصل العيادة معك.' 
              : 'Please log in first to book an appointment. Logging in ensures your medical history is linked and facilitates clinic communication.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => router.push(`/auth/login?redirect=booking`)}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:scale-105 shadow-md shadow-primary/20"
          >
            {isRTL ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            onClick={() => router.push(`/auth/register?redirect=booking`)}
            className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all hover:scale-105"
          >
            {isRTL ? 'إنشاء حساب جديد' : 'Register'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 bg-[#0b1329] border border-white/15 rounded-3xl backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden text-white">
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Progress Bar */}
      <div className="relative mb-10">
        <div className="flex justify-between relative z-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500',
                currentStep > s.id ? 'bg-primary text-white scale-110 shadow-[0_0_20px_rgba(var(--primary),0.5)]' :
                currentStep === s.id ? 'bg-primary text-white scale-110 ring-4 ring-primary/30' :
                'bg-white/10 text-white/50 border border-white/20'
              )}>
                {currentStep > s.id ? <CheckCircle size={18} /> : s.id}
              </div>
              <span className={cn(
                'text-xs font-bold transition-colors hidden sm:block',
                currentStep >= s.id ? 'text-primary-light' : 'text-white/40'
              )}>
                {isRTL ? s.nameAr : s.nameEn}
              </span>
            </div>
          ))}
        </div>
        {/* Track */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-white/10 -z-0">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px]"
        >
          {/* STEP 1: DATE & TIME */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white text-center">
                {isRTL ? 'اختر الموعد المناسب' : 'Select a Suitable Time'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/80">{isRTL ? 'التاريخ' : 'Date'}</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max={maxDate}
                    value={date}
                    onChange={e => { setDate(e.target.value); setTimeSlot(''); }}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/80">{isRTL ? 'الوقت' : 'Time'}</label>
                  <div className="h-[200px] overflow-y-auto pr-2 custom-scrollbar border border-white/10 rounded-xl p-2 bg-black/20">
                    {!date ? (
                      <div className="h-full flex items-center justify-center text-white/40 text-sm">
                        {isRTL ? 'يرجى اختيار التاريخ أولاً' : 'Please select a date first'}
                      </div>
                    ) : slotsLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-red-400/80 text-sm font-bold text-center p-4">
                        {isRTL ? 'عفواً، لا توجد مواعيد متاحة في هذا اليوم.' : 'Sorry, no available slots on this day.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setTimeSlot(slot)}
                            className={cn(
                              'py-2 rounded-lg text-sm font-bold transition-all border',
                              timeSlot === slot 
                                ? 'bg-primary text-white border-primary shadow-lg' 
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30'
                            )}
                          >
                            {formatTime12Hour(slot, isRTL)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PATIENT DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-white text-center">
                {isRTL ? 'بيانات المريض' : 'Patient Details'}
              </h2>
              {profileLoading ? (
                <div className="py-8 text-center text-white/60 space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm">{isRTL ? 'جاري تحميل بيانات الملف الشخصي...' : 'Loading profile details...'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'الاسم بالكامل *' : 'Full Name *'}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-white/40" size={18} />
                      <input
                        type="text"
                        value={patient.name}
                        onChange={e => setPatient({ ...patient, name: e.target.value })}
                        placeholder={isRTL ? 'اسم المريض الثلاثي' : 'Patient Full Name'}
                        className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-primary transition-colors outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'رقم الهاتف (واتساب) *' : 'Phone Number (WhatsApp) *'}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-white/40" size={18} />
                      <input
                        type="tel"
                        dir="ltr"
                        value={patient.phone}
                        onChange={e => setPatient({ ...patient, phone: e.target.value })}
                        placeholder="010XXXXXXXX"
                        className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-primary transition-colors outline-none text-left"
                      />
                    </div>
                    <p className="text-xs text-primary/80 px-1">{isRTL ? 'سيتم إرسال تأكيد الحجز على الواتساب' : 'Confirmation will be sent via WhatsApp'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-white/40" size={18} />
                      <input
                        type="email"
                        dir="ltr"
                        value={patient.email}
                        onChange={e => setPatient({ ...patient, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-primary transition-colors outline-none text-left"
                      />
                    </div>
                  </div>
                  
                  {/* Gender dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'النوع *' : 'Gender *'}</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-primary transition-colors outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0b1329]">{isRTL ? 'اختر النوع' : 'Select Gender'}</option>
                      <option value="male" className="bg-[#0b1329]">{isRTL ? 'ذكر' : 'Male'}</option>
                      <option value="female" className="bg-[#0b1329]">{isRTL ? 'أنثى' : 'Female'}</option>
                    </select>
                  </div>

                  {/* Date of Birth input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'تاريخ الميلاد *' : 'Date of Birth *'}</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-primary transition-colors outline-none [color-scheme:dark]"
                    />
                  </div>

                  {/* Address input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'العنوان الحالي (اختياري)' : 'Current Address (Optional)'}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder={isRTL ? 'العنوان بالتفصيل' : 'Detailed Address'}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-primary transition-colors outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PAYMENT — عربون الحجز */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">
                  {isRTL ? 'دفع قيمة الاستشارة' : 'Pay Consultation Fee'}
                </h2>
                <p className="text-white/50 text-sm">
                  {isRTL ? 'لتأكيد الحجز يُرجى دفع قيمة الاستشارة' : 'A fee is required to confirm your booking'}
                </p>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-gradient-to-br from-primary/15 to-blue-500/10 border border-primary/30 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-sm text-white/70">
                  <span>{isRTL ? 'إجمالي قيمة الحجز:' : 'Total fee:'}</span>
                  <span className="font-bold text-white">{TOTAL_AMOUNT} {isRTL ? 'جنيه' : 'EGP'}</span>
                </div>
                <div className="border-t border-white/10" />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-400 font-black text-lg">
                      {isRTL ? '✅ المطلوب الآن:' : '✅ Required Now:'}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">{isRTL ? 'يُدفع أونلاين الآن لتأكيد الحجز' : 'Paid online now to confirm booking'}</p>
                  </div>
                  <span className="text-3xl font-black text-emerald-400">
                    {TOTAL_AMOUNT} {isRTL ? 'ج' : 'EGP'}
                  </span>
                </div>
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-white/80">{isRTL ? 'اختر طريقة الدفع:' : 'Choose payment method:'}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('VODAFONE_CASH')}
                    className={cn(
                      'p-4 rounded-xl border-2 flex flex-col items-center gap-3 font-bold transition-all',
                      paymentMethod === 'VODAFONE_CASH'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-500/10'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 p-1">
                      <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" fill="#E60000" />
                        <path d="M50 22C34.54 22 22 34.54 22 50C22 62.63 30.36 73.31 41.87 76.79L36.75 83.6H49.03L53.1 77.41C54.26 77.52 55.43 77.58 56.6 77.58C72.06 77.58 84.6 65.04 84.6 49.58C84.6 34.12 72.06 22 56.6 22C55.43 22 54.26 22.06 53.1 22.17V22H50ZM56.6 37.28C63.4 37.28 68.9 42.78 68.9 49.58C68.9 56.38 63.4 61.88 56.6 61.88C49.8 61.88 44.3 56.38 44.3 49.58C44.3 42.78 49.8 37.28 56.6 37.28Z" fill="white" />
                      </svg>
                    </div>
                    <span className="text-sm">{isRTL ? 'فودافون كاش' : 'Vodafone Cash'}</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('INSTAPAY')}
                    className={cn(
                      'p-4 rounded-xl border-2 flex flex-col items-center gap-3 font-bold transition-all',
                      paymentMethod === 'INSTAPAY'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 p-1">
                      <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" rx="24" fill="url(#instapay-btn-grad)" />
                        <path d="M52 18 L28 54 H47 L36 82 L72 46 H53 Z" fill="white" />
                        <defs>
                          <linearGradient id="instapay-btn-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#c8102e" />
                            <stop offset="0.5" stopColor="#7C3AED" />
                            <stop offset="1" stopColor="#00ADEF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <span className="text-sm">{isRTL ? 'انستا باي' : 'InstaPay'}</span>
                  </button>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-1 text-center">
                <p className="text-xs text-white/50">
                  {isRTL ? 'حوّل قيمة الاستشارة إلى:' : 'Transfer the consultation fee to:'}
                </p>
                <p className="text-xl font-black text-white" dir="ltr">
                  {paymentMethod === 'VODAFONE_CASH'
                    ? (paymentSettings['payment.vodafone']?.number || '+20 10 01516882')
                    : (paymentSettings['payment.instapay']?.number || '@instapay')}
                </p>
                <p className="text-emerald-400 font-bold text-sm">
                  {TOTAL_AMOUNT} {isRTL ? 'جنيه' : 'EGP'}
                </p>
              </div>

              {/* Sender Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white/80">
                  {isRTL ? 'رقم الهاتف الذي حولت منه *' : 'Phone number you sent from *'}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-primary transition-colors outline-none text-left"
                />
              </div>

              {/* Proof Upload */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white/80">
                  {isRTL ? '📸 صورة إيصال التحويل (إلزامي) *' : '📸 Transfer Receipt Photo (Required) *'}
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden
                  border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60">
                  {proofFile ? (
                    <>
                      <img src={URL.createObjectURL(proofFile)} alt="proof" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                      <CheckCircle className="text-emerald-400 relative z-10" size={36} />
                      <span className="text-emerald-400 font-bold mt-2 relative z-10 text-sm px-4 text-center truncate w-full">
                        ✅ {proofFile.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-primary/70 mb-2" size={36} />
                      <span className="text-white/70 text-sm font-bold">{isRTL ? 'اضغط لرفع صورة الإيصال' : 'Tap to upload receipt photo'}</span>
                      <span className="text-white/30 text-xs mt-1">{isRTL ? 'PNG / JPG / WEBP' : 'PNG / JPG / WEBP'}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                </label>
                <p className="text-xs text-orange-400/80 font-medium px-1">
                  ⚠️ {isRTL
                    ? 'الإيصال مطلوب لتأكيد الحجز — بدونه لن يُعتمد الحجز'
                    : 'Receipt is required — booking will not be confirmed without it'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-white text-center">
                {isRTL ? 'مراجعة الحجز' : 'Review Booking'}
              </h2>
              
              <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Video size={18} className="text-blue-500"/>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{isRTL ? 'النوع' : 'Type'}</p>
                    <p className="font-bold text-white">{isRTL ? 'استشارة أونلاين' : 'Online Consultation'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{isRTL ? 'الموعد' : 'Date & Time'}</p>
                    <p className="font-bold text-white font-mono" dir="ltr">{date} <span className="mx-1 text-primary">@</span> {formatTime12Hour(timeSlot, isRTL)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{isRTL ? 'المريض' : 'Patient'}</p>
                    <p className="font-bold text-white">{patient.name}</p>
                    <p className="text-xs text-white/70" dir="ltr">{patient.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{isRTL ? 'الدفع' : 'Payment'}</p>
                    <p className="font-bold text-white">
                      {paymentMethod === 'VODAFONE_CASH' ? 'فودافون كاش' : 'انستا باي'}
                    </p>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">
                        {TOTAL_AMOUNT} {isRTL ? 'ج (تم تحويل كامل القيمة)' : 'EGP (Full amount transferred)'}
                      </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1 || loading}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all',
            currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 text-white hover:bg-white/10'
          )}
        >
          {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {isRTL ? 'رجوع' : 'Back'}
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105"
          >
            {isRTL ? 'التالي' : 'Next'}
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        ) : (
          <button
            onClick={submitBooking}
            disabled={loading}
            className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl font-black hover:opacity-90 transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={18} />}
            {isRTL ? 'تأكيد الحجز الآن' : 'Confirm Booking Now'}
          </button>
        )}
      </div>

    </div>
  );
}
