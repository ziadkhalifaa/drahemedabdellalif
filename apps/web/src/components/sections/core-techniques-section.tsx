'use client';

import { motion } from 'framer-motion';
import { Section } from '@/components/ui';
import { Link } from '@/i18n/routing';
import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { useLocale } from 'next-intl';

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
  const { data: techniques, isLoading } = useSWR<Technique[]>('/techniques', api.get);

  if (isLoading) {
    return (
      <Section className="py-20 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </Section>
    );
  }

  if (!techniques || techniques.length === 0) return null;

  return (
    <Section className="py-20 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[var(--primary-dark)] dark:text-white"
        >
          {locale === 'ar' ? 'إزالة تضخم البروستاتا الحميد بدون جراحة' : 'BPH Treatment Without Surgery'}
        </motion.h2>
        <div className="mt-4 w-24 h-1 bg-[var(--accent)] mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {techniques.slice(0, 3).map((tech, index) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#111] shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
          >
            <Link href={`/techniques/${tech.slug}`} className="block relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              {tech.image ? (
                <img 
                  src={getMediaUrl(tech.image)} 
                  alt={locale === 'ar' ? tech.titleAr : tech.titleEn}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--primary-dark)]/50" />
              )}
              <h3 className="absolute bottom-6 left-6 right-6 z-20 text-2xl font-bold text-white text-center">
                {locale === 'ar' ? tech.titleAr : tech.titleEn}
              </h3>
            </Link>
            <div className="p-8">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center line-clamp-3">
                {locale === 'ar' ? tech.descriptionAr : tech.descriptionEn}
              </p>
              <div className="mt-6 flex justify-center">
                <Link href={`/techniques/${tech.slug}`} className="text-[var(--primary)] dark:text-[var(--accent)] font-semibold hover:underline">
                  {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'} &larr;
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
