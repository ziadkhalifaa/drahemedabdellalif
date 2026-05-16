'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Target, Eye, Shield, Award, Users, Activity, Stethoscope, CheckCircle2, BookOpen, GraduationCap, Microscope, Star } from 'lucide-react';
import { EditableText, EditableImage } from '@/components/editor/editable-components';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

const featureColors = [
  { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
];

export function AboutContent() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const stats = [
    { icon: Stethoscope, value: '5,000+', labelAr: 'عملية ناجحة', labelEn: 'Surgeries' },
    { icon: Users, value: '10,000+', labelAr: 'مريض بالسنة', labelEn: 'Patients/Year' },
    { icon: BookOpen, value: '40+', labelAr: 'بحث علمي', labelEn: 'Publications' },
    { icon: GraduationCap, value: '20+', labelAr: 'رسالة إشراف', labelEn: 'Supervised Theses' },
  ];

  const features = [
    { titleAr: 'أحدث التقنيات', titleEn: 'Latest Technology', descAr: 'نستخدم أحدث أجهزة الليزر والمناظير المرنة العالمية.', descEn: 'We use the latest laser devices and global flexible endoscopes.' },
    { titleAr: 'أمان تام', titleEn: 'Complete Safety', descAr: 'نطبق أعلى معايير التعقيم والجودة الطبية العالمية.', descEn: 'We apply the highest sterilization and global medical quality standards.' },
    { titleAr: 'رعاية مخصصة', titleEn: 'Personalized Care', descAr: 'كل مريض يحصل على خطة علاجية مخصصة لحالته.', descEn: 'Every patient receives a personalized treatment plan.' },
    { titleAr: 'خبرة أكاديمية', titleEn: 'Academic Expertise', descAr: 'أستاذ جامعي بخبرة تزيد عن 20 عاماً في المجال.', descEn: 'A university professor with over 20 years of expertise.' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050e1a]">

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[var(--primary)]/15 rounded-full blur-[150px]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("grid lg:grid-cols-2 gap-16 items-center", isAr ? "" : "")}>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: isAr ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className={cn(isAr ? "order-2 text-right" : "order-1 text-left")}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-8">
                  <Star size={14} className="fill-[var(--accent)]" />
                  {isAr ? 'نبذة عن الطبيب' : 'About the Doctor'}
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                  <EditableText contentKey="about.hero.title" defaultAr={t('title')} defaultEn={t('title')} />
                </h1>
                <div className={cn("w-20 h-1.5 bg-[var(--accent)] rounded-full mb-8", isAr ? "" : "")} />
                <p className="text-white/60 text-xl leading-relaxed mb-12">
                  <EditableText contentKey="about.hero.desc" defaultAr={t('description')} defaultEn={t('description')} />
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                        <s.icon size={18} />
                      </div>
                      <div>
                        <div className="text-xl font-black text-white">{s.value}</div>
                        <div className="text-xs text-white/50">{isAr ? s.labelAr : s.labelEn}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className={cn("relative", isAr ? "order-1" : "order-2")}
              >
                <div className="absolute -inset-6 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 rounded-[3rem] blur-3xl z-0" />
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl z-10 aspect-[4/5]">
                  <EditableImage
                    contentKey="about.hero.image"
                    defaultSrc="/images/clinic.png"
                    alt="Dr. Ahmed Abdellatif Clinic"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Mission / Vision / Values ──────────────────── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("text-center mb-16")}>
              <h2 className="text-4xl font-black text-white mb-4">
                {isAr ? 'رسالتنا، رؤيتنا، قيمنا' : 'Our Mission, Vision & Values'}
              </h2>
              <div className="w-20 h-1.5 bg-[var(--accent)] rounded-full mx-auto" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Target, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10 border-[var(--primary)]/20', titleKey: 'about.mission.title', titleDef: t('mission.title'), contentKey: 'about.mission.content', contentDef: t('mission.content') },
                { icon: Eye, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10 border-[var(--accent)]/20', titleKey: 'about.vision.title', titleDef: t('vision.title'), contentKey: 'about.vision.content', contentDef: t('vision.content') },
                { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', titleKey: 'about.values.title', titleDef: t('values.title'), contentKey: null, contentDef: null },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={cn(
                    "p-8 rounded-[2rem] border backdrop-blur-md space-y-5 bg-white/5",
                    card.bg,
                    isAr ? "text-right" : "text-left"
                  )}
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", card.bg, isAr ? "mr-auto" : "")}>
                    <card.icon size={26} className={card.color} />
                  </div>
                  <h3 className="text-xl font-black text-white">
                    <EditableText contentKey={card.titleKey} defaultAr={card.titleDef} defaultEn={card.titleDef} />
                  </h3>
                  {card.contentKey ? (
                    <p className="text-white/60 leading-relaxed text-sm">
                      <EditableText contentKey={card.contentKey} defaultAr={card.contentDef!} defaultEn={card.contentDef!} />
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {(t.raw('values.items') as string[]).map((item, idx) => (
                        <li key={idx} className={cn("flex items-center gap-3 text-sm text-white/60", isAr ? "flex-row-reverse" : "")}>
                          <CheckCircle2 size={15} className={card.color} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">
                {isAr ? 'لماذا يثق بنا آلاف المرضى؟' : 'Why Do Thousands of Patients Trust Us?'}
              </h2>
              <div className="w-20 h-1.5 bg-[var(--primary)] rounded-full mx-auto" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => {
                const { icon: Icon, color, bg } = featureColors[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn("p-7 rounded-[1.75rem] border bg-white/5 backdrop-blur-md text-center space-y-4 hover:-translate-y-2 transition-transform duration-300", bg)}
                  >
                    <div className={cn("mx-auto w-14 h-14 rounded-2xl flex items-center justify-center border", bg)}>
                      <Icon size={24} className={color} />
                    </div>
                    <h4 className="font-black text-white text-lg">{isAr ? f.titleAr : f.titleEn}</h4>
                    <p className="text-white/50 text-sm leading-relaxed">{isAr ? f.descAr : f.descEn}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black text-white mb-6">
              {isAr ? 'ابدأ رحلتك الصحية اليوم' : 'Start Your Health Journey Today'}
            </h2>
            <Link href="/booking">
              <button className="h-16 px-12 text-lg bg-[var(--accent)] hover:bg-[#eab531]/90 text-black font-black rounded-2xl shadow-2xl shadow-[var(--accent)]/20 transition-all hover:-translate-y-1">
                {isAr ? 'احجز موعداً الآن' : 'Book an Appointment Now'}
              </button>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
