'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Card, Button } from '@/components/ui';
import { api, getMediaUrl } from '@/lib/api';
import type { BlogPost } from '@dr-ahmed/shared';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Props {
  post: BlogPost | null;
  locale: string;
  slug: string;
}

export function BlogArticleContent({ post: initialPost, locale, slug }: Props) {
  const t = useTranslations('blog');
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState(initialPost === null);

  useEffect(() => {
    if (initialPost === null) {
      setLoading(true);
      const fetchDetail = (attempt = 1) => {
        api.get<BlogPost>(`/blog/${slug}`)
          .then(res => {
            setPost(res);
            setLoading(false);
          })
          .catch(err => {
            console.error(`Failed to fetch blog article client-side (attempt ${attempt}):`, err);
            if (attempt < 2) {
              setTimeout(() => fetchDetail(attempt + 1), 1500);
            } else {
              setLoading(false);
            }
          });
      };
      fetchDetail();
    } else {
      setPost(initialPost);
      setLoading(false);
    }
  }, [initialPost, slug]);

  useEffect(() => {
    if (post && !loading) {
      const expectedSlug = (locale === 'ar' ? post.slugAr : post.slugEn) || post.slugEn || post.slugAr;
      if (slug !== expectedSlug) {
        router.replace(`/blog/${expectedSlug}`);
      }
    }
  }, [locale, slug, post, loading, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 animate-pulse">
          <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-6">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="mt-8 aspect-video rounded-[2.5rem] bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
          </article>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-32">
          <div className="text-center space-y-4">
            <p className="text-[var(--muted)] text-xl font-bold">Article not found.</p>
            <Link href="/#blog"><Button>{locale === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}</Button></Link>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  const title = locale === 'ar' ? post.titleAr : post.titleEn;
  const excerpt = locale === 'ar' ? post.excerptAr : post.excerptEn;
  const content = locale === 'ar' ? post.contentAr : post.contentEn;
  const categoryName = post.category
    ? locale === 'ar'
      ? post.category.nameAr
      : post.category.nameEn
    : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link
            href="/#blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            <ArrowLeft size={14} className={locale === 'ar' ? 'rotate-180' : ''} />{' '}
            {t('backToBlog') || 'Back to Blog'}
          </Link>

          <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">{title}</h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString(locale)}
            </span>
            {categoryName && <span>{categoryName}</span>}
          </div>

          {post.featuredImage && (
            <div className="mt-8 aspect-video rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-white/10 shadow-2xl">
              <img
                src={getMediaUrl(post.featuredImage)}
                className="w-full h-full object-cover"
                alt={title}
              />
            </div>
          )}

          {excerpt && (
            <p className="mt-6 text-lg text-[var(--muted)] leading-relaxed">{excerpt}</p>
          )}

          <div className="mt-8">
            <Card className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </Card>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
