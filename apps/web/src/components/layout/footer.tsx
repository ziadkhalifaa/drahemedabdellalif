'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Phone, Mail, Clock, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { Logo } from '@/components/ui/logo';

export function Footer() {
  const t = useTranslations('footer');
  const tHero = useTranslations('hero');
  const tNav = useTranslations('nav');
  const tContact = useTranslations('contact');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const SocialIcon = ({ type }: { type: 'fb' | 'yt' | 'wa' }) => {
    if (type === 'fb') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
    if (type === 'yt') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
  };

  return (
    <footer className="relative border-t border-[var(--border-strong)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-1)] to-[var(--primary)]/5 -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Col 1: Logo & Social */}
          <div className="lg:col-span-2 space-y-6">
            <Logo className="scale-110 origin-left rtl:origin-right" />
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-md mt-6 text-sm font-medium">
              {isRTL 
                ? 'عيادة أ.د. أحمد عبد اللطيف تقدم أحدث الحلول الطبية في جراحة المسالك البولية والكلى بالليزر والمناظير الدقيقة بمعايير عالمية.'
                : 'Prof. Dr. Ahmed Abdellatif clinic provides the latest medical solutions in urology and nephrology surgery using advanced laser and endoscopy with international standards.'}
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all hover:-translate-y-1">
                <SocialIcon type="fb" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all hover:-translate-y-1">
                <SocialIcon type="yt" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-600/10 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all hover:-translate-y-1">
                <SocialIcon type="wa" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-[var(--text-primary)] relative inline-block">
              {t('quickLinks') || (isRTL ? 'روابط سريعة' : 'Quick Links')}
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[var(--accent)] rtl:right-0" />
            </h4>
            <div className="flex flex-col gap-3 mt-6">
              {[
                { label: tNav('home'), href: '/' },
                { label: tNav('aboutUs'), href: '/about' },
                { label: tNav('services'), href: '/services' },
                { label: isRTL ? 'معرض الصور' : 'Gallery', href: '/gallery' },
              ].map((link, i) => (
                <Link key={i} href={link.href as any} className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Patient Guide */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-[var(--text-primary)] relative inline-block">
              {tNav('patientGuide') || (isRTL ? 'دليل المرضى' : 'Patient Guide')}
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[var(--accent)] rtl:right-0" />
            </h4>
            <div className="flex flex-col gap-3 mt-6">
              {[
                { label: isRTL ? 'التعليمات قبل العملية' : 'Pre-operation Instructions', href: '/patient-guide#pre' },
                { label: isRTL ? 'الرعاية بعد العملية' : 'Post-operation Care', href: '/patient-guide#post' },
                { label: tNav('blog'), href: '/blog' },
                { label: isRTL ? 'أسئلة شائعة' : 'FAQs', href: '/faqs' },
              ].map((link, i) => (
                <Link key={i} href={link.href as any} className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Clinic Info & Working Hours */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-[var(--text-primary)] relative inline-block">
              {t('contact') || (isRTL ? 'تواصل معنا' : 'Contact Us')}
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[var(--accent)] rtl:right-0" />
            </h4>
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <MapPin size={18} className="text-[var(--primary)] mt-0.5 shrink-0" />
                <span className="leading-relaxed font-medium">
                  {tContact('address') || (isRTL ? 'شارع جامعة الدول العربية، المهندسين، الجيزة' : 'Arab League St, Mohandessin, Giza')}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-mono">
                <Phone size={18} className="text-[var(--primary)] shrink-0" />
                <a href={`tel:${tContact('phone') || '01002621743'}`} className="hover:text-[var(--primary)] font-bold">{tContact('phone') || '0100 262 1743'}</a>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black text-[var(--text-primary)] mb-2">
                  <Clock size={14} className="text-[var(--accent)]" />
                  {isRTL ? 'ساعات العمل' : 'Working Hours'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  {isRTL ? 'السبت - الخميس: 10 ص - 10 م' : 'Sat - Thu: 10 AM - 10 PM'}
                  <br />
                  {isRTL ? 'الجمعة: مغلق' : 'Friday: Closed'}
                </div>
              </div>
              
              <Link href="/contact">
                <div className="h-20 w-full rounded-xl bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=30.0444,31.2357&zoom=14&size=400x100&sensor=false')] bg-cover bg-center border border-[var(--border)] mt-2 opacity-80 hover:opacity-100 transition-opacity relative group overflow-hidden">
                   <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="bg-[var(--surface-0)] text-[var(--primary)] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                       {isRTL ? 'افتح الخريطة' : 'Open Map'}
                     </span>
                   </div>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* Emergency CTA */}
        <div className="mt-16 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-[var(--surface-2)] to-[var(--surface-1)] p-6 rounded-3xl border border-[var(--border)] shadow-sm gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--error)]/10 text-[var(--error)] flex items-center justify-center animate-pulse shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h5 className="font-black text-[var(--text-primary)]">
                {isRTL ? 'طوارئ 24/7' : '24/7 Emergency'}
              </h5>
              <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                {isRTL ? 'نحن هنا لمساعدتك في الحالات الطارئة.' : 'We are here to help in emergencies.'}
              </p>
            </div>
          </div>
          <a href="tel:01002621743">
            <Button size="lg" className="rounded-full px-8 bg-[var(--error)] hover:bg-red-700 text-white font-black shadow-lg shadow-[var(--error)]/20 gap-2">
              <PhoneCall size={18} />
              {isRTL ? 'اتصل بالطوارئ' : 'Call Emergency'}
            </Button>
          </a>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-[#050D1A] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-white/50 order-3 md:order-1 text-center md:text-left">
            &copy; {new Date().getFullYear()} {isRTL ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}. {t('rights') || (isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved')}.
          </p>
          
          <p className="text-xs font-accent italic text-white/40 order-2 md:order-2 text-center">
            {isRTL ? 'تم التطوير بمعايير طبية دولية' : 'Developed with International Medical Standards'}
          </p>

          <div className="flex gap-6 order-1 md:order-3">
            <Link href="/privacy" className="text-xs font-medium text-white/50 hover:text-white transition-colors">{t('privacy') || (isRTL ? 'سياسة الخصوصية' : 'Privacy Policy')}</Link>
            <Link href="/terms" className="text-xs font-medium text-white/50 hover:text-white transition-colors">{t('terms') || (isRTL ? 'الشروط والأحكام' : 'Terms & Conditions')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
