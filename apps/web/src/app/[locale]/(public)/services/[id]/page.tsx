import { Metadata } from 'next';
import { api } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';
import { ServiceDetailContent } from './service-detail-content';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getService(id: string): Promise<Service | null> {
  // Retry up to 3 times to handle API cold starts on Hostinger
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, {
        next: { revalidate: 60 }, // Cache for 60s so stale data shows on API restart
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
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const service = await getService(id);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const title = locale === 'ar' ? (service.metaTitleAr || service.titleAr) : (service.metaTitleEn || service.titleEn);
  const description = locale === 'ar' ? (service.metaDescriptionAr || service.descriptionAr) : (service.metaDescriptionEn || service.descriptionEn);
  const image = service.image ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${service.image}` : undefined;

  return {
    title: `${title} | Dr. Ahmed Abdellatif`,
    description: description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const service = await getService(id);

  return <ServiceDetailContent service={service} locale={locale} serviceId={id} />;
}
