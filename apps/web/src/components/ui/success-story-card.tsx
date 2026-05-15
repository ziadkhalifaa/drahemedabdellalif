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
      className="bg-white dark:bg-[#111] rounded-2xl shadow-xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-800 hover:border-[var(--primary)]/50 transition-all"
      onClick={onClick}
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800 group/img">
        {hasImages ? (
          <>
            <img 
              src={getMediaUrl(story.patientImages[0])} 
              alt={title || story.patientName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <button 
              onClick={handleImageClick}
              className="absolute top-4 right-4 bg-black/50 hover:bg-[var(--primary)] text-white p-2 rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-20"
            >
              <Maximize2 size={16} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20">
            <Quote size={64} className="text-[var(--primary)]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold line-clamp-1">{title || story.patientName}</h3>
          {story.patientCity && (
            <div className="flex items-center text-sm text-gray-200 mt-1">
              <MapPin size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
              {story.patientCity}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-3 py-1 rounded-full">
            {story.treatmentType ? t(`treatmentTypes.${story.treatmentType}`) || story.treatmentType : t('tabSuccessStories')}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: story.rating || 5 }).map((_, i) => (
              <Star key={i} size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
            ))}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed mb-4 italic">
          "{content || story.content}"
        </p>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs">
              {story.patientName.charAt(0)}
            </div>
            <span className="text-sm font-medium dark:text-white">{story.patientName}</span>
          </div>
          <span className="text-xs font-semibold text-[var(--accent)] group-hover:text-[var(--primary)] transition-colors">
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
