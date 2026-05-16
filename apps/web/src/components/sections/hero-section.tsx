'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { Calendar, ChevronRight, ChevronLeft, Edit, Star, Award, Stethoscope, Users } from 'lucide-react';
import { useEditor } from '@/context/editor-context';
import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Slide {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  isPortrait: boolean;
}

// ── Fallback static hero when DB has no slides ─────────────────────────────
function StaticHero({ t, locale }: { t: any; locale: string }) {
  const stats = [
    { icon: Stethoscope, value: '5000+', label: locale === 'ar' ? 'عملية ناجحة' : 'Surgeries' },
    { icon: Users, value: '15+', label: locale === 'ar' ? 'سنة خبرة' : 'Years Exp.' },
    { icon: Award, value: '40+', label: locale === 'ar' ? 'بحث علمي' : 'Publications' },
  ];

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-[#0a192f] flex items-center">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--primary)]/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("max-w-4xl", locale === 'ar' ? "text-right" : "text-left")}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-8">
            <Star size={14} className="fill-[var(--accent)]" />
            {locale === 'ar' ? 'رعاية طبية عالمية' : 'World Class Care'}
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl mb-8">
            {locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}
          </h1>
          <p className={cn(
            "text-xl sm:text-2xl text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-lg mb-10",
            locale === 'ar' ? "border-r-4 pr-6 border-[var(--accent)]" : "border-l-4 pl-6 border-[var(--accent)]"
          )}>
            {locale === 'ar'
              ? 'أستاذ واستشاري جراحة المسالك البولية والكلى والمناظير والذكورة'
              : 'Professor & Consultant of Urology, Kidney Surgery, Endoscopy, and Andrology'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/booking">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                <Calendar size={20} />
                {t('cta')}
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm">
                {t('learnMore')}
              </Button>
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="flex flex-wrap gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
                <stat.icon size={20} className="text-[var(--accent)]" />
                <div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/60 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Hero Section ────────────────────────────────────────────────────────
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
    return <section className="h-[90vh] min-h-[600px] w-full bg-[#0a192f] animate-pulse" />;
  }

  // ── Fallback when no slides in DB ────────────────────────────────────────
  if (slides.length === 0) {
    return <StaticHero t={t} locale={locale} />;
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
          <div className={cn(
            "absolute inset-0 z-10",
            locale === 'ar'
              ? "bg-gradient-to-r from-black/85 via-black/50 to-transparent"
              : "bg-gradient-to-l from-black/85 via-black/50 to-transparent"
          )} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

          {slides[currentSlide].isPortrait ? (
            <div className="absolute inset-0 w-full h-full">
              <div
                className={cn(
                  "absolute inset-y-0 w-full lg:w-[60%] z-0",
                  locale === 'ar' ? "right-0" : "left-0"
                )}
                style={{
                  maskImage: `linear-gradient(to ${locale === 'ar' ? 'right' : 'left'}, transparent 0%, black 35%, black 100%)`,
                  WebkitMaskImage: `linear-gradient(to ${locale === 'ar' ? 'right' : 'left'}, transparent 0%, black 35%, black 100%)`
                }}
              >
                <motion.img
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src={getMediaUrl(slides[currentSlide].image)}
                  alt={locale === 'ar' ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                    locale === 'ar' ? "object-right lg:object-right-bottom" : "object-left lg:object-left-bottom"
                  )}
                />
              </div>
              <div className={cn(
                "absolute inset-0 z-10",
                locale === 'ar'
                  ? "bg-gradient-to-r from-black/90 via-black/40 to-transparent"
                  : "bg-gradient-to-l from-black/90 via-black/40 to-transparent"
              )} />
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
        <div className={cn("absolute top-24 z-50", locale === 'ar' ? "right-8" : "left-8")}>
          <Link href="/admin/hero-slides">
            <Button className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 gap-2">
              <Edit size={16} />
              {locale === 'ar' ? 'تعديل السلايدر' : 'Edit Slides'}
            </Button>
          </Link>
        </div>
      )}

      <div className="relative z-20 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("max-w-4xl", locale === 'ar' ? "text-right" : "text-left")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-8">
                <Star size={14} className="fill-[var(--accent)]" />
                {locale === 'ar' ? 'رعاية طبية عالمية' : 'World Class Care'}
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl mb-8">
                {locale === 'ar' ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
              </h1>
              <p className={cn(
                "text-xl sm:text-2xl text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-lg",
                locale === 'ar' ? "border-r-4 pr-6 border-[var(--accent)]" : "border-l-4 pl-6 border-[var(--accent)]"
              )}>
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
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm">
                    {t('learnMore')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-center gap-4">
          <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-sm transition-all">
            {locale === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
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
            {locale === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
      )}
    </section>
  );
}
