'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function WhatsAppWidget() {
  const t = useTranslations('common');
  const phoneNumber = '+201001516882'; // Dr. Ahmed's actual WhatsApp number

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-50 md:bottom-10 md:right-10"
    >
      <a
        href={`https://wa.me/${phoneNumber.replace('+', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors group"
        aria-label="Contact on WhatsApp"
      >
        {/* Pulsing rings */}
        <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-30" />
        <span className="absolute -inset-2 rounded-full animate-pulse border-2 border-[#25D366] opacity-20" />
        
        <MessageCircle size={32} className="relative z-10 drop-shadow-md" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-gray-800 text-sm font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t('contactUs')}
        </span>
      </a>
    </motion.div>
  );
}
