import { Metadata } from 'next';
import { api } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';
import { ServicesContent } from './services-content';
import { getMessages } from 'next-intl/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getServices(): Promise<Service[]> {
  // Retry up to 3 times to handle API cold starts on Hostinger
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/services`, {
        next: { revalidate: 60 }, // Cache for 60s so stale data shows on API restart
      });
      if (!res.ok) {
        if (attempt < 3) continue;
        return [];
      }
      return res.json();
    } catch {
      if (attempt < 3) {
        // Wait 500ms before retry
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      return [];
    }
  }
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages: any = await getMessages({ locale });
  const t = messages.services;

  const title = `${t.title} | ${locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}`;
  const description = t.subtitle || t.title;
  const baseUrl = 'https://drahmedabdellatif.com';

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}/services`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services`,
      siteName: locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif',
      images: [
        {
          url: `${baseUrl}/images/urology.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/images/urology.png`],
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const services = await getServices();

  return <ServicesContent services={services} locale={locale} />;
}
