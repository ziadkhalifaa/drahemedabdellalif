'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getMediaUrl } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { Calendar, Search, BookOpen, Tag as TagIcon, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@dr-ahmed/shared';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { cn } from '@/lib/utils';

export default function BlogPage() {
  const t = useTranslations('blog');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchPosts = (delay = 0) => {
    setLoading(true);
    setFetchError(false);
    const run = () =>
      api.get<BlogPost[]>('/blog/published')
        .then(res => {
          setPosts(res);
          // If still empty after client fetch, retry once more after 1.5s (API cold start)
          if (res.length === 0) {
            setTimeout(() => {
              api.get<BlogPost[]>('/blog/published')
                .then(setPosts)
                .catch(() => setFetchError(true))
                .finally(() => setLoading(false));
            }, 1500);
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Failed to fetch blog posts client-side:", err);
          setFetchError(true);
          setLoading(false);
        });

    if (delay > 0) setTimeout(run, delay);
    else run();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const title = isAr ? post.titleAr : post.titleEn;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const featuredPost = filteredPosts[0];
  const restPosts = filteredPosts.slice(1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050e1a]">

        {/* ── Hero Header ─────────────────────────────────── */}
        <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[var(--primary)]/15 rounded-full blur-[150px]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--accent)] text-xs font-black uppercase tracking-widest mb-6">
              <BookOpen size={14} />
              {isAr ? 'المدونة الطبية' : 'Medical Blog'}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
              {t('title')}
            </h1>
            <p className="text-white/60 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              {t('subtitle')}
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <div className={cn(
                "absolute top-1/2 -translate-y-1/2 text-white/40 pointer-events-none",
                isAr ? "right-5" : "left-5"
              )}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[var(--primary)] outline-none transition-all backdrop-blur-md text-sm",
                  isAr ? "pr-14 pl-5 text-right" : "pl-14 pr-5 text-left"
                )}
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-80 rounded-[1.75rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-24 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl max-w-xl mx-auto p-10">
              <BookOpen size={64} className="text-white/20 mx-auto mb-6" />
              <p className="text-white/60 text-lg mb-6">
                {isAr ? 'حدث خطأ أثناء تحميل المقالات الطبية.' : 'Failed to load medical blog articles.'}
              </p>
              <button
                onClick={() => fetchPosts()}
                className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {isAr ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen size={64} className="text-white/10 mx-auto mb-6" />
              <p className="text-white/40 text-xl font-medium">{t('noPosts')}</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && !search && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <Link href={`/blog/${(isAr ? featuredPost.slugAr : featuredPost.slugEn) || featuredPost.slugEn || featuredPost.slugAr}`}>
                    <div className="group relative rounded-[2rem] overflow-hidden h-[420px] border border-white/10 hover:border-[var(--primary)]/50 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
                      {featuredPost.featuredImage ? (
                        <img
                          src={getMediaUrl(featuredPost.featuredImage)}
                          alt={isAr ? featuredPost.titleAr : featuredPost.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-dark)]/40" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className={cn(
                        "absolute bottom-0 p-10",
                        isAr ? "right-0 text-right" : "left-0 text-left"
                      )}>
                        <span className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-black text-xs font-black px-3 py-1.5 rounded-full mb-4">
                          <TagIcon size={10} />
                          {isAr ? 'مقال مميز' : 'Featured'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 max-w-2xl">
                          {isAr ? featuredPost.titleAr : featuredPost.titleEn}
                        </h2>
                        <div className={cn("flex items-center gap-4 text-white/50 text-sm", isAr ? "flex-row-reverse justify-end" : "")}>
                          <div className={cn("flex items-center gap-1.5", isAr ? "flex-row-reverse" : "")}>
                            <Calendar size={14} />
                            {new Date(featuredPost.createdAt).toLocaleDateString(locale)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isAr ? <ArrowLeft size={16} className="text-[var(--accent)]" /> : <ArrowRight size={16} className="text-[var(--accent)]" />}
                            <span className="text-[var(--accent)] font-bold">{isAr ? 'اقرأ المقال' : 'Read Article'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Rest of posts */}
              <AnimatePresence>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(search ? filteredPosts : restPosts).map((post, i) => {
                    const title = isAr ? post.titleAr : post.titleEn;
                    const excerpt = isAr ? post.excerptAr : post.excerptEn;
                    const slug = (isAr ? post.slugAr : post.slugEn) || post.slugEn || post.slugAr;

                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                      >
                        <Link href={`/blog/${slug}`} className="group block h-full">
                          <div className="h-full bg-white/5 border border-white/10 rounded-[1.75rem] overflow-hidden hover:border-[var(--primary)]/40 hover:-translate-y-2 transition-all duration-400 hover:shadow-xl hover:shadow-[var(--primary)]/10 flex flex-col">
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden flex-shrink-0">
                              {post.featuredImage ? (
                                <img
                                  src={getMediaUrl(post.featuredImage)}
                                  alt={title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary-dark)]/20 flex items-center justify-center">
                                  <BookOpen size={40} className="text-white/10" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              {/* Category */}
                              <div className={cn("absolute top-4 z-10", isAr ? "right-4" : "left-4")}>
                                <span className="inline-flex items-center gap-1 bg-[var(--accent)] text-black text-xs font-black px-2.5 py-1 rounded-full">
                                  <TagIcon size={9} />
                                  {post.category?.nameAr || (isAr ? 'مقال طبي' : 'Medical Article')}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className={cn("p-6 flex flex-col flex-grow", isAr ? "text-right" : "text-left")}>
                              <div className={cn("flex items-center gap-2 text-white/30 text-xs mb-3", isAr ? "flex-row-reverse justify-end" : "")}>
                                <Calendar size={12} />
                                {new Date(post.createdAt).toLocaleDateString(locale)}
                              </div>
                              <h3 className="text-lg font-black text-white mb-3 line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors duration-200">
                                {title}
                              </h3>
                              {excerpt && (
                                <p className="text-white/40 text-sm flex-grow line-clamp-3 leading-relaxed mb-5">
                                  {excerpt}
                                </p>
                              )}
                              <div className={cn(
                                "inline-flex items-center gap-2 text-[var(--primary)] text-sm font-black mt-auto",
                                isAr ? "flex-row-reverse" : ""
                              )}>
                                {isAr ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                                {isAr ? 'اقرأ المزيد' : 'Read More'}
                              </div>
                            </div>

                            {/* Bottom progress bar */}
                            <div className="h-0.5 bg-white/5">
                              <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
