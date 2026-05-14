'use client';

import { motion } from 'framer-motion';
import { Section } from '@/components/ui';
import { Link } from '@/i18n/routing';

const techniques = [
  {
    id: 'holep',
    title: 'الهولميوم ليزر (HoLEP)',
    description: 'استخدام نبضات الليزر لفصل الأنسجة الداخلية المتضخمة للبروستاتا ودفعها إلى المثانة، ثم شفطها خارج الجسم عبر المنظار بفعالية وأمان.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop', // Replace with actual medical image
    link: '/services/holep'
  },
  {
    id: 'rezum',
    title: 'الريزيوم (Rezūm)',
    description: 'استخدام الطاقة الحرارية المُنبعثة من بخار الماء لإزالة أنسجة البروستاتا المتضخمة بفعالية، مع المحافظة التامة على القدرة الإنجابية.',
    image: 'https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=800&auto=format&fit=crop', // Replace with actual medical image
    link: '/services/rezum'
  },
  {
    id: 'vaporization',
    title: 'التبخير بالليزر',
    description: 'تبخير أنسجة البروستاتا المُتضخمة باستخدام أحدث أنواع الليزر أو طاقة البلازما؛ لتحسين تدفق البول واستعادة الوظائف الطبيعية.',
    image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=800&auto=format&fit=crop', // Replace with actual medical image
    link: '/services/laser'
  }
];

export function CoreTechniquesSection() {
  return (
    <Section className="py-20 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[var(--primary-dark)] dark:text-white"
        >
          إزالة تضخم البروستاتا الحميد بدون جراحة
        </motion.h2>
        <div className="mt-4 w-24 h-1 bg-[var(--accent)] mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {techniques.map((tech, index) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#111] shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
          >
            <Link href={tech.link} className="block relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img 
                src={tech.image} 
                alt={tech.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
              <h3 className="absolute bottom-6 left-6 right-6 z-20 text-2xl font-bold text-white text-center">
                {tech.title}
              </h3>
            </Link>
            <div className="p-8">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                {tech.description}
              </p>
              <div className="mt-6 flex justify-center">
                <Link href={tech.link} className="text-[var(--primary)] dark:text-[var(--accent)] font-semibold hover:underline">
                  اقرأ المزيد &larr;
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
