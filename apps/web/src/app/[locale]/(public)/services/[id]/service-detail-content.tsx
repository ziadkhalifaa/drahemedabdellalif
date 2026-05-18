'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, Button } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { CheckCircle2, Stethoscope } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { api, getMediaUrl } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';

interface Props {
  service: Service | null;
  locale: string;
  serviceId: string;
}

export function ServiceDetailContent({ service: initialService, locale, serviceId }: Props) {
  const tNav = useTranslations('nav');
  const [service, setService] = useState<Service | null>(initialService);
  const [loading, setLoading] = useState(initialService === null);

  useEffect(() => {
    if (initialService === null) {
      setLoading(true);
      const fetchDetail = (attempt = 1) => {
        api.get<Service>(`/services/${serviceId}`)
          .then(res => {
            setService(res);
            setLoading(false);
          })
          .catch(err => {
            console.error(`Failed to fetch service detail client-side (attempt ${attempt}):`, err);
            if (attempt < 2) {
              setTimeout(() => fetchDetail(attempt + 1), 1500);
            } else {
              setLoading(false);
            }
          });
      };
      fetchDetail();
    } else {
      setService(initialService);
      setLoading(false);
    }
  }, [initialService, serviceId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-20 animate-pulse">
          <Section>
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="h-20 w-20 rounded-[2.5rem] bg-gray-200 dark:bg-slate-800" />
                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="flex gap-4 pt-6">
                  <div className="h-14 bg-gray-200 dark:bg-slate-800 rounded-2xl flex-1" />
                  <div className="h-14 bg-gray-200 dark:bg-slate-800 rounded-2xl flex-1" />
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-[3rem] bg-gray-200 dark:bg-slate-800" />
            </div>
          </Section>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-32">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{locale === 'ar' ? 'الخدمة غير موجودة' : 'Service Not Found'}</h1>
            <Link href="/services"><Button>{locale === 'ar' ? 'العودة للخدمات' : 'Back to Services'}</Button></Link>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  const title = locale === 'ar' ? service.titleAr : service.titleEn;
  const description = locale === 'ar' ? service.descriptionAr : service.descriptionEn;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20">
        <Section>
          <div className="max-w-5xl mx-auto">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center mb-16"
            >
              <div className="space-y-6">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-xl shadow-[var(--primary)]/20">
                  <Stethoscope className="h-10 w-10" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight text-[var(--foreground)] tracking-tighter">{title}</h1>
                <p className="text-xl text-[var(--muted)] leading-relaxed font-medium">{description}</p>
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href="/booking" className="flex-1">
                    <Button className="w-full py-8 rounded-[1.5rem] text-lg font-black shadow-2xl shadow-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:scale-[1.02] transition-transform">
                      {tNav('bookNow')}
                    </Button>
                  </Link>
                  <Link href="/contact" className="flex-1">
                    <Button variant="outline" className="w-full py-8 rounded-[1.5rem] text-lg font-bold border-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                      {tNav('contact')}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {service.image && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-900 ring-1 ring-black/5">
                    <img 
                      src={getMediaUrl(service.image)} 
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-10 md:p-14 rounded-[3rem] bg-white dark:bg-slate-900/50 border border-[var(--border)] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl group-hover:blur-2xl transition-all" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-10 flex items-center gap-4 text-[var(--foreground)]">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={28} />
                    </div>
                    {locale === 'ar' ? 'لماذا تختارنا لهذه الخدمة؟' : 'Why Choose Us for This Service?'}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        title: locale === 'ar' ? 'خبرة طبية عميقة' : 'Deep Medical Expertise',
                        desc: locale === 'ar' ? 'فريق طبي متخصص بخبرة تزيد عن 20 عاماً في جراحة المسالك' : 'Specialized medical team with 20+ years of experience in urology',
                      },
                      {
                        title: locale === 'ar' ? 'تقنيات عالمية' : 'Global Technology',
                        desc: locale === 'ar' ? 'نستخدم أحدث الأجهزة والتقنيات العالمية لضمان أفضل النتائج' : 'We use the latest global equipment to ensure best results',
                      },
                      {
                        title: locale === 'ar' ? 'رعاية متكاملة' : 'Integrated Care',
                        desc: locale === 'ar' ? 'رعاية شاملة قبل وبعد العملية مع متابعة دورية دقيقة' : 'Comprehensive pre and post-operative care with precise follow-up',
                      },
                      {
                        title: locale === 'ar' ? 'نتائج مضمونة' : 'Guaranteed Results',
                        desc: locale === 'ar' ? 'نسب نجاح عالمية بفضل الدقة والاحترافية في التنفيذ' : 'Global success rates thanks to precision and professionalism',
                      }
                    ].map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-5 p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-transparent hover:border-[var(--primary)]/30 transition-all group/item"
                      >
                        <div className="h-3 w-3 rounded-full bg-[var(--primary)] mt-2 shrink-0 shadow-[0_0_10px_var(--primary)]" />
                        <div>
                          <h4 className="font-black text-lg mb-1 group-hover/item:text-[var(--primary)] transition-colors">{item.title}</h4>
                          <p className="text-[var(--muted)] font-medium text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
