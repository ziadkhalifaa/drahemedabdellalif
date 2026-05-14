'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2000&auto=format&fit=crop', // High quality clinic/doctor image
    title: 'الريادة في جراحات المسالك البولية',
    subtitle: 'الأستاذ الدكتور انمار محمد حبيب، خبرة عالمية وتقنيات حديثة لعلاج المسالك البولية بأقل تدخل جراحي وأسرع تعافي.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop', // Surgery/Tech image
    title: 'أحدث التقنيات الطبية',
    subtitle: 'نستخدم تقنيات متطورة مثل الهولميوم ليزر والريزيوم لعلاج تضخم البروستاتا بفعالية وأمان تام.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2000&auto=format&fit=crop', // Patient care image
    title: 'رعاية فائقة وقصص نجاح',
    subtitle: 'آلاف الحالات الناجحة التي استعادت جودة حياتها بفضل الرعاية الطبية المتميزة والتشخيص الدقيق.',
  }
];

export function HeroSection() {
  const t = useTranslations('hero');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

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
          <img
            src={slides[currentSlide].image}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

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
                {slides[currentSlide].title}
              </h1>
              <p className="mt-6 text-lg sm:text-2xl text-white/90 max-w-2xl leading-relaxed font-light drop-shadow-md">
                {slides[currentSlide].subtitle}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-bold gap-2 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                    <Calendar size={20} />
                    احجز موعدك الآن
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white text-white hover:bg-white hover:text-black rounded-xl transition-all">
                    تصفح خدماتنا
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
