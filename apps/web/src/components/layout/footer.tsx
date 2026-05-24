'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Phone, Mail, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { useEditor } from '@/context/editor-context';
import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Input, Button } from '@/components/ui';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

export function Footer() {
  const t = useTranslations('footer');
  const tHero = useTranslations('hero');
  const tNav = useTranslations('nav');
  const tContact = useTranslations('contact');
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const { pageContent } = useEditor();
  const social = pageContent?.social || {};
  const facebookUrl = social.facebook || "https://www.facebook.com/DrAhmedAbdellatifClinic/";
  const youtubeUrl = social.youtube || "https://www.youtube.com/@DrAhmedAbdellatif";

  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success(t('subscribeSuccess'));
      setEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      toast.error(t('subscribeError'));
    } finally {
      setSubscribing(false);
    }
  };

  const quickLinks = [
    { href: '/', label: tNav('home') },
    { href: '/about', label: tNav('aboutUs') },
    { href: '/services', label: tNav('services') },
    { href: '/techniques', label: isAr ? 'التقنيات الجراحية' : 'Surgical Techniques' },
    { href: '/blog', label: tNav('blog') },
    { href: '/contact', label: tNav('contact') },
  ];

  const specialties = [
    isAr ? 'جراحة المسالك البولية' : 'Urology Surgery',
    isAr ? 'علاج تضخم البروستاتا' : 'Prostate Treatment',
    isAr ? 'الذكورة والعقم' : 'Andrology & Fertility',
    isAr ? 'مسالك الأطفال' : 'Pediatric Urology',
    isAr ? 'جراحة الكلى' : 'Kidney Surgery',
    isAr ? 'المناظير' : 'Endoscopy',
  ];

  return (
    <footer className="bg-[#05111f] text-white/80 border-t border-white/5">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="pb-12 mb-12 border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className={cn("max-w-md", isAr ? "text-right" : "text-left")}>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              {t('newsletterTitle')}
            </h3>
            <p className="text-sm text-white/55 leading-relaxed">
              {t('newsletterSubtitle')}
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder={t('newsletterPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30 focus:border-[var(--primary)] focus:ring-[var(--primary)] text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={subscribing}
              className="h-12 px-6 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-black rounded-xl transition-all shadow-lg hover:shadow-primary/20 shrink-0"
            >
              {subscribing ? t('newsletterSubscribing') : t('newsletterButton')}
            </Button>
          </form>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand Column */}
          <div className={cn("col-span-2 lg:col-span-1", isAr ? "text-right" : "text-left")}>
            <Logo className="mb-6 brightness-0 invert opacity-90" />
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-8">
              {tHero('subtitle')}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-blue-600/80 hover:border-blue-500 transition-all duration-200"
              >
                <FacebookIcon />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-red-600/80 hover:border-red-500 transition-all duration-200"
              >
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={isAr ? "text-right" : "text-left"}>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[var(--accent)] transition-colors duration-200 group"
                  >
                    {isAr
                      ? <ArrowLeft size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      : <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    }
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialties */}
          <div className={isAr ? "text-right" : "text-left"}>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">
              {isAr ? 'تخصصاتنا' : 'Specialties'}
            </h4>
            <ul className="space-y-3">
              {specialties.map((item) => (
                <li key={item}>
                  <Link
                    href="/services"
                    className="text-sm text-white/50 hover:text-[var(--accent)] transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={isAr ? "text-right" : "text-left"}>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">
              {t('contact')}
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${tContact('phone')}`}
                  className="flex items-start gap-3 text-sm text-white/50 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[var(--accent)] flex-shrink-0 group-hover:bg-[var(--primary)]/30 transition-colors">
                    <Phone size={14} />
                  </div>
                  <span className="pt-1 leading-relaxed">{tContact('phone')}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${tContact('email')}`}
                  className="flex items-start gap-3 text-sm text-white/50 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[var(--accent)] flex-shrink-0 group-hover:bg-[var(--primary)]/30 transition-colors">
                    <Mail size={14} />
                  </div>
                  <span className="pt-1 leading-relaxed break-all">{tContact('email')}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/50">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                    <MapPin size={14} />
                  </div>
                  <span className="pt-1 leading-relaxed">{tContact('address')}</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/50">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                    <Clock size={14} />
                  </div>
                  <span className="pt-1 leading-relaxed">
                    {isAr ? 'السبت - الخميس: ٩ص - ٩م' : 'Sat - Thu: 9AM - 9PM'}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className={cn(
          "mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30",
          isAr ? "sm:flex-row-reverse" : ""
        )}>
          <p>
            &copy; {new Date().getFullYear()} {tHero('title')}. {t('rights')}
          </p>
          <div className={cn("flex gap-6", isAr ? "flex-row-reverse" : "")}>
            <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
