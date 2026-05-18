'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Section, SectionHeader, Card } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Play } from 'lucide-react';
import { api } from '@/lib/api';

export default function VideosPage() {
  const t = useTranslations('media');
  const locale = useLocale();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchVideos = (delay = 0) => {
    setLoading(true);
    setFetchError(false);
    const run = () =>
      api.get<any[]>('/media?type=video')
        .then(res => {
          setVideos(res);
          // If still empty after client fetch, retry once more after 1.5s (API cold start)
          if (res.length === 0) {
            setTimeout(() => {
              api.get<any[]>('/media?type=video')
                .then(setVideos)
                .catch(() => setFetchError(true))
                .finally(() => setLoading(false));
            }, 1500);
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Failed to fetch videos client-side:", err);
          setFetchError(true);
          setLoading(false);
        });

    if (delay > 0) setTimeout(run, delay);
    else run();
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <Section className="bg-gradient-to-b from-[var(--primary)]/5 to-transparent">
          <SectionHeader title={t('videos')} subtitle={t('videosSubtitle')} />
          
          <div className="grid gap-8 sm:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse aspect-video rounded-3xl bg-white/5" />
              ))
            ) : fetchError ? (
              <div className="col-span-full text-center py-20 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl max-w-xl mx-auto p-10">
                <Play size={48} className="text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)] text-lg mb-6">
                  {locale === 'ar' ? 'حدث خطأ في تحميل الفيديوهات.' : 'Failed to load videos.'}
                </p>
                <button
                  onClick={() => fetchVideos()}
                  className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            ) : videos.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-[var(--muted)] text-lg">
                  {locale === 'ar' ? 'لا توجد فيديوهات حالياً.' : 'No videos at the moment.'}
                </p>
              </div>
            ) : (
              videos.map((video, i) => {
                const title = locale === 'ar' ? video.titleAr : video.titleEn;
                const category = locale === 'ar' ? video.categoryAr : video.categoryEn;

                return (
                  <motion.div
                    key={video.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    <Card className="group relative overflow-hidden aspect-video border-none shadow-2xl cursor-pointer rounded-3xl" onClick={() => window.open(video.url, '_blank')}>
                      {/* Thumbnail Placeholder */}
                      <div className="absolute inset-0 bg-[var(--primary-dark)] group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[var(--accent)] transition-all duration-500 shadow-2xl">
                          <Play size={32} fill="currentColor" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex justify-between items-end">
                           <div className="space-y-2">
                              <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest border border-[var(--accent)]/30">
                                 {category}
                              </span>
                              <h3 className="text-2xl font-bold text-white">{title}</h3>
                           </div>
                        </div>
                      </div>
                    </Card>

                  </motion.div>
                );
              })
            )}
          </div>

        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
