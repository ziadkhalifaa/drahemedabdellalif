'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Trophy, Cpu, Activity, Stethoscope, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = [Trophy, Cpu, Activity, Stethoscope];

export function WhyUsSection() {
  const t = useTranslations('whyUs');
  const reasons = t.raw('reasons') as { title: string; description: string }[];

  return (
    <section id="why-us" className="relative py-24 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-6"
          >
            <CheckCircle2 size={14} />
            {t('title')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6 tracking-tight"
          >
            نحن نضع <span className="text-[var(--primary)]">صحتك</span> في المقام الأول دائماً
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--muted)]"
          >
            نجمع بين الخبرة الأكاديمية العميقة وأحدث التقنيات الطبية العالمية لنقدم لك تجربة علاجية لا تضاهى.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative"
              >
                {/* Card Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-500" />
                
                <div className="relative h-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-[var(--primary)]/10 group-hover:-translate-y-2 flex flex-col items-center text-center">
                  <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    <div className="relative h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--primary)]/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Icon size={32} />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-[var(--foreground)] mb-4 group-hover:text-[var(--primary)] transition-colors duration-300">
                    {reason.title}
                  </h3>
                  
                  <p className="text-sm leading-relaxed text-[var(--muted)] font-medium">
                    {reason.description}
                  </p>

                  <div className="mt-8 pt-6 border-t border-[var(--border)] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center justify-center gap-1.5 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">
                      رعاية متميزة <CheckCircle2 size={12} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
