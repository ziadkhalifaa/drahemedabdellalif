import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://drahmedabdellatif.com';

async function fetchJson(path: string, timeoutMs = 8000): Promise<any[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['ar', 'en'];
  const routes = ['', '/services', '/about', '/contact', '/gallery', '/booking', '/blog', '/patient-guide'];
  
  const staticPages: MetadataRoute.Sitemap = routes.flatMap(route => 
    locales.map(locale => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  let blogPosts: MetadataRoute.Sitemap = [];
  const posts = await fetchJson('/blog/published');
  if (posts) {
    blogPosts = posts.flatMap((post: any) => 
      locales.map(locale => ({
        url: `${BASE_URL}/${locale}/blog/${locale === 'ar' ? post.slugAr : post.slugEn}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    );
  }

  // Dynamic: Services
  let servicePages: MetadataRoute.Sitemap = [];
  const services = await fetchJson('/services');
  if (services) {
    servicePages = services.flatMap((svc: any) =>
      locales.map(locale => ({
        url: `${BASE_URL}/${locale}/services/${svc.id}`,
        lastModified: new Date(svc.updatedAt || svc.createdAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    );
  }

  return [...staticPages, ...blogPosts, ...servicePages];
}
