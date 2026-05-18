import { getTranslations } from 'next-intl/server';
import { api } from '@/lib/api';
import { SuccessStoryCard } from '@/components/ui/success-story-card';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Section, SectionHeader } from '@/components/ui';
import { Heart } from 'lucide-react';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'testimonials' });
  return {
    title: t('tabSuccessStories'),
    description: t('subtitle'),
  };
}

export default async function SuccessStoriesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('testimonials');
  
  let stories = [];
  // Retry up to 3 times to handle cold starts on Hostinger
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      stories = await api.get<any[]>('/testimonials/success-stories');
      break;
    } catch (error) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.error('Failed to fetch success stories:', error);
    }
  }

  const isAr = locale === 'ar';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#fafafa] dark:bg-[#080808] relative overflow-hidden transition-colors duration-300">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        </div>

        <Section className="relative z-10" id="success-stories-list">
          <SectionHeader 
            title={t('tabSuccessStories')}
            subtitle={t('subtitle')}
            className="text-center"
          />

          {stories.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              {stories.map((story) => (
                <Link key={story.id} href={`/success-stories/${story.id}`} className="block h-full">
                  <SuccessStoryCard story={story} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-xl mx-auto text-center py-20 px-8 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl mt-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-6 animate-pulse">
                <Heart size={28} className="fill-[var(--primary)]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                {t('noReviews') || (isAr ? 'لا توجد مراجعات بعد' : 'No reviews yet')}
              </h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">
                {isAr 
                  ? 'كن أول من يشارك تجربته مع الدكتور أحمد عبد اللطيف وينير طريق الأمل لمرضى آخرين!' 
                  : 'Be the first to share your experience with Dr. Ahmed Abdellatif and light the path of hope for other patients!'}
              </p>
            </div>
          )}
        </Section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
