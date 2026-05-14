'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { EditableText, EditableImage } from '@/components/editor/editable-components';

export function AboutSection() {
  const t = useTranslations('about');

  return (
    <section id="about" className="relative py-24 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50 dark:bg-[#111] rounded-l-[100px] z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[var(--primary-dark)] dark:text-white mb-6 leading-tight">
              <EditableText 
                contentKey="about.title" 
                defaultAr="الأستاذ الدكتور انمار محمد حبيب" 
                defaultEn="Prof. Dr. Enmar Mohamed Habib" 
                as="span"
              />
            </h2>
            
            <div className="w-20 h-1.5 bg-[var(--accent)] rounded-full mb-8" />

            <div className="text-lg text-gray-600 dark:text-gray-300 leading-loose space-y-6">
              <EditableText 
                contentKey="about.description1" 
                defaultAr="أستاذ جراحة المسالك البولية ومسالك الأطفال بجامعة القاهرة وزميل جامعة ماكجيل-كندا، ورائد جراحات المسالك البولية في مصر والوطن العربي. بفضل خبرته العلمية العميقة ومهاراته الجراحية المتميزة، إلى جانب اعتماده على أحدث التقنيات الطبية مثل الهولميوم ليزر، استطاع تقديم حلول طبية مبتكرة." 
                defaultEn="Professor of Urology at Cairo University and Fellow of McGill University..." 
                as="p"
              />
              <EditableText 
                contentKey="about.description2" 
                defaultAr="يتميز بخبرته الفريدة في علاج المسالك البولية للأطفال، بما في ذلك التشوهات الخلقية، السلس البولي، والخصية المعلقة، باستخدام تقنيات متقدمة وآمنة تناسب أعمارهم الحساسة." 
                defaultEn="Renowned for unique expertise in pediatric urology..." 
                as="p"
              />
            </div>

            <div className="mt-10">
              <Link href="/about">
                <Button size="lg" className="h-14 px-8 text-lg bg-[var(--primary-dark)] hover:bg-[var(--primary)] text-white rounded-xl shadow-lg transition-all hover:-translate-x-2 gap-3 group">
                  <EditableText 
                    contentKey="about.readMore" 
                    defaultAr="تعرف علينا أكثر" 
                    defaultEn="Know more about us" 
                    as="span"
                  />
                  <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl z-10 border-8 border-white dark:border-[#222]">
              <EditableImage 
                contentKey="about.image"
                defaultSrc="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop"
                alt="Prof. Dr. Ahmed"
                className="w-full h-auto aspect-[4/5] object-cover"
              />
              
              {/* Floating Badge */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-6 -right-6 bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--accent)]/20 rounded-full flex items-center justify-center text-[var(--accent)] font-bold text-2xl">
                    +15
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">عاماً من الخبرة</p>
                    <p className="text-sm text-gray-500">في جراحة المسالك البولية</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Background decorative blob */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl z-0" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl z-0" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
