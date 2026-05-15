'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, Button } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { ShieldCheck, Zap, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getMediaUrl } from '@/lib/api';

interface Props {
  technique: any | null;
  locale: string;
}

export function TechniqueDetailContent({ technique, locale }: Props) {
  const tNav = useTranslations('nav');

  if (!technique) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-32">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{locale === 'ar' ? 'التقنية غير موجودة' : 'Technique Not Found'}</h1>
            <Link href="/"><Button>{locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const title = locale === 'ar' ? technique.titleAr : technique.titleEn;
  const description = locale === 'ar' ? technique.descriptionAr : technique.descriptionEn;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20">
        <Section>
          <div className="max-w-6xl mx-auto">
             <Link 
               href="/" 
               className="inline-flex items-center gap-2 text-[var(--primary)] font-bold mb-8 hover:gap-3 transition-all"
             >
               {locale === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
               {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
             </Link>

            {/* Hero Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest border border-amber-500/20">
                  <Zap size={14} className="fill-current" />
                  {locale === 'ar' ? 'تقنيات متطورة' : 'Advanced Technology'}
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter text-[var(--foreground)]">
                  {title}
                </h1>
                
                <p className="text-xl text-[var(--muted)] leading-relaxed font-medium border-l-4 border-[var(--primary)] pl-6 py-2">
                  {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/booking" className="flex-1">
                    <Button className="w-full py-8 rounded-2xl text-lg font-black shadow-2xl shadow-[var(--primary)]/30 bg-[var(--primary)] hover:scale-105 transition-all">
                      {tNav('bookNow')}
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[var(--primary)]/10 blur-[100px] rounded-full" />
                <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white dark:border-slate-800">
                  {technique.image ? (
                    <img 
                      src={getMediaUrl(technique.image)} 
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                      <Activity size={100} className="text-gray-300 dark:text-slate-700" />
                    </div>
                  )}
                </div>
                
                {/* Floating Badge */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -right-6 md:right-10 p-6 rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4 z-20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--muted)] tracking-widest">{locale === 'ar' ? 'نسبة الأمان' : 'Safety Rate'}</p>
                    <p className="text-2xl font-black text-[var(--foreground)]">99.9%</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 {
                   icon: Zap,
                   color: 'text-amber-500',
                   title: locale === 'ar' ? 'دقة متناهية' : 'High Precision',
                   desc: locale === 'ar' ? 'تكنولوجيا تضمن الوصول لأدق التفاصيل الجراحية بأقل تداخل.' : 'Technology ensuring maximum surgical precision with minimal intervention.'
                 },
                 {
                   icon: Activity,
                   color: 'text-blue-500',
                   title: locale === 'ar' ? 'تعافي سريع' : 'Fast Recovery',
                   desc: locale === 'ar' ? 'بفضل التقنيات الحديثة، يمكن للمريض العودة لحياته الطبيعية في وقت قياسي.' : 'Thanks to modern techniques, patients return to normal life in record time.'
                 },
                 {
                   icon: ShieldCheck,
                   color: 'text-emerald-500',
                   title: locale === 'ar' ? 'أعلى درجات الأمان' : 'Maximum Safety',
                   desc: locale === 'ar' ? 'تقنيات معتمدة دولياً تضمن تقليل المخاطر والمضاعفات الجراحية.' : 'Internationally certified techniques ensuring minimal risks and complications.'
                 }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.1 * i }}
                   className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all"
                 >
                   <div className={`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 ${item.color}`}>
                     <item.icon size={30} />
                   </div>
                   <h3 className="text-xl font-black mb-3">{item.title}</h3>
                   <p className="text-[var(--muted)] font-medium leading-relaxed">{item.desc}</p>
                 </motion.div>
               ))}
            </div>

            {/* Call to Action */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-24 p-12 rounded-[3.5rem] bg-gradient-to-br from-slate-900 to-black text-white relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black">
                   <EditableText contentKey="technique.detail.cta.title" defaultAr="استشر الدكتور أحمد حول هذه التقنية" defaultEn="Consult Dr. Ahmed About This Technique" />
                </h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                   <EditableText 
                     contentKey="technique.detail.cta.desc" 
                     defaultAr="احجز موعدك الآن لمناقشة مدى ملاءمة هذه التقنية لحالتك الصحية والحصول على تشخيص دقيق." 
                     defaultEn="Book your appointment now to discuss the suitability of this technique for your condition and get a precise diagnosis." 
                   />
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                   <Link href="/booking">
                     <Button className="bg-white text-black hover:bg-gray-100 px-12 py-7 rounded-2xl font-black text-lg">
                       {tNav('bookNow')}
                     </Button>
                   </Link>
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
