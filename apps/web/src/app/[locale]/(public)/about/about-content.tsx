'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, SectionHeader, Card } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Target, Eye, Shield, Award, Users, Activity, Stethoscope, CheckCircle2 } from 'lucide-react';
import { EditableText, EditableImage } from '@/components/editor/editable-components';

export function AboutContent() {
  const t = useTranslations('about');

  const stats = [
    { icon: Award, key: 'experience', value: '20+' },
    { icon: Users, key: 'patients', value: '10,000+' },
    { icon: Activity, key: 'surgeries', value: '5,000+' },
    { icon: Stethoscope, key: 'awards', value: '50+' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-[var(--primary)]/5 to-transparent">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-6xl mb-6">
                <EditableText contentKey="about.hero.title" defaultAr={t('title')} defaultEn={t('title')} />
              </h1>
              <p className="text-xl leading-relaxed text-[var(--muted)]">
                <EditableText contentKey="about.hero.desc" defaultAr={t('description')} defaultEn={t('description')} />
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.key} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[var(--primary)]">
                      <stat.icon size={20} />
                      <span className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">{t(stat.key)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-[var(--primary)]/10 border-4 border-white/20"
            >
              <EditableImage 
                contentKey="about.hero.image" 
                defaultSrc="/images/clinic.png" 
                alt="Dr. Ahmed Abdellatif Clinic" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-dark)]/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </Section>

        {/* Mission & Vision */}
        <Section id="mission" className="bg-[var(--card)]/50">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-8 space-y-4 border-t-4 border-t-[var(--primary)]">
                <div className="h-12 w-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold">
                  <EditableText contentKey="about.mission.title" defaultAr={t('mission.title')} defaultEn={t('mission.title')} />
                </h3>
                <p className="text-[var(--muted)] leading-relaxed">
                  <EditableText contentKey="about.mission.content" defaultAr={t('mission.content')} defaultEn={t('mission.content')} />
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full p-8 space-y-4 border-t-4 border-t-[var(--accent)]">
                <div className="h-12 w-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-bold">
                  <EditableText contentKey="about.vision.title" defaultAr={t('vision.title')} defaultEn={t('vision.title')} />
                </h3>
                <p className="text-[var(--muted)] leading-relaxed">
                  <EditableText contentKey="about.vision.content" defaultAr={t('vision.content')} defaultEn={t('vision.content')} />
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full p-8 space-y-4 border-t-4 border-t-[var(--primary-light)]">
                <div className="h-12 w-12 rounded-full bg-[var(--primary-light)]/10 flex items-center justify-center text-[var(--primary-light)]">
                  <Shield size={24} />
                </div>
                <h3 className="text-2xl font-bold">
                   <EditableText contentKey="about.values.title" defaultAr={t('values.title')} defaultEn={t('values.title')} />
                </h3>
                <ul className="space-y-3">
                  {(t.raw('values.items') as string[]).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                      <CheckCircle2 size={16} className="text-[var(--primary)]" />
                      <EditableText contentKey={`about.values.item.${idx}`} defaultAr={item} defaultEn={item} />
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </Section>

        {/* Why Us Section */}
        <Section>
          <SectionHeader 
            title={<EditableText contentKey="about.stats.title" defaultAr={t('experience')} defaultEn={t('experience')} />} 
            subtitle={<EditableText contentKey="about.stats.subtitle" defaultAr="لماذا يثق بنا آلاف المرضى؟" defaultEn="Why do thousands of patients trust us?" />} 
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {[
               { icon: Activity, titleKey: 'about.feature1.title', titleDef: 'أحدث التقنيات', descKey: 'about.feature1.desc', descDef: 'نستخدم أحدث أجهزة الليزر والمناظير المرنة العالمية.', color: 'blue' },
               { icon: Shield, titleKey: 'about.feature2.title', titleDef: 'أمان تام', descKey: 'about.feature2.desc', descDef: 'نطبق أعلى معايير التعقيم والجودة الطبية العالمية.', color: 'green' },
               { icon: Users, titleKey: 'about.feature3.title', titleDef: 'رعاية مخصصة', descKey: 'about.feature3.desc', descDef: 'كل مريض يحصل على خطة علاجية مخصصة لحالته.', color: 'purple' },
               { icon: Award, titleKey: 'about.feature4.title', titleDef: 'خبرة أكاديمية', descKey: 'about.feature4.desc', descDef: 'أستاذ جامعي بخبرة تزيد عن 20 عاماً في المجال.', color: 'orange' },
             ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-4">
                <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600`}>
                  <feature.icon size={24} />
                </div>
                <h4 className="font-bold">
                  <EditableText contentKey={feature.titleKey} defaultAr={feature.titleDef} defaultEn={feature.titleDef} />
                </h4>
                <p className="text-sm text-[var(--muted)]">
                  <EditableText contentKey={feature.descKey} defaultAr={feature.descDef} defaultEn={feature.descDef} />
                </p>
              </div>
             ))}
          </div>
        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
