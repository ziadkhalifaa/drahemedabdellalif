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


export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <StatisticsSection />
        <CoreTechniquesSection />
        <AboutSection />
        <ServicesCarouselSection />
        <WhyUsSection />
        <SurgicalTipsSection />
        <TestimonialsSection />
        <BookingCTASection />
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-[#050505]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BookingForm />
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  );
}
