'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Layout, ArrowRight, MousePointer2, Edit3, Info,
  Newspaper, Stethoscope, Star, Image, FileText, Settings,
  Phone, Mail, Palette, Users, Calendar,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

const contentSections = [
  {
    id: 'hero',
    nameAr: 'شرائح البطل',
    nameEn: 'Hero Slides',
    descAr: 'إدارة صور البطل والعناوين الرئيسية',
    descEn: 'Manage hero images and main headlines',
    href: '/admin/hero-slides',
    icon: Newspaper,
    color: 'bg-indigo-500/10 text-indigo-500',
    count: null,
  },
  {
    id: 'services',
    nameAr: 'الخدمات',
    nameEn: 'Services',
    descAr: 'إضافة وتعديل خدمات العيادة',
    descEn: 'Add and edit clinic services',
    href: '/admin/services',
    icon: Stethoscope,
    color: 'bg-teal-500/10 text-teal-500',
    count: null,
  },
  {
    id: 'techniques',
    nameAr: 'التقنيات',
    nameEn: 'Techniques',
    descAr: 'عرض التقنيات الطبية المتخصصة',
    descEn: 'Display specialized medical techniques',
    href: '/admin/techniques',
    icon: Star,
    color: 'bg-amber-500/10 text-amber-500',
    count: null,
  },
  {
    id: 'clinics',
    nameAr: 'العيادات',
    nameEn: 'Clinics',
    descAr: 'إدارة العيادات والمواقع والمواعيد',
    descEn: 'Manage clinic locations and schedules',
    href: '/admin/clinics',
    icon: Calendar,
    color: 'bg-rose-500/10 text-rose-500',
    count: null,
  },
  {
    id: 'blog',
    nameAr: 'المدونة',
    nameEn: 'Blog',
    descAr: 'كتابة ونشر المقالات الطبية',
    descEn: 'Write and publish medical articles',
    href: '/admin/blog',
    icon: FileText,
    color: 'bg-sky-500/10 text-sky-500',
    count: null,
  },
  {
    id: 'media',
    nameAr: 'الميديا',
    nameEn: 'Media Library',
    descAr: 'إدارة الصور والوسائط',
    descEn: 'Manage images and media files',
    href: '/admin/media',
    icon: Image,
    color: 'bg-violet-500/10 text-violet-500',
    count: null,
  },
];

const quickLinks = [
  { href: '/admin/settings', icon: Settings, labelAr: 'الإعدادات العامة', labelEn: 'General Settings', color: 'text-slate-500' },
  { href: '/admin/testimonials', icon: Users, labelAr: 'التقييمات', labelEn: 'Testimonials', color: 'text-yellow-500' },
  { href: '/admin/working-hours', icon: Calendar, labelAr: 'ساعات العمل', labelEn: 'Working Hours', color: 'text-indigo-500' },
];

export default function LiveEditorManagement() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
            <Edit3 size={18} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">{isRTL ? 'محرر الموقع' : 'Content Manager'}</h1>
            <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">
              {isRTL ? 'إدارة كل محتوى الموقع من مكان واحد' : 'Manage all your website content from one place'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
          >
            <Link href={section.href as any}>
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", section.color)}>
                    <section.icon size={18} />
                  </div>
                  <ArrowRight size={14} className={cn(
                    "text-slate-300 dark:text-white/15 group-hover:text-indigo-500 transition-all duration-300",
                    isRTL && "rotate-180 group-hover:-rotate-0"
                  )} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">
                  {isRTL ? section.nameAr : section.nameEn}
                </h3>
                <p className="text-[12px] text-slate-500 dark:text-white/35 leading-relaxed">
                  {isRTL ? section.descAr : section.descEn}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
        <h2 className="text-[14px] font-bold text-slate-900 dark:text-white mb-4">
          {isRTL ? 'روابط سريعة' : 'Quick Links'}
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href as any}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <link.icon size={16} className={cn("shrink-0", link.color)} />
                <span className="text-[13px] font-medium text-slate-700 dark:text-white/50 group-hover:text-indigo-500 transition-colors">
                  {isRTL ? link.labelAr : link.labelEn}
                </span>
                <ArrowRight size={12} className={cn(
                  "ms-auto text-slate-300 dark:text-white/15 group-hover:text-indigo-500 transition-all",
                  isRTL && "rotate-180"
                )} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Edit Info */}
      <div className="bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/15 p-5 flex gap-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={18} className="text-indigo-500" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">
            {isRTL ? 'كيف يعمل المحرر الحي' : 'How Live Editing Works'}
          </h3>
          <p className="text-[12px] text-slate-500 dark:text-white/35 leading-relaxed">
            {isRTL
              ? 'اختر قسم من الأقسام أعلاه للتعديل. يمكنك أيضاً فتح الموقع مباشرة والضغط على أي نص أو صورة لتعديله فوراً.'
              : 'Choose a section above to manage its content. You can also open the live site directly and click on any text or image to edit it in real-time.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
