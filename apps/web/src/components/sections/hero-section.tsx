'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { Calendar, ChevronRight, ChevronLeft, Edit } from 'lucide-react';
import { useEditor } from '@/context/editor-context';
import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';

interface Slide {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  isPortrait: boolean;
}

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const { isEditing } = useEditor();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slidesData, isLoading } = useSWR<Slide[]>('/hero-slides', api.get);
  const slides = slidesData && slidesData.length > 0 ? slidesData : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (isLoading) {
    return <section className="h-[90vh] min-h-[600px] w-full bg-black animate-pulse" />;
  }

  if (slides.length === 0) {
    return null; // or a fallback static hero
  }

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-black flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-dark)]/90 via-transparent to-transparent z-10" />
          
          {slides[currentSlide].isPortrait ? (
            <div className="absolute inset-0 w-full h-full">
              <div 
                className="absolute inset-y-0 right-0 w-full lg:w-[60%] z-0"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 35%, black 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%, black 100%)'
                }}
              >
                <motion.img
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src={getMediaUrl(slides[currentSlide].image)}
                  alt={locale === 'ar' ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
                  className="w-full h-full object-contain object-right lg:object-right-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
            </div>
          ) : (
            <img
              src={getMediaUrl(slides[currentSlide].image)}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {isEditing && (
        <div className="absolute top-24 right-8 z-50">
          <Link href="/admin/hero-slides">
            <Button className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 gap-2">
              <Edit size={16} />
              {locale === 'ar' ? 'تعديل السلايدر' : 'Edit Slides'}
            </Button>
          </Link>
        </div>
      )}

      <div className="relative z-20 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                {locale === 'ar' ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
              </h1>
              <p className="mt-6 text-lg sm:text-2xl text-white/90 max-w-2xl leading-relaxed font-light drop-shadow-md">
                {locale === 'ar' ? slides[currentSlide].subtitleAr : slides[currentSlide].subtitleEn}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                    <Calendar size={20} />
                    {t('cta')}
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white text-white hover:bg-white hover:text-black rounded-xl transition-all">
                    {t('learnMore')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-center gap-4">
        <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-sm transition-all">
          <ChevronRight size={24} />
        </button>
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentSlide ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
        <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-sm transition-all">
          <ChevronLeft size={24} />
        </button>
      </div>
    </section>
  );
}
