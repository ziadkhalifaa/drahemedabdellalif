'use client';

import { motion } from 'framer-motion';
import { CountUp } from '@/components/ui/count-up';
import { Users, Activity, Award, BookOpen } from 'lucide-react';
import { EditableText } from '@/components/editor/editable-components';
import { TiltCard, StaggerContainer, StaggerItem, FloatingOrbs } from '@/components/motion/motion-utils';

const stats = [
  {
    id: 1,
    icon: Activity,
    value: 5000,
    suffix: '+',
    titleAr: 'عمليات المسالك البولية',
    titleEn: 'Urological Surgeries',
    descAr: 'للأطفال والبالغين بأقل تدخل جراحي وأسرع تعافي.',
    descEn: 'For children and adults with minimal surgical intervention and fastest recovery.'
  },
  {
    id: 2,
    icon: BookOpen,
    value: 40,
    suffix: '+',
    titleAr: 'أبحاث علمية',
    titleEn: 'Scientific Research',
    descAr: 'منشورة في أرفع المجلات العلمية في تخصص المسالك البولية عالميًا.',
    descEn: 'Published in the most prestigious scientific journals in urology worldwide.'
  },
  {
    id: 3,
    icon: Award,
    value: 20,
    suffix: '+',
    titleAr: 'إشراف أكاديمي',
    titleEn: 'Academic Supervision',
    descAr: 'الإشراف على رسائل ماجستير ودكتوراه في مجالات علاج البروستاتا.',
    descEn: 'Supervision of Master and PhD theses in prostate treatment fields.'
  },
  {
    id: 4,
    icon: Users,
    value: 15,
    suffix: '+',
    titleAr: 'سنوات من الخبرة',
    titleEn: 'Years of Experience',
    descAr: 'في تقديم أفضل رعاية طبية لمرضى المسالك البولية.',
    descEn: 'In providing the best medical care for urology patients.'
  }
];

export function StatisticsSection() {
  return (
    <section className="relative py-28 overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop')" }}>
      <div className="absolute inset-0 bg-[#0a192f]/90 mix-blend-multiply z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-0" />
      <FloatingOrbs count={4} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {stats.map((stat, index) => (
            <StaggerItem key={stat.id}>
              <TiltCard tiltDegree={8} glare={false} className="h-full">
                <div className="flex flex-col items-center h-full p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.06] transition-colors duration-300">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  >
                    <stat.icon size={36} className="text-[var(--accent)]" />
                  </motion.div>

                  <div className="text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight">
                    <CountUp to={stat.value} duration={2.5} className="font-sans" />
                    <span className="text-[var(--accent)]">{stat.suffix}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 mt-4">
                    <EditableText contentKey={`home.stats.${stat.id}.title`} defaultAr={stat.titleAr} defaultEn={stat.titleEn} />
                  </h3>

                  <div className="text-gray-300 leading-relaxed text-sm max-w-[250px]">
                    <EditableText contentKey={`home.stats.${stat.id}.desc`} defaultAr={stat.descAr} defaultEn={stat.descEn} />
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '60%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent mt-6 rounded-full"
                  />
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
