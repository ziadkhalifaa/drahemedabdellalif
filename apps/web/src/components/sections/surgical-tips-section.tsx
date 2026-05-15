'use client';

import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { useLocale } from 'next-intl';

interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string | null;
  excerptEn: string | null;
  slugAr: string;
  slugEn: string;
  featuredImage: string | null;
  showOnHomepage: boolean;
}

export function SurgicalTipsSection() {
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, direction: 'rtl', align: 'start', slidesToScroll: 1 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const { data: postsData } = useSWR<BlogPost[]>('/blog/published', api.get);
  // Prefer showOnHomepage posts, otherwise fall back to latest 4
  const posts = postsData
    ? (postsData.filter(p => p.showOnHomepage).length > 0
        ? postsData.filter(p => p.showOnHomepage)
        : postsData.slice(0, 4))
    : [];

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#111] overflow-hidden relative">
      {/* Decorative dots background */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--primary)] to-transparent bg-[length:10px_10px]" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[var(--primary-dark)] dark:text-white mb-4"
          >
            {locale === 'ar' ? 'نصائح جراحية وتثقيف طبي' : 'Surgical Tips & Medical Education'}
          </motion.h2>
          <div className="w-24 h-1 bg-[var(--accent)] mx-auto rounded-full" />
        </div>

        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="embla overflow-hidden" 
            ref={emblaRef}
          >
            <div className="embla__container flex -ml-6 rtl:-ml-0 rtl:-mr-6">
              {posts.map((post) => {
                const title = locale === 'ar' ? post.titleAr : post.titleEn;
                const excerpt = locale === 'ar' ? post.excerptAr : post.excerptEn;
                const slug = locale === 'ar' ? post.slugAr : post.slugEn;
                return (
                  <div className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6 rtl:pl-0 rtl:pr-6" key={post.id}>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 h-full flex flex-col group">
                      <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {post.featuredImage ? (
                          <img 
                            src={getMediaUrl(post.featuredImage)} 
                            alt={title}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center">
                            <span className="text-4xl opacity-10">📰</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-[var(--accent)] text-black text-xs font-bold px-3 py-1 rounded-full">
                          {locale === 'ar' ? 'مقال طبي' : 'Medical Article'}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                          {title}
                        </h3>
                        {excerpt && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                            {excerpt}
                          </p>
                        )}
                        <Link href={`/blog/${slug}`} className="inline-flex items-center text-[var(--primary)] font-semibold hover:text-[var(--primary-dark)] dark:hover:text-white transition-colors mt-auto">
                          {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                          <ArrowLeft size={16} className="mr-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Carousel Controls */}
          <div className="flex justify-center gap-4 mt-12">
            <button 
              onClick={scrollPrev} 
              disabled={!canScrollPrev}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${!canScrollPrev ? 'border-gray-200 text-gray-300 dark:border-gray-800 dark:text-gray-700 cursor-not-allowed' : 'border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white shadow-md'}`}
            >
              <ChevronRight size={24} />
            </button>
            <button 
              onClick={scrollNext} 
              disabled={!canScrollNext}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${!canScrollNext ? 'border-gray-200 text-gray-300 dark:border-gray-800 dark:text-gray-700 cursor-not-allowed' : 'border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white shadow-md'}`}
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
