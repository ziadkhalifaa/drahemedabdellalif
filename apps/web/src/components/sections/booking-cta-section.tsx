'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Calendar, Video, ArrowLeft, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BookingCTASection() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [selected, setSelected] = useState<'clinic' | 'online' | null>(null);

  const options = [
    {
      id: 'clinic' as const,
      icon: Calendar,
      titleAr: 'حجز في العيادة',
      titleEn: 'Clinic Appointment',
      descAr: 'زيارة شخصية في عيادات 6 أكتوبر، بني سويف، أو التجمع الخامس مع الأستاذ الدكتور أحمد عبد اللطيف.',
      descEn: 'In-person visit at 6th of October, Beni Suef, or 5th Settlement clinics with Prof. Dr. Ahmed Abdellatif.',
      color: 'from-[var(--primary)] to-[var(--primary-dark)]',
      border: 'border-[var(--primary)]',
      glow: 'shadow-[var(--primary)]/30',
      href: '/booking',
      badge: isAr ? 'الأكثر طلباً' : 'Most Popular',
    },
    {
      id: 'online' as const,
      icon: Video,
      titleAr: 'استشارة طبية أونلاين',
      titleEn: 'Online Medical Consultation',
      descAr: 'تواصل مع الدكتور عبر الإنترنت من أي مكان بكل سهولة وخصوصية.',
      descEn: 'Consult with the doctor online from anywhere, conveniently and privately.',
      color: 'from-blue-600 to-blue-800',
      border: 'border-blue-500',
      glow: 'shadow-blue-500/30',
      href: '/booking?type=online',
      badge: isAr ? 'جديد' : 'New',
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden bg-[#0a192f]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-[var(--primary)]/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-8">
            <Star size={14} className="fill-[var(--accent)]" />
            {isAr ? 'ابدأ رحلتك الصحية' : 'Start Your Health Journey'}
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            {isAr ? 'كيف تريد التواصل معنا؟' : 'How Would You Like to Connect?'}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-14 leading-relaxed">
            {isAr
              ? 'اختر الطريقة التي تناسبك — زيارة شخصية أو استشارة أونلاين من راحة منزلك'
              : 'Choose what works best for you — an in-person visit or an online consultation from home'}
          </p>
        </motion.div>

        {/* Choice Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          {options.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              onClick={() => setSelected(opt.id)}
              className={cn(
                "group relative rounded-[2rem] border-2 p-8 text-left transition-all duration-300 overflow-hidden",
                selected === opt.id
                  ? `${opt.border} bg-white/10 shadow-2xl ${opt.glow} -translate-y-2`
                  : "border-white/10 bg-white/5 hover:border-white/30 hover:-translate-y-1"
              )}
            >
              {/* Badge */}
              <div className={cn(
                "absolute top-5 text-xs font-black px-3 py-1 rounded-full",
                isAr ? "left-5" : "right-5",
                i === 0 ? "bg-[var(--accent)] text-black" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              )}>
                {opt.badge}
              </div>

              {/* Gradient blob on hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 -z-0",
                opt.color,
                selected === opt.id ? "opacity-10" : "group-hover:opacity-5"
              )} />

              <div className={cn("relative z-10 flex flex-col gap-5", isAr ? "text-right" : "text-left")}>
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
                  opt.color
                )}>
                  <opt.icon size={30} />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    {isAr ? opt.titleAr : opt.titleEn}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {isAr ? opt.descAr : opt.descEn}
                  </p>
                </div>

                {selected === opt.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn("flex items-center gap-2 text-sm font-black", isAr ? "flex-row-reverse justify-end" : "")}
                    style={{ color: i === 0 ? 'var(--accent)' : '#60a5fa' }}
                  >
                    <CheckCircle2 size={16} />
                    {isAr ? 'تم الاختيار' : 'Selected'}
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {selected ? (
            <Link href={options.find(o => o.id === selected)?.href || '/booking'}>
              <button className={cn(
                "h-16 px-12 text-lg font-black rounded-2xl shadow-2xl transition-all hover:-translate-y-1 gap-3 inline-flex items-center",
                selected === 'clinic'
                  ? "bg-[var(--accent)] hover:bg-[#eab531]/90 text-black shadow-[var(--accent)]/20"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              )}>
                {selected === 'clinic'
                  ? (isAr ? <Calendar size={22} /> : <Calendar size={22} />)
                  : (isAr ? <Video size={22} /> : <Video size={22} />)
                }
                {selected === 'clinic'
                  ? (isAr ? 'احجز موعد في العيادة' : 'Book Clinic Appointment')
                  : (isAr ? 'ابدأ الاستشارة أونلاين' : 'Start Online Consultation')
                }
                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </Link>
          ) : (
            <p className="text-white/30 text-sm font-medium">
              {isAr ? 'اختر أحد الخيارين أعلاه للمتابعة' : 'Select one of the options above to continue'}
            </p>
          )}
        </motion.div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-14 border-t border-white/10 mt-14">
          {[
            { val: '5000+', label: isAr ? 'عملية ناجحة' : 'Surgeries' },
            { val: '15+', label: isAr ? 'سنة خبرة' : 'Years Exp.' },
            { val: '3', label: isAr ? 'عيادات' : 'Clinics' },
            { val: '24/7', label: isAr ? 'دعم مستمر' : 'Support' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-[var(--accent)]">{s.val}</div>
              <div className="text-xs text-white/40 font-medium mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
