'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Button, Input, Textarea } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { WHATSAPP_NUMBER, CLINIC_PHONE, CLINIC_EMAIL } from '@dr-ahmed/shared';
import { Phone, Mail, MapPin, Clock, SendHorizontal, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const clinics = [
    { 
      title: isAr ? 'عيادة 6 أكتوبر' : '6th of October Clinic', 
      address: isAr ? 'أمام حديقة الحصري - مبنى بريما فيستا - أعلى بنك CIB' : 'Opposite Al-Hosary Park - Prima Vista Bldg - Above CIB Bank',
      hours: isAr ? 'الخميس: من 1 إلى 3 ظهرًا' : 'Thursday: 1:00 PM to 3:00 PM',
      phones: ['01101211994', '01010415455'],
      href: 'https://maps.google.com/?q=Prima+Vista+Building,+6th+of+October'
    },
    { 
      title: isAr ? 'عيادة بني سويف' : 'Beni Suef Clinic', 
      address: isAr ? 'برج الندى ش بورسعيد بجوار الثانوية بنات - الدور الثاني' : 'Al Nada Tower, Port Said St, Next to Girls High School - 2nd Floor',
      hours: isAr ? 'السبت للأربعاء: 4 عصرًا إلى 10 مساءً' : 'Sat-Wed: 4:00 PM to 10:00 PM',
      phones: ['01024366117', '0822135709'],
      href: 'https://maps.google.com/?q=Al+Nada+Tower,+Beni+Suef'
    },
    { 
      title: isAr ? 'عيادة التجمع الخامس' : '5th Settlement Clinic', 
      address: isAr ? 'مبنى HCC - خلف المستشفى الجوي التخصصي' : 'HCC Building - Behind Air Force Hospital',
      hours: isAr ? 'يتم تحديد المواعيد بالحجز المسبق' : 'Appointments by prior reservation',
      phones: ['01101211994', '01010415455'],
      href: 'https://maps.google.com/?q=HCC+Building,+5th+Settlement'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)]">
        {/* Hero Header */}
        <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/15 rounded-full blur-[150px]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-5" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-6">
              <MessageCircle size={14} />
              {isAr ? 'تواصل معنا' : 'Get in Touch'}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[var(--foreground)] mb-5 leading-tight">
              {t('title')}
            </h1>
            <p className="text-[var(--muted)] text-xl leading-relaxed max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {clinics.map((clinic, i) => (
              <motion.a
                key={i}
                href={clinic.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="group relative flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 shadow-[0_4px_20px_-4px_rgba(15,76,129,0.05)] dark:shadow-none hover:shadow-[0_20px_40px_-15px_rgba(15,76,129,0.12)] hover:dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                {/* Premium Animated Top Border Gradient */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Background radial glow */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

                {/* Luxury-Grade Icon Badge */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--primary-dark)] to-[var(--primary)] flex items-center justify-center border border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-all duration-300 shadow-md shadow-[var(--primary)]/10 relative z-10 shrink-0">
                  <MapPin size={22} className="text-[var(--accent)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <div className="flex-1 flex flex-col justify-start items-center relative z-10 w-full">
                  <span className="text-lg font-black tracking-widest text-[var(--primary)] dark:text-white transition-colors duration-300 block mb-3">
                    {clinic.title}
                  </span>
                  
                  <p className="text-[13px] font-bold text-[var(--foreground)]/80 leading-relaxed min-h-[40px] mb-4">
                    {clinic.address}
                  </p>

                  <div className="w-full h-px bg-[var(--border)] mb-4" />

                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-center gap-2 text-[var(--muted)] text-sm">
                      <Clock size={16} className="shrink-0" />
                      <span className="font-semibold">{clinic.hours}</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-2 mt-2">
                      {clinic.phones.map((phone, idx) => (
                         <div key={idx} className="flex items-center gap-2 text-[var(--accent)] font-black text-sm hover:underline">
                           <Phone size={14} className="shrink-0" />
                           <span dir="ltr">{phone}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Call-to-action */}
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-black text-[var(--primary)] dark:text-[var(--accent-light)] opacity-70 group-hover:opacity-100 transition-all duration-300">
                    {isAr ? 'عرض الموقع على الخريطة' : 'View on Google Maps'}
                    <span className={cn(
                      "transition-transform duration-300",
                      isAr ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
                    )}>
                      {isAr ? '←' : '→'}
                    </span>
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: isAr ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="bg-[var(--card)] border border-[var(--border)] shadow-sm backdrop-blur-md rounded-[2rem] p-8">
                <h3 className={cn("text-2xl font-black text-[var(--foreground)] mb-2", isAr ? "text-right" : "text-left")}>
                  {t('form.title')}
                </h3>
                <p className={cn("text-[var(--muted)] text-sm mb-8", isAr ? "text-right" : "text-left")}>
                  {isAr ? 'سيتم الرد عليك في أقرب وقت ممكن.' : 'We\'ll get back to you as soon as possible.'}
                </p>

                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h4 className="text-xl font-black text-[var(--foreground)] mb-2">{isAr ? 'تم الإرسال!' : 'Sent!'}</h4>
                    <p className="text-[var(--muted)] text-sm">{isAr ? 'سنتواصل معك قريباً.' : 'We\'ll contact you soon.'}</p>
                    <button onClick={() => setStatus('idle')} className="mt-6 text-[var(--accent)] text-sm font-bold underline hover:text-[var(--primary)] transition-colors">
                      {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        id="contact-name"
                        label={t('form.name')}
                        placeholder={t('form.namePlaceholder')}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="rounded-xl bg-transparent border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
                      />
                      <Input
                        id="contact-phone"
                        label={t('form.phone')}
                        placeholder={t('form.phonePlaceholder')}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                        className="rounded-xl bg-transparent border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
                      />
                    </div>
                    <Input
                      id="contact-email"
                      label={t('form.email')}
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="rounded-xl bg-transparent border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
                    />
                    <Textarea
                      id="contact-message"
                      label={t('form.message')}
                      placeholder={t('form.messagePlaceholder')}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      className="rounded-xl bg-transparent border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] min-h-[130px] resize-none"
                    />

                    {status === 'error' && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, try again'}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-base bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-black rounded-xl gap-3 transition-all hover:-translate-y-0.5 shadow-lg shadow-[var(--primary)]/20"
                    >
                      <SendHorizontal size={18} />
                      {loading ? '...' : t('form.submit')}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Map & Hours */}
            <motion.div
              initial={{ opacity: 0, x: isAr ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Working Hours */}
              <div className="bg-[var(--card)] border border-[var(--border)] shadow-sm backdrop-blur-md rounded-[2rem] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 flex items-center justify-center">
                    <Clock size={18} className="text-[var(--accent)]" />
                  </div>
                  <h4 className="font-black text-[var(--foreground)] text-lg">{t('hours.title')}</h4>
                </div>
                <div className="space-y-3">
                  {clinics.map((row, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-sm text-[var(--muted)] font-bold">{row.title}</span>
                      <span className="text-sm text-[var(--accent)] font-black">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Map */}
              <div className="rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-xl aspect-video">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3528.5!2d31.0919!3d29.0744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDA0JzI4LjAiTiAzMcKwMDUnMzAuOCJF!5e0!3m2!1sar!2seg!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Clinic Location"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
