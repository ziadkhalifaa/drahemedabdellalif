'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Trophy, Cpu, Activity, Stethoscope, CheckCircle2, Star } from 'lucide-react';

const icons = [Trophy, Cpu, Activity, Stethoscope];

export function WhyUsSection() {
  const t = useTranslations('whyUs');
  const reasons = t.raw('reasons') as { title: string; description: string }[];

  return (
    <section id="why-us" className="relative py-32 overflow-hidden bg-[#0a192f]">
      {/* Background Effects matching Statistics Section */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-[150px] opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl text-right md:text-right">
             <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md"
            >
              <Star size={14} className="fill-[var(--primary)]" />
              {t('title')}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
            >
              لماذا نحن الخيار <span className="text-[var(--primary)] text-glow">الأفضل</span> لصحتك؟
            </motion.h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block h-24 w-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl rotate-12 flex items-center justify-center"
          >
             <Trophy size={40} className="text-[var(--primary)]" />
          </motion.div>
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
                {/* Glow Background */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--primary)] to-blue-400 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
                
                <div className="relative h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-4 flex flex-col">
                  
                  <div className="mb-10 relative">
                    <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[var(--primary)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                      <Icon size={36} />
                    </div>
                    <span className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[var(--primary)] text-white text-xs font-black flex items-center justify-center shadow-lg">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[var(--primary)] transition-colors duration-300">
                    {reason.title}
                  </h3>
                  
                  <p className="text-base leading-relaxed text-gray-300/80 font-medium">
                    {reason.description}
                  </p>

                  <div className="mt-auto pt-8 flex items-center gap-3">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-blue-400" 
                      />
                    </div>
                    <CheckCircle2 size={16} className="text-[var(--primary)]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 20px rgba(var(--primary-rgb), 0.5);
        }
      `}</style>
    </section>
  );
}
