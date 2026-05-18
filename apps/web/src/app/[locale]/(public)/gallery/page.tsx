'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Section, SectionHeader, Card, Skeleton } from '@/components/ui';
import { motion } from 'framer-motion';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Image as ImageIcon, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, getMediaUrl } from '@/lib/api';

export default function GalleryPage() {
  const t = useTranslations('media');
  const locale = useLocale();
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const fetchItems = (delay = 0) => {
    setLoading(true);
    setFetchError(false);
    const run = () =>
      api.get<any[]>('/media')
        .then(res => {
          setItems(res);
          // If still empty after client fetch, retry once more after 1.5s (API cold start)
          if (res.length === 0) {
            setTimeout(() => {
              api.get<any[]>('/media')
                .then(setItems)
                .catch(() => setFetchError(true))
                .finally(() => setLoading(false));
            }, 1500);
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Failed to fetch media client-side:", err);
          setFetchError(true);
          setLoading(false);
        });

    if (delay > 0) setTimeout(run, delay);
    else run();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);
  const slides = filteredItems.filter(i => i.type === 'image').map(i => ({ src: getMediaUrl(i.url) }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <Section className="bg-gradient-to-b from-[var(--primary)]/5 to-transparent">
          <SectionHeader title={t('gallery')} subtitle={t('gallerySubtitle')} />
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all border border-[var(--border)]",
                filter === 'all' ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--muted)] hover:border-[var(--primary)]/50"
              )}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilter('image')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all border border-[var(--border)]",
                filter === 'image' ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--muted)] hover:border-[var(--primary)]/50"
              )}
            >
              {t('images')}
            </button>
            <button
              onClick={() => setFilter('video')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all border border-[var(--border)]",
                filter === 'video' ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--muted)] hover:border-[var(--primary)]/50"
              )}
            >
              {t('videos')}
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))
            ) : fetchError ? (
              <div className="col-span-full text-center py-20 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl max-w-xl mx-auto p-10">
                <ImageIcon size={48} className="text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)] text-lg mb-6">
                  {locale === 'ar' ? 'حدث خطأ في تحميل المعرض.' : 'Failed to load gallery.'}
                </p>
                <button
                  onClick={() => fetchItems()}
                  className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-[var(--muted)] text-lg">
                  {locale === 'ar' ? 'لا توجد عناصر في المعرض حالياً.' : 'No items in the gallery at the moment.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item, i) => {
                const title = locale === 'ar' ? item.titleAr : item.titleEn;
                const category = locale === 'ar' ? item.categoryAr : item.categoryEn;

                return (
                  <motion.div
                    key={item.id || i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card 
                      className="group relative overflow-hidden aspect-[4/3] border-none shadow-xl cursor-pointer"
                      onClick={() => {
                        if (item.type === 'image') {
                          const imageIndex = slides.findIndex(s => s.src === getMediaUrl(item.url));
                          setIndex(imageIndex);
                          setOpen(true);
                        } else {
                          window.open(item.url, '_blank');
                        }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 group-hover:scale-110 transition-transform duration-700" />
                      {item.type === 'image' && <img src={getMediaUrl(item.url)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            {item.type === 'image' ? <ImageIcon size={24} /> : <Play size={24} className="ml-1" />}
                         </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs font-bold text-[var(--primary-light)] uppercase tracking-widest mb-1">{category}</p>
                        <h4 className="text-lg font-bold text-white">{title}</h4>
                      </div>

                      {item.type === 'video' && (
                        <div className="absolute top-4 right-4 bg-[var(--primary)]/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-2">
                          <Play size={10} fill="currentColor" /> {t('videos')}
                        </div>
                      )}
                    </Card>

                  </motion.div>
                );
              })
            )}
          </div>

          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={slides}
          />
        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
