'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { Award, Users, Activity, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { CountUp } from '@/components/ui/count-up';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer, fadeInLeft, fadeInRight } from '@/lib/animations';

export function AboutSection() {
  const t = useTranslations('about');
  const tStats = useTranslations('stats');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const stats = [
    { icon: Award, label: tStats('experience') || (isRTL ? 'عاماً من الخبرة' : 'Years Experience'), value: 15 },
    { icon: Users, label: tStats('patients') || (isRTL ? 'مريض سعيد' : 'Happy Patients'), value: 5000 },
    { icon: Activity, label: tStats('surgeries') || (isRTL ? 'عملية ناجحة' : 'Successful Surgeries'), value: 2000 },
    { icon: Trophy, label: tStats('awards') || (isRTL ? 'جائزة وتكريم' : 'Awards & Honors'), value: 20 },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[var(--surface-0)]" id="about">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[45%_55%] gap-16 lg:gap-20 items-center">
          
          {/* Image Side */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={isRTL ? fadeInRight : fadeInLeft}
            className="relative"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* SVG Background Pattern */}
            <div className="absolute -inset-10 -z-10 opacity-30 text-[var(--primary)]">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" />
                <path d="M10,10 Q50,90 90,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M20,20 Q60,100 100,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,50 Q50,0 100,50 T0,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>

            {/* Main Image with Diagonal Clip */}
            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{ clipPath: 'polygon(0 0, 100% 5%, 95% 100%, 5% 95%)' }}
            >
              <div className="absolute inset-0 bg-[var(--primary)]/10 mix-blend-multiply z-10" />
              <img 
                src="/images/doctor.png" 
                alt="Prof. Dr. Ahmed Abdellatif"
                className="w-full object-cover aspect-[4/5]"
              />
            </div>

            {/* Floating Elements */}
            <Badge 
              variant="gold" 
              className="absolute -top-4 -left-4 z-20 px-4 py-2 font-black shadow-xl animate-float rtl:-right-4 rtl:left-auto"
              icon={<CheckCircle2 size={16} />}
            >
              {isRTL ? 'أكاديمي معتمد دولياً' : 'Internationally Certified Academic'}
            </Badge>

            <div className="absolute -bottom-8 -right-8 z-20 glass bg-white/90 p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-float rtl:-left-8 rtl:right-auto" style={{ animationDelay: '1.5s' }}>
              <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Award size={28} />
              </div>
              <div>
                <div className="text-3xl font-black text-[var(--primary)] font-mono leading-none">
                  <CountUp to={15} duration={3} />+
                </div>
                <div className="text-sm font-bold text-[var(--text-muted)] mt-1">
                  {isRTL ? 'عاماً من التميز' : 'Years of Excellence'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="flex flex-col"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-[var(--accent)]" />
              <span className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">
                {isRTL ? 'من نحن' : 'About Us'}
              </span>
            </motion.div>

            <motion.h2 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] leading-[1.2] font-display"
            >
              {isRTL ? 'رحلة طبية ملتزمة بالتميز والإنسانية' : 'A Medical Journey Committed to Excellence and Humanity'}
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed"
            >
              {t('description') || (isRTL 
                ? 'أ.د. أحمد عبد اللطيف هو أستاذ جراحة المسالك البولية والكلى، يحمل خبرة تمتد لأكثر من 15 عاماً في تقديم أحدث الحلول الطبية والجراحية. متخصص في جراحات المناظير الدقيقة وعلاج البروستاتا بالليزر، مع التزام كامل بتقديم رعاية طبية تعتمد على المعايير العالمية.' 
                : 'Prof. Dr. Ahmed Abdellatif is a Professor of Urology & Nephrology with over 15 years of experience providing the latest medical and surgical solutions. Specializing in advanced endoscopic surgeries and laser prostate treatment, with a full commitment to delivering medical care based on international standards.')}
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="mt-8 p-6 bg-[var(--primary)]/5 rounded-2xl border-l-4 border-transparent rtl:border-r-4 rtl:border-l-0"
              style={{ [isRTL ? 'borderRightColor' : 'borderLeftColor']: 'var(--accent)' }}
            >
              <blockquote className="text-xl sm:text-2xl text-[var(--primary-mid)] leading-relaxed font-accent italic">
                "{isRTL 
                  ? 'التزامي ليس فقط بالعلاج، بل بإعادة بناء ثقة المريض بنفسه.' 
                  : 'My commitment is not just to treat, but to rebuild the patient\'s self-confidence.'}"
              </blockquote>
              <div className="mt-4 font-bold text-sm text-[var(--text-primary)] font-display">
                — {isRTL ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[var(--text-primary)] font-mono">
                      <CountUp to={stat.value} />+
                    </div>
                    <div className="text-sm font-bold text-[var(--text-muted)] mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12">
              <Link href="/about">
                <Button size="lg" className="rounded-xl px-8 h-14 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold gap-3 group transition-transform hover:scale-105">
                  {isRTL ? 'عرف أكثر عن الدكتور' : 'Learn More About The Doctor'}
                  <ArrowRight size={20} className={isRTL ? 'rotate-180 transition-transform group-hover:-translate-x-1' : 'transition-transform group-hover:translate-x-1'} />
                </Button>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
