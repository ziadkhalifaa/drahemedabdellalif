import type { Metadata, Viewport } from 'next';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { EditorToolbar } from '@/components/editor/editable-components';
import { Preloader } from '@/components/preloader';
import { api } from '@/lib/api';


import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Tajawal, Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../../styles/globals.css';

const tajawal = Tajawal({
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  subsets: ['arabic', 'latin'],
  variable: '--font-tajawal',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#1B4332',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'ar' 
    ? 'أ.د. أحمد عبد اللطيف - استشاري جراحة المسالك البولية والكلى والذكورة' 
    : 'Prof. Dr. Ahmed Abdellatif - Professor & Consultant of Urology';
    
  const description = locale === 'ar'
    ? 'عيادة الأستاذ الدكتور أحمد عبد اللطيف، استشاري جراحة المسالك البولية والكلى والذكورة والعقم. علاج أمراض الكلى، البروستاتا، الحصوات، السلس البولي، والضعف الجنسي بأحدث تقنيات الليزر والمناظير في مصر.'
    : 'Clinic of Prof. Dr. Ahmed Abdellatif, Professor & Consultant of Urology, Andrology, Kidney Surgeries, and Male Infertility. High-quality laser and laparoscopic kidney stone treatments in Egypt.';

  const baseUrl = 'https://drahmedabdellatif.com';

  return {
    title: {
      template: `%s | ${locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif'}`,
      default: title,
    },
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ar': '/ar',
        'en': '/en',
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif',
      images: [
        {
          url: `${baseUrl}/images/doctor.png`,
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
      images: [`${baseUrl}/images/doctor.png`],
    },
    icons: {
      icon: '/images/logo.png',
      apple: '/images/logo.png',
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Fetch settings on server to avoid flash of original content
  const initialSettings: Record<string, any> = {};
  /*
  const settings = await api.get<any[]>('/settings').catch(() => []);
  if (Array.isArray(settings)) {
    settings.forEach((s: any) => {
      initialSettings[s.key] = s.value;
    });
  }
  */

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif',
    image: `${baseUrl || 'https://drahmedabdellatif.com'}/images/doctor.png`,
    medicalSpecialty: 'UrologySpecialty',
    address: {
      '@type': 'PostalAddress',
      addressLocality: locale === 'ar' ? 'بني سويف' : 'Beni Suef',
      addressCountry: 'EG'
    },
    telephone: whatsappNumber || '+201099688466',
    url: baseUrl || 'https://drahmedabdellatif.com',
    logo: `${baseUrl || 'https://drahmedabdellatif.com'}/images/logo.png`,
    description: locale === 'ar'
      ? 'استشاري جراحة المسالك البولية والكلى والذكورة والعقم.'
      : 'Professor & Consultant of Urology, Andrology, and Male Infertility.',
    priceRange: '$$',
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning className={`${tajawal.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] font-sans antialiased">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Providers messages={messages} locale={locale} initialSettings={initialSettings}>
          <Preloader />
          <AnalyticsTracker />
          <EditorToolbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}


