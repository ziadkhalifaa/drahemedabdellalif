'use client';

import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { useLocale, useTranslations } from 'next-intl';

interface Service {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string | null;
}

export function ServicesCarouselSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl', align: 'start' }, [Autoplay({ delay: 4000 })]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const locale = useLocale();

  const { data: servicesData, isLoading } = useSWR<Service[]>('/services', api.get);
  const services = servicesData && servicesData.length > 0 ? servicesData : [];

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

  if (isLoading) {
    return <section className="py-24 bg-white dark:bg-[#0a0a0a] min-h-[600px] animate-pulse" />;
  }

  if (services.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-extrabold text-[var(--primary-dark)] dark:text-white mb-4"
            >
              الخدمات الطبية المتميزة
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, w: 0 }}
              whileInView={{ opacity: 1, w: 96 }}
              viewport={{ once: true }}
              className="w-24 h-1 bg-[var(--accent)] rounded-full mb-6" 
            />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              نقدم مجموعة متكاملة من أحدث الخدمات الطبية المتخصصة في جراحة المسالك البولية للبالغين والأطفال، معتمدين على تقنيات غير جراحية لتحقيق أعلى معدلات النجاح.
            </p>
          </div>
          
          <div className="hidden md:flex gap-3 mt-6 md:mt-0">
            <button 
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
            >
              <ChevronRight size={24} />
            </button>
            <button 
              onClick={scrollNext}
              className="w-12 h-12 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)] flex items-center justify-center text-white hover:bg-[var(--primary-dark)] transition-all shadow-md"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="embla overflow-hidden" 
          ref={emblaRef}
        >
          <div className="embla__container flex -ml-4 rtl:-ml-0 rtl:-mr-4">
            {services.map((service) => (
              <div className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 rtl:pl-0 rtl:pr-4" key={service.id}>
                <div className="relative group rounded-3xl overflow-hidden h-[400px] shadow-lg bg-gray-100 dark:bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/95" />
                  {service.image && (
                    <img 
                      src={getMediaUrl(service.image)} 
                      alt={locale === 'ar' ? service.titleAr : service.titleEn}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {locale === 'ar' ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="text-gray-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                      {locale === 'ar' ? service.descriptionAr : service.descriptionEn}
                    </p>
                    <Link href={`/services/${service.id}`} className="inline-flex items-center text-[var(--accent)] font-semibold hover:text-white transition-colors opacity-0 group-hover:opacity-100 duration-300 delay-200">
                      تفاصيل الخدمة
                      <ChevronLeft size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Mobile Controls */}
        <div className="flex md:hidden justify-center gap-4 mt-10">
          <button onClick={scrollPrev} className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500">
            <ChevronRight size={24} />
          </button>
          <button onClick={scrollNext} className="w-12 h-12 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)] flex items-center justify-center text-white shadow-md">
            <ChevronLeft size={24} />
          </button>
        </div>

      </div>
    </section>
  );
}
