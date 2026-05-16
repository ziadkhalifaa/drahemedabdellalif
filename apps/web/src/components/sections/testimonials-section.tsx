'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui';
import { api } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { SuccessStoryCard } from '@/components/ui/success-story-card';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>('/testimonials/success-stories?limit=3').then(setStories).catch(() => {});
  }, []);

  if (!stories.length) return null;

  return (
    <section id="success-stories" className="relative py-28 bg-white dark:bg-[#080808] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={cn(
          "flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14",
          isAr ? "text-right" : "text-left"
        )}>
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-5">
              <Heart size={14} className="fill-[var(--primary)]" />
              {isAr ? 'قصص نجاحنا' : 'Success Stories'}
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-[var(--foreground)] leading-tight"
            >
              {t('tabSuccessStories')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-[var(--muted)] text-base max-w-xl"
            >
              {t('subtitle')}
            </motion.p>
          </div>

          <Link href="/success-stories" className="flex-shrink-0">
            <Button
              size="lg"
              className="h-12 px-6 text-sm bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1 gap-2 font-black"
            >
              {t('viewAll') || 'عرض جميع قصص النجاح'}
              {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Button>
          </Link>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group hover:-translate-y-2 transition-transform duration-300"
            >
              <Link href={`/success-stories/${story.id}`} className="block h-full">
                <SuccessStoryCard story={story} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
