import type { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://drahmedabdellatif.com';

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
  try {
    const res = await fetch(`${API_BASE}/blog/published`, { cache: 'no-store' });
    if (res.ok) {
      const posts = await res.json();
      blogPosts = posts.flatMap((post: any) => 
        locales.map(locale => ({
          url: `${BASE_URL}/${locale}/blog/${locale === 'ar' ? post.slugAr : post.slugEn}`,
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      );
    }
  } catch {}

  // Dynamic: Services
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/services`, { cache: 'no-store' });
    if (res.ok) {
      const services = await res.json();
      servicePages = services.flatMap((svc: any) =>
        locales.map(locale => ({
          url: `${BASE_URL}/${locale}/services/${svc.id}`,
          lastModified: new Date(svc.updatedAt || svc.createdAt),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      );
    }
  } catch {}

  return [...staticPages, ...blogPosts, ...servicePages];
}
