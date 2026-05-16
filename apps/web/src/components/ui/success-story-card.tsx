'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Quote, Maximize2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getMediaUrl } from '@/lib/api';
import { ImageLightbox } from '@/components/ui/image-lightbox';

interface SuccessStoryProps {
  story: any;
  onClick?: () => void;
}

export function SuccessStoryCard({ story, onClick }: SuccessStoryProps) {
  const locale = useLocale();
  const t = useTranslations('testimonials');
  
  const title = locale === 'ar' ? story.storyTitle : story.storyTitleEn;
  const content = locale === 'ar' ? story.storyContent : story.storyContentEn;
  const hasImages = story.patientImages && story.patientImages.length > 0;
  
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden cursor-pointer group hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-500 relative h-full flex flex-col p-8"
      onClick={onClick}
    >
      {/* Decorative Quote Icon */}
      <div className="absolute top-6 right-8 opacity-5 dark:opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
        <Quote size={80} className="text-[var(--primary)]" fill="currentColor" />
      </div>

      <div className="flex items-start gap-4 mb-6 relative z-10">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--primary)]/20 group-hover:border-[var(--primary)] transition-colors shadow-lg shrink-0">
          {hasImages ? (
            <img 
              src={getMediaUrl(story.patientImages[0])} 
              alt={title || story.patientName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white text-xl font-bold">
              {story.patientName.charAt(0)}
            </div>
          )}
          {hasImages && (
            <button 
              onClick={handleImageClick}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <Maximize2 size={16} className="text-white" />
            </button>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
            {story.patientName}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <div className="flex gap-0.5">
              {Array.from({ length: story.rating || 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
              ))}
            </div>
            {story.patientCity && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPin size={12} className="mr-1 rtl:ml-1 rtl:mr-0" />
                {story.patientCity}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative z-10 flex flex-col">
        <h4 className="text-sm font-bold text-[var(--primary)] mb-3">
          {story.treatmentType ? t(`treatmentTypes.${story.treatmentType}`) || story.treatmentType : t('tabSuccessStories')}
        </h4>
        <p className="text-gray-700 dark:text-gray-300 text-base line-clamp-4 leading-relaxed mb-6 font-medium italic">
          &quot;{content || story.content}&quot;
        </p>
        
        <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {title && title !== story.patientName ? title : ''}
          </span>
          <span className="text-xs font-black text-[var(--primary)] flex items-center gap-1 group-hover:gap-2 transition-all">
            {t('readFullStory')} &rarr;
          </span>
        </div>
      </div>
    </motion.div>
    
    {hasImages && (
      <ImageLightbox 
        images={story.patientImages} 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
      />
    )}
    </>
  );
}
