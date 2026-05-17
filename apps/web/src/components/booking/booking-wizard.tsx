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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AppointmentType } from '@dr-ahmed/shared';
import { useAuth } from '@/context/auth-context';
import { useRouter } from '@/i18n/routing';

const steps = [
  { id: 1, nameAr: 'نوع الحجز', nameEn: 'Type' },
  { id: 2, nameAr: 'الموعد', nameEn: 'Date & Time' },
  { id: 3, nameAr: 'البيانات', nameEn: 'Details' },
  { id: 4, nameAr: 'الدفع', nameEn: 'Payment' },
  { id: 5, nameAr: 'تأكيد', nameEn: 'Confirm' },
];

export default function BookingWizard() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>({});
  
  // Form State
  const [type, setType] = useState<AppointmentType | null>(null);
  const [clinicId, setClinicId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [patient, setPatient] = useState({ name: '', phone: '', email: '' });
  const [gender, setGender] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<'VODAFONE_CASH' | 'INSTAPAY' | 'CASH'>('CASH');
  const [senderPhone, setSenderPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  // Available Slots
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  useEffect(() => {
    // Load clinics and settings
    Promise.all([
      clinicsApi.getAll(),
      siteSettingsApi.getAllPublic()
    ]).then(([clinicsData, settingsData]) => {
      setClinics(clinicsData);
      
      const settings = settingsData.reduce((acc: any, curr: any) => {
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
  
  useEffect(() => {
    if (!date || !type) return;
    setSlotsLoading(true);
    
    // For IN_CLINIC: use the selected clinic ID
    // For ONLINE: use the virtual 'clinic-online' ID
    const targetClinicId = type === AppointmentType.IN_CLINIC ? clinicId : 'clinic-online';
    
    if (!targetClinicId) { setSlotsLoading(false); return; }
    
    clinicsApi.getAvailableSlots(targetClinicId, date)
      .then(setAvailableSlots)
      .catch(() => toast.error(isRTL ? 'خطأ في تحميل المواعيد' : 'Error loading slots'))
      .finally(() => setSlotsLoading(false));
  }, [date, clinicId, type, isRTL]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!type) return toast.error(isRTL ? 'اختر نوع الحجز أولاً' : 'Select appointment type');
      if (type === AppointmentType.IN_CLINIC && !clinicId) return toast.error(isRTL ? 'اختر العيادة أولاً' : 'Select clinic');
    }
    if (currentStep === 2) {
      if (!date || !timeSlot) return toast.error(isRTL ? 'اختر التاريخ والوقت' : 'Select date and time');
    }
    if (currentStep === 3) {
      if (!patient.name || !patient.phone) return toast.error(isRTL ? 'أدخل الاسم ورقم الهاتف' : 'Enter name and phone');
      if (!gender) return toast.error(isRTL ? 'الرجاء اختيار النوع' : 'Please select gender');
      if (!birthDate) return toast.error(isRTL ? 'الرجاء إدخال تاريخ الميلاد' : 'Please enter date of birth');
    }
    if (currentStep === 4) {
      if (paymentMethod !== 'CASH') {
        if (!senderPhone) return toast.error(isRTL ? 'أدخل رقم المحول منه' : 'Enter sender phone number');
        if (!proofFile) return toast.error(isRTL ? 'ارفع صورة الإثبات' : 'Upload payment proof');
      }
    }
    setCurrentStep(p => Math.min(p + 1, 5));
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
        clinicId: type === AppointmentType.IN_CLINIC ? clinicId : undefined,
        date,
        timeSlot,
        guestName: patient.name,
        guestPhone: patient.phone,
        guestEmail: patient.email || undefined,
        patientId: user?.id,
        paymentMethod,
        paymentSenderNum: senderPhone || undefined,
      });
      
      // 3. Upload Proof if manual
      if (proofFile && paymentMethod !== 'CASH') {
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

  const getPrice = () => paymentSettings['payment.price']?.amount || 400;

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
          {/* STEP 1: TYPE & LOCATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white text-center">
                {isRTL ? 'أين تفضل موعدك؟' : 'Where would you like your appointment?'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setType(AppointmentType.IN_CLINIC)}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center',
                    type === AppointmentType.IN_CLINIC 
                      ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.2)]' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                  )}
                >
                  <Building2 size={48} className={type === AppointmentType.IN_CLINIC ? 'text-primary' : ''} />
                  <div>
                    <h3 className="font-bold text-lg">{isRTL ? 'في العيادة' : 'In Clinic'}</h3>
                    <p className="text-xs opacity-70 mt-1">{isRTL ? 'كشف مباشر في العيادة' : 'Direct consultation in clinic'}</p>
                  </div>
                </button>
                <button
                  onClick={() => { setType(AppointmentType.ONLINE); setClinicId(''); }}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center',
                    type === AppointmentType.ONLINE 
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                  )}
                >
                  <Video size={48} className={type === AppointmentType.ONLINE ? 'text-blue-500' : ''} />
                  <div>
                    <h3 className="font-bold text-lg">{isRTL ? 'استشارة أونلاين' : 'Online Consultation'}</h3>
                    <p className="text-xs opacity-70 mt-1">{isRTL ? 'مكالمة فيديو لمدة 15 دقيقة' : '15-minute video call'}</p>
                  </div>
                </button>
              </div>

              {type === AppointmentType.IN_CLINIC && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-4">
                  <h3 className="text-white/80 font-bold px-2">{isRTL ? 'اختر العيادة:' : 'Select Clinic:'}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {clinics.map(clinic => (
                      <button
                        key={clinic.id}
                        onClick={() => setClinicId(clinic.id)}
                        className={cn(
                          'p-4 rounded-xl border flex items-start text-start gap-4 transition-all',
                          clinicId === clinic.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        )}
                      >
                        <div className={cn('p-2 rounded-lg mt-1', clinicId === clinic.id ? 'bg-primary text-white' : 'bg-white/10 text-white/50')}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h4 className={cn("font-bold text-lg", clinicId === clinic.id ? 'text-white' : 'text-white/80')}>
                            {isRTL ? clinic.nameAr : clinic.nameEn}
                          </h4>
                          <p className="text-sm text-white/50 mt-1">{isRTL ? clinic.addressAr : clinic.addressEn}</p>
                          <p className="text-xs text-primary mt-2" dir="ltr">{clinic.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {currentStep === 2 && (
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
                    value={date}
                    onChange={e => { setDate(e.target.value); setTimeSlot(''); }}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                  {type === AppointmentType.IN_CLINIC && !date && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4 text-sm text-primary-light">
                      <p className="flex items-center gap-2 font-bold mb-2"><AlertCircle size={16}/> {isRTL ? 'مواعيد العيادات' : 'Clinic Hours'}</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li><span className="font-bold">أكتوبر:</span> الخميس (1 ظ - 3 ظ)</li>
                        <li><span className="font-bold">بني سويف:</span> السبت للأربعاء (4 ع - 10 م)</li>
                      </ul>
                    </div>
                  )}
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
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PATIENT DETAILS */}
          {currentStep === 3 && (
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

          {/* STEP 4: PAYMENT */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-lg mx-auto">
              <h2 className="text-2xl font-black text-white text-center">
                {isRTL ? 'طريقة الدفع' : 'Payment Method'}
              </h2>
              
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-white/80 text-sm mb-1">{isRTL ? 'قيمة الكشف / الاستشارة:' : 'Consultation Fee:'}</p>
                <p className="text-3xl font-black text-primary">{getPrice()} {isRTL ? 'جنيه' : 'EGP'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('VODAFONE_CASH')}
                  className={cn(
                    'p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all',
                    paymentMethod === 'VODAFONE_CASH' ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  )}
                >
                  {isRTL ? 'فودافون كاش' : 'Vodafone Cash'}
                </button>
                <button
                  onClick={() => setPaymentMethod('INSTAPAY')}
                  className={cn(
                    'p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all',
                    paymentMethod === 'INSTAPAY' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  )}
                >
                  {isRTL ? 'انستا باي' : 'InstaPay'}
                </button>
                {type === AppointmentType.IN_CLINIC && (
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={cn(
                      'col-span-2 p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all',
                      paymentMethod === 'CASH' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    )}
                  >
                    {isRTL ? 'الدفع نقداً في العيادة' : 'Pay Cash in Clinic'}
                  </button>
                )}
              </div>

              {paymentMethod !== 'CASH' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/10">
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-sm text-white/70 mb-2">
                      {isRTL ? 'الرجاء تحويل المبلغ إلى الرقم/الحساب التالي:' : 'Please transfer the amount to:'}
                    </p>
                    <p className="text-xl font-bold text-white" dir="ltr">
                      {paymentMethod === 'VODAFONE_CASH' ? (paymentSettings['payment.vodafone']?.number || '+20 10 01516882') : (paymentSettings['payment.instapay']?.number || '+20 10 01516882@instapay')}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'رقم الهاتف الذي قمت بالتحويل منه *' : 'Sender Phone Number *'}</label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={senderPhone}
                      onChange={e => setSenderPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-white focus:border-primary transition-colors outline-none text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white/80">{isRTL ? 'صورة إيصال التحويل *' : 'Transfer Receipt Image *'}</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 hover:border-primary/50 bg-black/20 hover:bg-primary/5 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
                      {proofFile ? (
                        <>
                          <img src={URL.createObjectURL(proofFile)} alt="proof" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                          <CheckCircle className="text-emerald-400 relative z-10" size={32} />
                          <span className="text-emerald-400 font-bold mt-2 relative z-10 text-sm px-4 text-center truncate w-full">{proofFile.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="text-white/40 mb-2" size={32} />
                          <span className="text-white/60 text-sm font-medium">{isRTL ? 'اضغط لرفع الصورة' : 'Click to upload image'}</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-white text-center">
                {isRTL ? 'مراجعة الحجز' : 'Review Booking'}
              </h2>
              
              <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    {type === AppointmentType.IN_CLINIC ? <Building2 size={18} className="text-primary"/> : <Video size={18} className="text-blue-500"/>}
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{isRTL ? 'النوع' : 'Type'}</p>
                    <p className="font-bold text-white">{type === AppointmentType.IN_CLINIC ? (isRTL ? 'كشف بالعيادة' : 'In Clinic') : (isRTL ? 'استشارة أونلاين' : 'Online Consultation')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{isRTL ? 'الموعد' : 'Date & Time'}</p>
                    <p className="font-bold text-white font-mono" dir="ltr">{date} <span className="mx-1 text-primary">@</span> {timeSlot}</p>
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
                      {paymentMethod === 'VODAFONE_CASH' ? 'فودافون كاش' : paymentMethod === 'INSTAPAY' ? 'انستا باي' : (isRTL ? 'نقداً بالعيادة' : 'Cash in Clinic')}
                      <span className="mx-2 text-primary">({getPrice()} EGP)</span>
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
