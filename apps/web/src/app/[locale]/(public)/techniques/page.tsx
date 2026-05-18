import { Metadata } from 'next';
import { api } from '@/lib/api';
import { TechniquesContent } from './techniques-content';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getTechniques(): Promise<any[]> {
  // Retry up to 3 times to handle API cold starts on Hostinger
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/techniques`, {
        next: { revalidate: 60 }, // Cache for 60s to prevent empty pages during API restarts
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
  const title = locale === 'ar' ? 'أحدث التقنيات الطبية' : 'Latest Medical Techniques';
  const description = locale === 'ar' 
    ? 'تعرف على أحدث التقنيات العالمية في جراحة المسالك البولية والمناظير والليزر (هوليب، ريزوم) مع الدكتور أحمد عبد اللطيف.'
    : 'Learn about the latest global techniques in urology surgery, endoscopy, and laser (HOLEP, Rezum) with Dr. Ahmed Abdellatif.';

  const displayTitle = `${title} | ${locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}`;
  const baseUrl = 'https://drahmedabdellatif.com';

  return {
    title: displayTitle,
    description: description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}/techniques`,
    },
    openGraph: {
      title: displayTitle,
      description: description,
      url: `${baseUrl}/${locale}/techniques`,
      siteName: locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif',
      images: [
        {
          url: `${baseUrl}/images/clinic.png`,
          width: 1200,
          height: 630,
          alt: displayTitle,
        },
      ],
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: description,
      images: [`${baseUrl}/images/clinic.png`],
    },
  };
}

export default async function TechniquesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const techniques = await getTechniques();

  return <TechniquesContent techniques={techniques} locale={locale} />;
}
