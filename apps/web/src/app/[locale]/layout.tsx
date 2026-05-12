import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { EditorToolbar } from '@/components/editor/editable-components';
import { api } from '@/lib/api';


import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Cairo, Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../../styles/globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dr. Ahmed Abdellatif - Consultant Urologist',
  description: 'Consultant of Urology, Kidney Surgery, Endoscopy, Andrology, and Sexual Health in Beni Suef, Egypt.',
};

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
  const settings = await api.get<any[]>('/settings').catch(() => []);
  const initialSettings: Record<string, any> = {};
  if (Array.isArray(settings)) {
    settings.forEach((s: any) => {
      initialSettings[s.key] = s.value;
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: locale === 'ar' ? 'أ.د. أحمد عبد اللطيف' : 'Prof. Dr. Ahmed Abdellatif',
    medicalSpecialty: 'Urology',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Beni Suef',
      addressCountry: 'EG'
    },
    telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    url: process.env.NEXT_PUBLIC_BASE_URL,
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning className={`${cairo.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] font-sans antialiased">
        <Providers messages={messages} locale={locale} initialSettings={initialSettings}>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
          <AnalyticsTracker />
          <EditorToolbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}


