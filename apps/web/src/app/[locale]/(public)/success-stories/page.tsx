import { getTranslations } from 'next-intl/server';
import { api } from '@/lib/api';
import { SuccessStoryCard } from '@/components/ui/success-story-card';
import { Link } from '@/i18n/routing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'testimonials' });
  return {
    title: t('tabSuccessStories'),
    description: t('subtitle'),
  };
}

export default async function SuccessStoriesPage() {
  const t = await getTranslations('testimonials');
  
  let stories = [];
  try {
    stories = await api.get<any[]>('/testimonials/success-stories');
  } catch (error) {
    console.error('Failed to fetch success stories:', error);
  }

  return (
    <div className="py-24 bg-gray-50 dark:bg-[#050505] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--primary-dark)] dark:text-white mb-6">
            {t('tabSuccessStories')}
          </h1>
          <div className="w-24 h-1 bg-[var(--accent)] rounded-full mx-auto mb-6" />
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('subtitle')}
          </p>
        </div>

        {stories.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Link key={story.id} href={`/success-stories/${story.id}`}>
                <SuccessStoryCard story={story} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-500">{t('noReviews')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
