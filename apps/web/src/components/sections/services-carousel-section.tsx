'use client';

import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  slug?: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string | null;
}

export function ServicesCarouselSection({ fallbackData }: { fallbackData?: Service[] }) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: isAr ? 'rtl' : 'ltr', align: 'start' },
    [Autoplay({ delay: 4500, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const { data: servicesData, isLoading } = useSWR<Service[]>('/services', api.get, { fallbackData });
  const services = servicesData && servicesData.length > 0 ? servicesData : [];

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return <section className="py-24 bg-white dark:bg-[#0a0a0a] min-h-[600px] animate-pulse" />;
  }

  if (services.length === 0) return null;

  return (
    <section className="relative py-28 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">

        {/* Header row */}
        <div className={cn(
          "flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14",
          isAr ? "text-right" : "text-left"
        )}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-5">
              <Sparkles size={14} />
              {isAr ? 'تخصصاتنا الطبية' : 'Our Medical Specialties'}
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-black text-[var(--foreground)] mb-4 leading-tight"
            >
              {isAr ? 'خدماتنا الطبية المتخصصة' : 'Our Specialized Medical Services'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[var(--muted)] text-base leading-relaxed"
            >
              {isAr
                ? 'نقدم مجموعة متكاملة من أحدث الخدمات الطبية المتخصصة في جراحة المسالك البولية للبالغين والأطفال.'
                : 'We offer a comprehensive range of the latest specialized medical services in urology for adults and children.'}
            </motion.p>
          </div>

          {/* Desktop arrows */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={scrollPrev}
              className="w-12 h-12 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all duration-200"
            >
              {isAr ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </button>
            <button
              onClick={scrollNext}
              className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white hover:bg-[var(--primary-dark)] transition-all duration-200 shadow-lg shadow-[var(--primary)]/20"
            >
              {isAr ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className={cn(
            "embla__container flex",
            isAr ? "-mr-5" : "-ml-5"
          )}>
            {services.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  "embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0",
                  isAr ? "pr-5" : "pl-5"
                )}
              >
                <Link
                  href={`/services/${service.slug || service.id}`}
                  className="group block relative rounded-[1.75rem] overflow-hidden h-[420px] shadow-xl border border-[var(--border)] hover:shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-[var(--card)]" />
                  {service.image && (
                    <img
                      src={getMediaUrl(service.image)}
                      alt={isAr ? service.titleAr : service.titleEn}
                      className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-75"
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 z-10" />

                  {/* Number */}
                  <div className="absolute top-5 left-5 z-20 w-9 h-9 rounded-xl bg-[var(--primary)] text-white text-xs font-black flex items-center justify-center shadow-lg">
                    0{index + 1}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "absolute inset-0 z-20 flex flex-col justify-end p-7 transition-transform duration-300",
                    "translate-y-6 group-hover:translate-y-0"
                  )}>
                    <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                      {isAr ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="text-gray-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-2 leading-relaxed">
                      {isAr ? service.descriptionAr : service.descriptionEn}
                    </p>
                    <div className={cn(
                      "inline-flex items-center gap-2 text-[var(--accent)] font-black text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150",
                      isAr ? "flex-row-reverse" : ""
                    )}>
                      {isAr ? 'تفاصيل الخدمة' : 'View Details'}
                      {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </div>
                  </div>

                  {/* Bottom progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
                    <div className="h-full w-0 group-hover:w-full bg-[var(--accent)] transition-all duration-500" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Dots + Mobile arrows */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={scrollPrev} className="md:hidden w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
            {isAr ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="flex gap-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === selectedIndex
                    ? "w-8 bg-[var(--primary)]"
                    : "w-2 bg-[var(--border)]"
                )}
              />
            ))}
          </div>

          <button onClick={scrollNext} className="md:hidden w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white">
            {isAr ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </section>
  );
}
