'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Zap, ExternalLink } from 'lucide-react';

interface Technique {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string | null;
  isActive: boolean;
}

export function CoreTechniquesSection() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { data: techniques, isLoading } = useSWR<Technique[]>('/techniques', api.get);

  if (isLoading) {
    return (
      <section className="py-28 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[480px] rounded-[2rem] bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!techniques || techniques.length === 0) return null;

  return (
    <section className="relative py-28 overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16", isAr ? "text-right" : "text-left")}>
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-5">
              <Zap size={14} />
              {isAr ? 'تقنياتنا المتقدمة' : 'Advanced Techniques'}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] leading-tight max-w-xl">
              {isAr ? 'علاج متطور بدون جراحة تقليدية' : 'Advanced Treatment Without Traditional Surgery'}
            </h2>
          </div>

          <Link
            href="/techniques"
            className={cn(
              "inline-flex items-center gap-2 text-[var(--primary)] font-black text-sm border border-[var(--primary)]/30 px-5 py-3 rounded-xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300 whitespace-nowrap",
            )}
          >
            {isAr ? 'عرض الكل' : 'View All'}
            {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {techniques.slice(0, 3).map((tech, index) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.7 }}
              className="group"
            >
              <Link href={`/techniques/${tech.slug}`} className="block h-full">
                {/* Card */}
                <div className="relative h-[480px] rounded-[2rem] overflow-hidden bg-white dark:bg-[#111] shadow-lg border border-[var(--border)] group-hover:shadow-2xl group-hover:shadow-[var(--primary)]/10 group-hover:-translate-y-3 transition-all duration-500">

                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    {tech.image ? (
                      <img
                        src={getMediaUrl(tech.image)}
                        alt={isAr ? tech.titleAr : tech.titleEn}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary-dark)]/60 flex items-center justify-center">
                        <Zap size={60} className="text-white/30" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Number badge */}
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[var(--primary)] text-white text-sm font-black flex items-center justify-center shadow-lg">
                      0{index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={cn("p-7 flex flex-col flex-grow", isAr ? "text-right" : "text-left")}>
                    <h3 className="text-xl font-black text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors duration-300 leading-tight">
                      {isAr ? tech.titleAr : tech.titleEn}
                    </h3>

                    <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3 flex-grow">
                      {isAr ? tech.descriptionAr : tech.descriptionEn}
                    </p>

                    {/* Read more */}
                    <div className={cn(
                      "mt-6 flex items-center gap-2 text-[var(--primary)] text-sm font-black opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300",
                      isAr ? "flex-row-reverse justify-end" : "justify-start"
                    )}>
                      <ExternalLink size={14} />
                      {isAr ? 'اقرأ التفاصيل' : 'Read More'}
                    </div>
                  </div>

                  {/* Bottom progress bar on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border)]">
                    <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-700" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
