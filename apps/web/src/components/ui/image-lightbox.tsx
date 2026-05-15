'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMediaUrl } from '@/lib/api';

interface ImageLightboxProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ImageLightbox({ images, isOpen, onClose, initialIndex = 0 }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialIndex]);

  if (!isOpen || !images.length) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X size={24} />
          </button>

          {images.length > 1 && (
            <button 
              className="absolute left-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
              onClick={handlePrev}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            src={getMediaUrl(images[currentIndex])}
            className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl rounded-lg"
            alt={`Image ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button 
              className="absolute right-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
              onClick={handleNext}
            >
              <ChevronRight size={32} />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
