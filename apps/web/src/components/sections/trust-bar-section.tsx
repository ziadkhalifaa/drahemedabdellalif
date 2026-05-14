'use client';

import { useLocale } from 'next-intl';

const TRUST_LOGOS = [
  { id: 1, nameAr: 'نقابة الأطباء', nameEn: 'Medical Syndicate' },
  { id: 2, nameAr: 'وزارة الصحة المصرية', nameEn: 'Egyptian Ministry of Health' },
  { id: 3, nameAr: 'FACS', nameEn: 'FACS' },
  { id: 4, nameAr: 'المستشفى الجامعي', nameEn: 'University Hospital' },
  { id: 5, nameAr: 'Cairo University', nameEn: 'Cairo University' },
];

export function TrustBarSection() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="w-full h-[120px] bg-[var(--primary)] relative overflow-hidden flex items-center border-b border-white/10" dir="ltr">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--primary)] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--primary)] to-transparent z-10" />
      
      {/* Marquee container */}
      <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] gap-12 sm:gap-24 px-12">
        {/* Double the logos to create infinite loop effect */}
        {[...TRUST_LOGOS, ...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, index) => (
          <div 
            key={`${logo.id}-${index}`}
            className="flex items-center justify-center whitespace-nowrap min-w-max"
          >
            <span className="text-xl sm:text-2xl font-bold text-white/40 tracking-wider font-display uppercase hover:text-white/80 transition-colors cursor-default">
              {isRTL ? logo.nameAr : logo.nameEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
