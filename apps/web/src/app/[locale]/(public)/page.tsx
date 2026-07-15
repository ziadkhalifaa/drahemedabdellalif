import { Metadata } from 'next';
import { getMessages, getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppWidget } from '@/components/ui/whatsapp-widget';
import { HeroSection } from '@/components/sections/hero-section';
import { CoreTechniquesSection } from '@/components/sections/core-techniques-section';
import { AboutSection } from '@/components/sections/about-section';
import { StatisticsSection } from '@/components/sections/statistics-section';
import { ServicesCarouselSection } from '@/components/sections/services-carousel-section';
import { SurgicalTipsSection } from '@/components/sections/surgical-tips-section';
import { WhyUsSection } from '@/components/sections/why-us-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { BookingCTASection } from '@/components/sections/booking-cta-section';
import { BookingForm } from '@/components/sections/booking-form';
import { api } from '@/lib/api';

import { Stethoscope, Zap, ShieldCheck, Headphones } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, FloatingOrbs } from '@/components/motion/motion-utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages: any = await getMessages({ locale });
  const t = messages.hero;

  const title = `${t.title} | ${t.subtitle}`;
  const description = t.description;
  const baseUrl = 'https://drahmedabdellatif.com';

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ar': '/ar',
        'en': '/en',
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif',
      images: [
        {
          url: `${baseUrl}/images/doctor.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/images/doctor.png`],
    },
  };
}


export default async function HomePage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const servicesFallback = await api.get<any[]>('/services').catch(() => []);
  const techniquesFallback = await api.get<any[]>('/techniques').catch(() => []);
  const slidesFallback = await api.get<any[]>('/hero-slides').catch(() => []);

  const bookingFeatures = isAr ? [
    { icon: Stethoscope, text: 'كشف وتشخيص دقيق بأحدث الأجهزة' },
    { icon: Zap, text: 'تقنيات ليزر متقدمة بدون جراحة تقليدية' },
    { icon: ShieldCheck, text: 'خبرة +15 سنة في جراحة المسالك البولية' },
    { icon: Headphones, text: 'متابعة ما بعد العلاج حتى الشفاء الكامل' },
  ] : [
    { icon: Stethoscope, text: 'Accurate examination and diagnosis with modern equipment' },
    { icon: Zap, text: 'Advanced laser techniques without traditional surgery' },
    { icon: ShieldCheck, text: '+15 years experience in urological surgeries' },
    { icon: Headphones, text: 'Post-treatment follow-up until complete recovery' },
  ];

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        {/* 1 - Hero */}
        <HeroSection fallbackData={slidesFallback} />
        {/* 2 - Services */}
        <ServicesCarouselSection fallbackData={servicesFallback} />
        {/* 3 - About */}
        <AboutSection />
        {/* 4 - Statistics */}
        <StatisticsSection />
        {/* 5 - Core Techniques */}
        <CoreTechniquesSection fallbackData={techniquesFallback} />
        {/* 6 - Why Us */}
        <WhyUsSection />
        {/* 7 - Testimonials */}
        <TestimonialsSection />
        {/* 8 - Booking CTA (choice section) */}
        <BookingCTASection />
        {/* 9 - Surgical Tips */}
        <SurgicalTipsSection />
        {/* 10 - Booking Form */}
        <section id="booking-section" className="relative py-28 overflow-hidden bg-[#050e1a]">
          <FloatingOrbs count={4} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">

              {/* Left: Info Column */}
              <FadeIn direction={isAr ? 'right' : 'left'} className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-8">
                  {isAr ? 'احجز الآن' : 'Book Now'}
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                  {isAr ? <>ابدأ رحلتك نحو <span className="text-[var(--accent)]">الصحة</span> اليوم</> : <>Start Your Journey to <span className="text-[var(--accent)]">Health</span> Today</>}
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-10">
                  {isAr ? 'فريقنا الطبي المتخصص جاهز للإجابة على استفساراتك وحجز موعدك في أقرب وقت ممكن.' : 'Our specialized medical team is ready to answer your inquiries and schedule your appointment as soon as possible.'}
                </p>

                <StaggerContainer className="space-y-12">
                  {bookingFeatures.map((item, i) => (
                    <StaggerItem key={i} direction="up" distance={20}>
                      <div className="group relative flex items-start gap-6 transition-all duration-500">
                        <div className="relative flex-shrink-0 mt-1">
                          <div className="w-[2px] h-full absolute left-1/2 -translate-x-1/2 bg-white/5 group-hover:bg-[var(--primary)]/20 transition-colors duration-500" />
                          <div className="w-10 h-10 rounded-full bg-[#0a192f] border border-white/10 flex items-center justify-center relative z-10 group-hover:border-[var(--primary)]/50 group-hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transition-all duration-500 animate-soft-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                            <item.icon size={18} className="text-white/40 group-hover:text-[var(--primary)] transition-colors duration-500" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h4 className="text-xl font-black text-white/90 group-hover:text-white transition-colors duration-300 mb-2">
                            {item.text}
                          </h4>
                          <div className="w-0 group-hover:w-12 h-[2px] bg-[var(--primary)] transition-all duration-500 rounded-full" />
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </FadeIn>

              {/* Right: Form */}
              <FadeIn direction={isAr ? 'left' : 'right'} delay={0.2}>
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-8 transition-transform duration-300 hover:scale-[1.01]">
                  <BookingForm />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  );
}
