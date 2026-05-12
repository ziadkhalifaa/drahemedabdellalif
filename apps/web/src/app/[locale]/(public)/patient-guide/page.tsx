'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, SectionHeader, Card, Accordion, AccordionItem } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { BookOpen, ClipboardCheck, Info, HeartPulse, ShieldAlert, CheckCircle2, Phone, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLINIC_PHONE } from '@dr-ahmed/shared';
import { useState } from 'react';

export default function PatientGuidePage() {
  const t = useTranslations('patientGuide');
  const [searchTerm, setSearchTerm] = useState('');

  const guides = [
    {
      icon: ClipboardCheck,
      title: t('prep'),
      color: 'blue',
      items: t.raw('items.prep')
    },
    {
      icon: HeartPulse,
      title: t('postOp'),
      color: 'green',
      items: t.raw('items.postOp')
    },
    {
      icon: ShieldAlert,
      title: t('prevention'),
      color: 'orange',
      items: t.raw('items.prevention')
    }
  ];

  const filteredGuides = guides.map(g => ({
    ...g,
    items: g.items.filter((item: string) => 
      item.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(g => g.items.length > 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <Section className="bg-gradient-to-b from-[var(--primary)]/5 to-transparent pb-0">
          <SectionHeader title={t('title')} subtitle={t('subtitle')} />
          
          <div className="mx-auto max-w-4xl mb-12">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search for medical instructions..."
                className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 font-bold text-lg shadow-xl shadow-[var(--primary)]/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section className="pt-0">
          <div className="mx-auto max-w-4xl">
            <Accordion>
              {filteredGuides.map((guide, i) => (
                <AccordionItem
                  key={i}
                  title={guide.title}
                  icon={guide.icon}
                  className="bg-[var(--card)] mb-4 rounded-3xl border border-[var(--border)]"
                >
                  <ul className="space-y-4 px-6 py-2">
                    {guide.items.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] group/item transition-all hover:border-[var(--primary)]/30">
                        <div className={cn(
                          "mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-white",
                          guide.color === 'blue' ? "bg-blue-500" : guide.color === 'green' ? "bg-green-500" : "bg-orange-500"
                        )}>
                          <CheckCircle2 size={14} />
                        </div>
                        <span className="text-base font-bold text-[var(--foreground)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-[var(--border)] px-6">
                     <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-all">
                        <ClipboardCheck size={18} />
                        {t('downloadPdf')}
                     </button>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* Emergency Section */}
        <Section className="py-20">
           <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 p-10 rounded-3xl flex flex-col md:flex-row items-center gap-8 border-2 border-dashed ltr:md:flex-row-reverse">
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 shrink-0 animate-pulse">
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-4 text-center md:text-right ltr:md:text-left flex-1">
                 <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">{t('emergency.title')}</h2>
                 <p className="text-red-600/80 max-w-3xl leading-relaxed">
                   {t('emergency.description')}
                 </p>
                 <div className="pt-2">
                    <a href={`tel:${CLINIC_PHONE}`} className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                       <Phone size={18} />
                       {t('emergency.button')}
                    </a>
                 </div>
              </div>
           </Card>
        </Section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}


