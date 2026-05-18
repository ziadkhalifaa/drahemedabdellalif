import { Metadata } from 'next';
import { api, getMediaUrl } from '@/lib/api';
import type { BlogPost } from '@dr-ahmed/shared';
import { BlogArticleContent } from './blog-article-content';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getPost(slug: string): Promise<BlogPost | null> {
  // Retry up to 3 times to handle API cold starts on Hostinger
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/blog/${slug}`, {
        next: { revalidate: 60 }, // Cache for 60s to prevent empty pages during API restarts
      });
      if (!res.ok) {
        if (attempt < 3) continue;
        return null;
      }
      return res.json();
    } catch {
      if (attempt < 3) {
        // Wait 500ms before retry
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      return null;
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
    };
  }

  const title = locale === 'ar' ? post.titleAr : post.titleEn;
  const description = locale === 'ar' ? post.excerptAr : post.excerptEn;
  const image = post.featuredImage ? getMediaUrl(post.featuredImage) : undefined;

  return {
    title: `${title} | Dr. Ahmed Abdellatif`,
    description: description || title,
    openGraph: {
      title,
      description: description || title,
      type: 'article',
      publishedTime: post.createdAt,
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || title,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        ar: `/ar/blog/${post.slugAr}`,
        en: `/en/blog/${post.slugEn}`,
      },
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  return <BlogArticleContent post={post} locale={locale} slug={slug} />;
}
