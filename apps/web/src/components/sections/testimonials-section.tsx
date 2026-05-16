'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { SuccessStoryCard } from '@/components/ui/success-story-card';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [stories, setStories] = useState<any[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', direction: isAr ? 'rtl' : 'ltr' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  useEffect(() => {
    api.get<any[]>('/testimonials/success-stories?limit=10').then(setStories).catch(() => {});
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

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

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button onClick={scrollPrev} className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[var(--primary)] hover:text-white transition-all">
                {isAr ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <button onClick={scrollNext} className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[var(--primary)] hover:text-white transition-all">
                {isAr ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
            <Link href="/success-stories" className="hidden sm:block">
              <Button
                size="lg"
                className="h-12 px-6 text-sm bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1 gap-2 font-black"
              >
                {t('viewAll') || 'عرض جميع قصص النجاح'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
          <div className="flex gap-6 pb-8 pt-4">
            {stories.map((story, i) => (
              <div key={story.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
                <Link href={`/success-stories/${story.id}`} className="block h-full transition-transform duration-300 hover:-translate-y-2">
                  <SuccessStoryCard story={story} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
