'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Section, SectionHeader } from '@/components/ui';
import { api } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { SuccessStoryCard } from '@/components/ui/success-story-card';

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>('/testimonials/success-stories?limit=3').then(setStories).catch(() => {});
  }, []);

  if (!stories.length) return null;

  return (
    <Section id="success-stories" className="bg-gray-50 dark:bg-[#080808]">
      <SectionHeader title={t('tabSuccessStories')} subtitle={t('subtitle')} />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {stories.map((story) => (
          <Link key={story.id} href={`/success-stories/${story.id}`}>
            <SuccessStoryCard story={story} />
          </Link>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Link href="/success-stories">
          <Button size="lg" className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-8 rounded-xl shadow-lg transition-all hover:-translate-y-1">
            {t('viewAll') || 'عرض جميع قصص النجاح'}
          </Button>
        </Link>
      </div>
    </Section>
  );
}
