'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, SectionHeader, Card } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Link } from '@/i18n/routing';
import { getMediaUrl } from '@/lib/api';
import { Zap, ChevronRight, Activity, ShieldCheck } from 'lucide-react';

interface Props {
  techniques: any[];
  locale: string;
}

export function TechniquesContent({ techniques, locale }: Props) {
  const tNav = useTranslations('nav');

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <Section className="bg-gradient-to-b from-amber-500/5 to-transparent overflow-hidden">
          <div className="max-w-4xl mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest border border-amber-500/20 mb-6"
            >
              <Zap size={14} className="fill-current" />
              {locale === 'ar' ? 'التكنولوجيا الطبية الحديثة' : 'Modern Medical Technology'}
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-[var(--foreground)] tracking-tighter mb-6">
              <EditableText contentKey="techniques.hero.title" defaultAr="أحدث التقنيات العالمية" defaultEn="Latest Global Techniques" />
            </h1>
            
            <p className="text-xl text-[var(--muted)] leading-relaxed font-medium max-w-2xl">
              <EditableText 
                contentKey="techniques.hero.desc" 
                defaultAr="نستثمر في أحدث ما توصل إليه العلم من أجهزة وتقنيات جراحية لضمان أعلى نسب النجاح وأسرع وقت للتعافي لمرضانا." 
                defaultEn="We invest in the latest scientific advancements in surgical equipment and techniques to ensure the highest success rates and fastest recovery times for our patients." 
              />
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {techniques.map((tech, i) => {
              const title = locale === 'ar' ? tech.titleAr : tech.titleEn;
              const description = locale === 'ar' ? tech.descriptionAr : tech.descriptionEn;

              return (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/techniques/${tech.slug}`} className="block h-full group">
                    <Card className="h-full flex flex-col overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-white/5 p-0">
                      <div className="relative aspect-video overflow-hidden">
                        {tech.image ? (
                          <img 
                            src={getMediaUrl(tech.image)} 
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 flex items-center justify-center">
                            <Zap size={40} className="text-amber-500/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute bottom-6 left-6 right-6">
                           <h3 className="text-2xl font-black text-white leading-tight">{title}</h3>
                        </div>
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col">
                        <p className="text-[var(--muted)] leading-relaxed line-clamp-3 mb-6 font-medium">
                          {description}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={18} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">FDA Approved</span>
                           </div>
                           <div className="flex items-center gap-2 font-bold text-amber-500 group-hover:gap-3 transition-all">
                             {locale === 'ar' ? 'التفاصيل' : 'Details'} 
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
        </Section>

        {/* CTA */}
        <Section className="py-24">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="rounded-[4rem] bg-amber-500 p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-amber-500/20"
           >
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -mr-48 -mt-48 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full -ml-32 -mb-32 blur-[80px]" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                 <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                   <EditableText contentKey="techniques.cta.title" defaultAr="مستقبل جراحة المسالك بين يديك" defaultEn="The Future of Urology Surgery" />
                 </h2>
                 <p className="text-white/90 text-xl font-medium leading-relaxed">
                   <EditableText 
                     contentKey="techniques.cta.subtitle" 
                     defaultAr="احجز استشارتك الآن لتتعرف على التقنية الأنسب لحالتك وتبدأ رحلة التعافي بأمان." 
                     defaultEn="Book your consultation now to learn about the most suitable technique for your condition and start your recovery safely." 
                   />
                 </p>
                 <div className="pt-6">
                    <Link href="/booking">
                       <button className="bg-white text-amber-600 px-14 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
                         {tNav('bookNow')}
                       </button>
                    </Link>
                 </div>
              </div>
           </motion.div>
        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
