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

  const contactCards = [
    { icon: Phone, label: t('info.phone'), value: CLINIC_PHONE, href: `tel:${CLINIC_PHONE}`, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
    { icon: Mail, label: t('info.email'), value: CLINIC_EMAIL, href: `mailto:${CLINIC_EMAIL}`, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
    { icon: MessageCircle, label: 'WhatsApp', value: isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}`, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' },
    { icon: MapPin, label: t('info.beniSuef'), value: t('info.beniSuefAddress'), href: '#', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card, i) => (
              <motion.a
                key={i}
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "group flex flex-col items-center text-center gap-3 p-6 rounded-2xl border bg-[var(--card)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  card.bg,
                  isAr ? "text-right" : "text-left"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", card.bg)}>
                  <card.icon size={22} className={card.color} />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)] font-medium mb-1">{card.label}</p>
                  <p className="text-sm text-[var(--foreground)] font-bold leading-snug">{card.value}</p>
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
                <div className={cn("flex items-center gap-3 mb-6", isAr ? "flex-row-reverse" : "")}>
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 flex items-center justify-center">
                    <Clock size={18} className="text-[var(--accent)]" />
                  </div>
                  <h4 className="font-black text-[var(--foreground)] text-lg">{t('hours.title')}</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { location: t('hours.beniSuef'), hours: t('hours.beniSuefHours') },
                    { location: t('hours.october'), hours: t('hours.octoberHours') },
                  ].map((row, i) => (
                    <div key={i} className={cn(
                      "flex justify-between items-center p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]",
                      isAr ? "flex-row-reverse" : ""
                    )}>
                      <span className="text-sm text-[var(--muted)] font-medium">{row.location}</span>
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
