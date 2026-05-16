'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, SectionHeader, Card, Button, Input } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WHATSAPP_NUMBER, CLINIC_PHONE } from '@dr-ahmed/shared';
import { Calendar, Clock, MapPin, CheckCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';


import BookingWizard from '@/components/booking/booking-wizard';
export default function BookingPage() {
  const tNav = useTranslations('nav');
  const t = useTranslations('booking');

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-[var(--primary)]/5 to-transparent relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

        <Section>
          <div className="mb-16">
            <SectionHeader 
              title={tNav('bookAppointment')} 
              subtitle={t('subtitle')} 
            />
          </div>
          
          <div className="mx-auto">
            <BookingWizard />
          </div>
        </Section>

        {/* Floating help section */}
        <div className="mt-20 mx-auto max-w-4xl grid md:grid-cols-2 gap-6 px-4">
           <Card className="p-8 border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md hover:shadow-xl transition-all group rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <Phone size={28} />
                 </div>
                 <div>
                    <h4 className="font-bold text-lg">{t('sidebar.immediate')}</h4>
                    <p className="text-2xl font-black text-[var(--primary)] tracking-wider">{CLINIC_PHONE}</p>
                 </div>
              </div>
           </Card>

           <Card className="p-8 border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md hover:shadow-xl transition-all group rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-14 w-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                    <Calendar size={28} />
                 </div>
                 <div>
                    <h4 className="font-bold text-lg">{t('sidebar.whatsapp')}</h4>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 hover:underline">
                       {t('sidebar.chat')}
                    </a>
                 </div>
              </div>
           </Card>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}


