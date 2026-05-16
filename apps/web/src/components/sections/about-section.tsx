'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { ArrowLeft, ArrowRight, Award, BookOpen, Microscope, GraduationCap, CheckCircle2 } from 'lucide-react';
import { EditableText, EditableImage } from '@/components/editor/editable-components';
import { cn } from '@/lib/utils';

const credentials = [
  { icon: GraduationCap, labelAr: 'دكتوراه جراحة المسالك البولية', labelEn: 'PhD in Urology' },
  { icon: Microscope, labelAr: 'جراح مناظير متقدم', labelEn: 'Advanced Endoscopic Surgeon' },
  { icon: BookOpen, labelAr: '+40 بحث علمي منشور', labelEn: '+40 Published Research Papers' },
  { icon: Award, labelAr: 'عضو جمعيات طبية دولية', labelEn: 'International Medical Societies' },
];

export function AboutSection() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section id="about" className="relative py-28 overflow-hidden bg-white dark:bg-[#050505]">
      {/* Background decorative shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute top-0 w-1/2 h-full bg-gray-50 dark:bg-[#0d1117] -z-0",
          isAr ? "right-0 rounded-l-[80px]" : "left-0 rounded-r-[80px]"
        )} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Image Column ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: isAr ? 40 : -40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className={cn("relative", isAr ? "order-1 lg:order-2" : "order-1")}
          >
            {/* Frame glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 rounded-[2.5rem] blur-2xl z-0" />

            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl z-10 border border-[var(--primary)]/10">
              <EditableImage
                contentKey="about.image"
                defaultSrc="/images/dr-ahmed.png"
                alt="Prof. Dr. Ahmed Abdellatif"
                className="w-full h-auto aspect-[4/5] object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--primary-dark)]/60 to-transparent pointer-events-none" />
            </div>

            {/* Floating stats badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className={cn(
                "absolute bottom-6 z-20 bg-white/95 dark:bg-[#111]/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/30",
                isAr ? "left-6" : "right-6"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-black text-lg">
                  15+
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-sm">{isAr ? 'سنة من الخبرة' : 'Years of Experience'}</p>
                  <p className="text-xs text-gray-500">{isAr ? 'جراحة المسالك البولية' : 'in Urology Surgery'}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className={cn(
                "absolute top-6 z-20 bg-[var(--primary)] p-4 rounded-2xl shadow-xl",
                isAr ? "left-6" : "right-6"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  5k
                </div>
                <div>
                  <p className="font-black text-white text-sm">{isAr ? 'عملية ناجحة' : 'Successful Surgeries'}</p>
                  <p className="text-xs text-white/70">{isAr ? 'للأطفال والبالغين' : 'Adults & Pediatric'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Text Column ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={cn(isAr ? "order-2 lg:order-1 text-right" : "order-2 text-left")}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-6">
              <CheckCircle2 size={14} />
              {isAr ? 'نبذة عن الطبيب' : 'About the Doctor'}
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-[var(--foreground)] mb-4 leading-tight">
              <EditableText
                contentKey="about.title"
                defaultAr="الأستاذ الدكتور أحمد عبد اللطيف"
                defaultEn="Prof. Dr. Ahmed Abdellatif"
                as="span"
              />
            </h2>

            <div className={cn(
              "w-20 h-1.5 bg-[var(--accent)] rounded-full mb-8",
              !isAr && ""
            )} />

            <div className="text-base text-[var(--muted)] leading-loose space-y-4 mb-10">
              <EditableText
                contentKey="about.description1"
                defaultAr="أستاذ واستشاري جراحة المسالك البولية والكلى والمناظير والذكورة. بفضل خبرته العلمية العميقة ومهاراته الجراحية المتميزة، استطاع تقديم حلول طبية مبتكرة باستخدام أحدث التقنيات."
                defaultEn="Professor and Consultant of Urology, Nephrology, Endoscopy, and Andrology. With deep scientific expertise and distinguished surgical skills, Dr. Ahmed delivers innovative medical solutions using the latest technologies."
                as="p"
              />
              <EditableText
                contentKey="about.description2"
                defaultAr="يتميز بخبرته الفريدة في علاج المسالك البولية للأطفال، بما في ذلك التشوهات الخلقية، السلس البولي، والخصية المعلقة، باستخدام تقنيات متقدمة وآمنة."
                defaultEn="Renowned for unique expertise in pediatric urology, including congenital abnormalities, urinary incontinence, and undescended testis, using advanced and safe surgical techniques."
                as="p"
              />
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {credentials.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-[var(--foreground)] leading-tight">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </motion.div>
              ))}
            </div>

            <Link href="/about">
              <Button size="lg" className="h-14 px-8 text-base bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1 gap-3 group font-bold">
                <EditableText
                  contentKey="about.readMore"
                  defaultAr="تعرف علينا أكثر"
                  defaultEn="Know more about us"
                  as="span"
                />
                {isAr
                  ? <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                  : <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                }
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
