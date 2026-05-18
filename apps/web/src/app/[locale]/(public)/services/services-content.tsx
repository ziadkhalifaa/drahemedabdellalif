'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, SectionHeader, Card } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { api } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';
import { Activity, Scan, Heart, Stethoscope, Shield, Gem, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { EditableText, EditableImage } from '@/components/editor/editable-components';
import useSWR from 'swr';

const iconMap: Record<string, any> = {
  Stethoscope, Activity, Scan, Heart, Shield, Gem,
};

interface Props {
  services: Service[];
  locale: string;
}

export function ServicesContent({ services: initialServices, locale }: Props) {
  const t = useTranslations('services');
  const { data: servicesData, error, mutate } = useSWR<Service[]>('/services', (url: string) => api.get<Service[]>(url), {
    fallbackData: initialServices && initialServices.length > 0 ? initialServices : undefined,
  });

  const services = servicesData || [];
  const loading = !servicesData && !error;
  const fetchError = !!error;

  const fetchServices = () => {
    mutate();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <Section className="bg-gradient-to-b from-[var(--primary)]/5 to-transparent overflow-hidden">
          <div className="grid gap-12 lg:grid-cols-2 items-center mb-12">
            <div>
              <SectionHeader 
                title={<EditableText contentKey="services.hero.title" defaultAr={t('title')} defaultEn={t('title')} />} 
                subtitle={<EditableText contentKey="services.hero.desc" defaultAr={t('subtitle')} defaultEn={t('subtitle')} />} 
                className={locale === 'ar' ? "text-right" : "text-left"}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl"
            >
              <EditableImage 
                contentKey="services.hero.image"
                defaultSrc="/images/urology.png"
                alt="Services Hero"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
          
          {loading ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse flex flex-col sm:flex-row overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/10 shadow-xl bg-white/5 backdrop-blur-xl dark:bg-white/5 h-[300px]">
                  <div className="sm:w-2/5 bg-gray-200 dark:bg-slate-800 h-48 sm:h-full" />
                  <div className="p-8 sm:w-3/5 flex flex-col justify-center space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl">
              <p className="text-[var(--muted)] text-lg mb-4">
                {locale === 'ar' ? 'حدث خطأ في تحميل الخدمات.' : 'Failed to load services.'}
              </p>
              <button
                onClick={() => fetchServices()}
                className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-bold hover:opacity-90 transition-opacity"
              >
                {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl">
              <p className="text-[var(--muted)] text-lg">
                {locale === 'ar' ? 'لا توجد خدمات متاحة حالياً.' : 'No services available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {services.map((service, i) => {
                const title = locale === 'ar' ? service.titleAr : service.titleEn;
                const description = locale === 'ar' ? service.descriptionAr : service.descriptionEn;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <Link href={`/services/${service.slug || service.id}`} className="block h-full">
                      <Card className="group h-full flex flex-col sm:flex-row overflow-hidden rounded-[2rem] border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/5 backdrop-blur-xl dark:bg-white/5">
                        <div className="relative sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-900/50">
                          <EditableImage 
                            contentKey={`service:${service.id}:image`}
                            defaultSrc={service.image || ''}
                            alt={title}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 sm:from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
                        </div>
                        <div className="p-8 sm:w-3/5 flex flex-col justify-center space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 w-fit rounded-full bg-[var(--primary)]/10 dark:bg-white/10 border border-[var(--primary)]/20 text-[var(--primary)] dark:text-white text-[10px] font-bold uppercase tracking-wider">
                             {t('badge')}
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-[var(--primary)] transition-colors">
                             <EditableText 
                               contentKey={`service:${service.id}:${locale === 'ar' ? 'titleAr' : 'titleEn'}`}
                               defaultAr={service.titleAr}
                               defaultEn={service.titleEn}
                               className="pointer-events-auto"
                             />
                          </h3>
                          <div className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 text-sm">
                             <EditableText 
                                contentKey={`service:${service.id}:${locale === 'ar' ? 'descriptionAr' : 'descriptionEn'}`}
                                defaultAr={service.descriptionAr}
                                defaultEn={service.descriptionEn}
                                as="p"
                             />
                          </div>
                          <div className="pt-4 mt-auto">
                             <div className="flex items-center gap-2 font-bold text-[var(--primary)] group-hover:gap-3 transition-all">
                               {t('details')} 
                               <ChevronRight size={18} className={locale === 'ar' ? 'rotate-180' : ''} />
                             </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Call to Action */}
        <Section className="py-20">
          <div className="rounded-[3rem] bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary)] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-[80px]" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full -ml-32 -mb-32 blur-[60px]" />
             
             <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                <h2 className="text-4xl font-black sm:text-5xl leading-tight tracking-tight">{t('cta.title')}</h2>
                <p className="text-white/80 text-xl font-medium leading-relaxed">
                  {t('cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                  <Link href="/booking">
                    <button className="bg-white text-[var(--primary)] px-12 py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl shadow-black/20 text-lg">
                      {t('cta.book')}
                    </button>
                  </Link>
                  <a href="https://wa.me/+201002621743" target="_blank" rel="noopener noreferrer">
                    <button className="bg-[var(--accent)] text-white px-12 py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl shadow-[var(--accent)]/30 text-lg">
                      {t('cta.whatsapp')}
                    </button>
                  </a>
                </div>
             </div>
          </div>
        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
