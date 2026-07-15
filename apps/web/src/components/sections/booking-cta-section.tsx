'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Calendar, Video, ArrowLeft, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn, FloatingOrbs, TiltCard, MagneticButton } from '@/components/motion/motion-utils';

export function BookingCTASection() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [selected, setSelected] = useState<'clinic' | 'online' | null>(null);

  const options = [
    {
      id: 'online' as const,
      icon: Video,
      titleAr: 'استشارة طبية أونلاين',
      titleEn: 'Online Medical Consultation',
      descAr: 'تواصل مع الدكتور عبر الإنترنت من أي مكان بكل سهولة وخصوصية.',
      descEn: 'Consult with the doctor online from anywhere, conveniently and privately.',
      color: 'from-blue-600 to-blue-800',
      border: 'border-blue-500',
      glow: 'shadow-blue-500/30',
      href: '/booking',
      badge: isAr ? 'الأكثر طلباً' : 'Most Popular',
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden bg-[#0a192f]">
      <FloatingOrbs count={5} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn direction="up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-8">
            <Star size={14} className="fill-[var(--accent)]" />
            {isAr ? 'ابدأ رحلتك الصحية' : 'Start Your Health Journey'}
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            {isAr ? 'اختر طريقة تواصلك المفضلة' : 'Choose Your Preferred Method'}
          </h2>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-16 leading-relaxed">
            {isAr
              ? 'سواء كنت تفضل الزيارة الشخصية أو الاستشارة عن بُعد، نحن هنا لخدمتك.'
              : 'Whether you prefer an in-person visit or a remote consultation, we are here to serve you.'}
          </p>
        </FadeIn>

        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {options.map((opt, idx) => (
            <TiltCard key={opt.id} tiltDegree={10} className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.15, duration: 0.7 }}
              >
                <div
                  onClick={() => setSelected(opt.id)}
                  className={cn(
                    "group relative cursor-pointer rounded-[2.5rem] p-8 md:p-12 border-2 transition-all duration-500 min-h-[320px] flex flex-col items-center justify-between",
                    "bg-white/5 backdrop-blur-sm",
                    selected === opt.id
                      ? `${opt.border} ${opt.glow} shadow-2xl`
                      : "border-white/10 hover:border-white/30 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r text-xs font-black text-white tracking-wider",
                    opt.color
                  )}>
                    {opt.badge}
                  </div>

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3 + idx, repeat: Infinity, ease: 'easeInOut' }}
                    className={cn(
                      "w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2",
                      opt.color
                    )}
                  >
                    <opt.icon size={48} className="text-white" />
                  </motion.div>

                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                      {isAr ? opt.titleAr : opt.titleEn}
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed">
                      {isAr ? opt.descAr : opt.descEn}
                    </p>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />

                  <MagneticButton as="a" href={opt.href}>
                    <span className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#0a192f] font-black text-lg hover:bg-white/90 transition-all shadow-xl group-hover:shadow-2xl">
                      {isAr ? 'احجز الآن' : 'Book Now'}
                      {isAr ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                    </span>
                  </MagneticButton>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <FadeIn direction="up" delay={0.5}>
          <div className="mt-16 inline-flex flex-wrap items-center justify-center gap-8 text-white/50">
            {[
              { icon: CheckCircle2, text: isAr ? 'إلغاء مجاني قبل 24 ساعة' : 'Free cancellation 24h before' },
              { icon: CheckCircle2, text: isAr ? 'خصوصية تامة للبيانات' : 'Complete data privacy' },
              { icon: CheckCircle2, text: isAr ? 'متابعة ما بعد الكشف' : 'Post-consultation follow-up' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <item.icon size={16} className="text-emerald-500" />
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
