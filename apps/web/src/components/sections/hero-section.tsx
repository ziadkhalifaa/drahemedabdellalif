'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { Calendar, ChevronRight, ChevronLeft, Edit, Star, Award, Stethoscope, Users } from 'lucide-react';
import { useEditor } from '@/context/editor-context';
import useSWR from 'swr';
import { api, getMediaUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { FloatingOrbs, TextReveal, MagneticButton } from '@/components/motion/motion-utils';

interface Slide {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  isPortrait: boolean;
}

function HeroTilt({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [4, -4]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-4, 4]), { damping: 30, stiffness: 200 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => { x.set(0.5); y.set(0.5); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, perspective: 1200, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaticHero({ t, locale }: { t: any; locale: string }) {
  const isAr = locale === 'ar';
  const stats = [
    { icon: Stethoscope, value: '5000+', label: isAr ? 'عملية ناجحة' : 'Surgeries' },
    { icon: Users, value: '15+', label: isAr ? 'سنة خبرة' : 'Years Exp.' },
    { icon: Award, value: '40+', label: isAr ? 'بحث علمي' : 'Publications' },
  ];

  return (
    <section className="relative min-h-[600px] lg:h-[90vh] lg:min-h-[700px] w-full overflow-hidden bg-[#0a192f] flex items-center pt-28 pb-16 lg:py-0">
      <FloatingOrbs count={6} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroTilt className={cn("max-w-4xl", isAr ? "text-right" : "text-left")}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-6 lg:mb-8">
              <Star size={14} className="fill-[var(--accent)]" />
              {isAr ? 'رعاية طبية عالمية' : 'World Class Care'}
            </div>
          </motion.div>

          <motion.div style={{ transformStyle: 'preserve-3d', transform: 'translateZ(50px)' }}>
            <TextReveal
              text={isAr ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.15] lg:leading-[1.1] tracking-tight drop-shadow-2xl mb-6 lg:mb-8"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}
            className={cn(
              "text-lg sm:text-xl lg:text-2xl text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-lg mb-8 lg:mb-10",
              isAr ? "border-r-4 pr-6 border-[var(--accent)]" : "border-l-4 pl-6 border-[var(--accent)]"
            )}
          >
            {isAr
              ? 'أستاذ واستشاري جراحة المسالك البولية والكلى والمناظير والذكورة'
              : 'Professor & Consultant of Urology, Kidney Surgery, Endoscopy, and Andrology'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 mb-10 lg:mb-16"
            style={{ transformStyle: 'preserve-3d', transform: 'translateZ(40px)' }}
          >
            <MagneticButton as="a" href="/booking">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                <Calendar size={20} />
                {t('cta')}
              </Button>
            </MagneticButton>
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm">
                {t('learnMore')}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="flex flex-wrap gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 + i * 0.15 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl"
              >
                <stat.icon size={20} className="text-[var(--accent)]" />
                <div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/60 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </HeroTilt>
      </div>
    </section>
  );
}

export function HeroSection({ fallbackData }: { fallbackData?: Slide[] }) {
  const t = useTranslations('hero');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { isEditing } = useEditor();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: slidesData, isLoading } = useSWR<Slide[]>('/hero-slides', api.get, { fallbackData });
  const slides = slidesData && slidesData.length > 0 ? slidesData : [];

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (isLoading) {
    return <section className="h-[90vh] min-h-[600px] w-full bg-[#0a192f] animate-pulse" />;
  }

  if (slides.length === 0) {
    return <StaticHero t={t} locale={locale} />;
  }

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, scale: 1.08, x: dir > 0 ? (isAr ? -100 : 100) : (isAr ? 100 : -100), filter: 'blur(6px)' }),
    center: { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' },
    exit: (dir: number) => ({ opacity: 0, scale: 0.95, x: dir > 0 ? (isAr ? 100 : -100) : (isAr ? -100 : 100), filter: 'blur(4px)' }),
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[600px] lg:h-[90vh] lg:min-h-[700px] w-full overflow-hidden bg-black flex items-center pt-28 pb-20 lg:py-0"
    >
      <FloatingOrbs count={4} />

      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentSlide}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
        >
          <div className={cn(
            "absolute inset-0 z-10",
            isAr
              ? "bg-gradient-to-r from-black/85 via-black/50 to-transparent"
              : "bg-gradient-to-l from-black/85 via-black/50 to-transparent"
          )} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

          {slides[currentSlide].isPortrait ? (
            <div className="absolute inset-0 w-full h-full">
              <div
                className={cn(
                  "absolute inset-y-0 w-full lg:w-[60%] z-0",
                  isAr ? "right-0" : "left-0"
                )}
                style={{
                  maskImage: `linear-gradient(to ${isAr ? 'right' : 'left'}, transparent 0%, black 35%, black 100%)`,
                  WebkitMaskImage: `linear-gradient(to ${isAr ? 'right' : 'left'}, transparent 0%, black 35%, black 100%)`
                }}
              >
                <motion.img
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src={getMediaUrl(slides[currentSlide].image)}
                  alt={isAr ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
                  className={cn(
                    "w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                    isAr ? "object-right lg:object-right-bottom" : "object-left lg:object-left-bottom"
                  )}
                />
              </div>
              <div className={cn(
                "absolute inset-0 z-10",
                isAr
                  ? "bg-gradient-to-r from-black/90 via-black/40 to-transparent"
                  : "bg-gradient-to-l from-black/90 via-black/40 to-transparent"
              )} />
            </div>
          ) : (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: 'easeOut' }}
              src={getMediaUrl(slides[currentSlide].image)}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {isEditing && (
        <div className={cn("absolute top-24 z-50", isAr ? "right-8" : "left-8")}>
          <Link href="/admin/hero-slides">
            <Button className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 gap-2">
              <Edit size={16} />
              {isAr ? 'تعديل السلايدر' : 'Edit Slides'}
            </Button>
          </Link>
        </div>
      )}

      <div className="relative z-20 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroTilt className={cn("max-w-4xl", isAr ? "text-right" : "text-left")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: 10 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-6 lg:mb-8">
                  <Star size={14} className="fill-[var(--accent)]" />
                  {isAr ? 'رعاية طبية عالمية' : 'World Class Care'}
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(50px)' }}
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.15] lg:leading-[1.1] tracking-tight drop-shadow-2xl mb-6 lg:mb-8"
              >
                {isAr ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}
                className={cn(
                  "text-lg sm:text-xl lg:text-2xl text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-lg",
                  isAr ? "border-r-4 pr-6 border-[var(--accent)]" : "border-l-4 pl-6 border-[var(--accent)]"
                )}
              >
                {isAr ? slides[currentSlide].subtitleAr : slides[currentSlide].subtitleEn}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-6 lg:mt-10 flex flex-col sm:flex-row gap-4"
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(40px)' }}
              >
                {currentSlide === 0 ? (
                  <>
                    <MagneticButton as="a" href="/booking">
                      <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                        <Calendar size={20} />
                        {isAr ? 'احجز موعدك الآن' : 'Book Appointment'}
                      </Button>
                    </MagneticButton>
                    <Link href="/about">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm">
                        {isAr ? 'تعرف علينا' : 'About Us'}
                      </Button>
                    </Link>
                  </>
                ) : currentSlide === 1 ? (
                  <>
                    <MagneticButton as="a" href="/services">
                      <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                        <Calendar size={20} />
                        {isAr ? 'خدماتنا العلاجية' : 'Our Services'}
                      </Button>
                    </MagneticButton>
                    <Link href="/techniques">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm">
                        {isAr ? 'التقنيات العلاجية' : 'Treatment Techniques'}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <MagneticButton as="a" href="/testimonials">
                      <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                        <Calendar size={20} />
                        {isAr ? 'آراء المرضى' : 'Patient Reviews'}
                      </Button>
                    </MagneticButton>
                    <Link href="/booking">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm">
                        {isAr ? 'اتصل بنا' : 'Contact Us'}
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </HeroTilt>
      </div>

      {/* Carousel Controls */}
      {slides.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-center gap-4"
        >
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-sm transition-all"
          >
            {isAr ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </motion.button>
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
          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 backdrop-blur-sm transition-all"
          >
            {isAr ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}
