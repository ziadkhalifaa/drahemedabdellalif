'use client';

import { AdminProvider, useAuth } from '@/components/layout/admin-layout';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTheme } from '@/components/theme-provider';
import { Menu, Bell, Globe, Moon, Sun, ChevronRight, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

const pageTitles: Record<string, { ar: string; en: string }> = {
  '/admin': { ar: 'لوحة التحكم', en: 'Dashboard' },
  '/admin/dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  '/admin/appointments': { ar: 'المواعيد', en: 'Appointments' },
  '/admin/calendar': { ar: 'التقويم', en: 'Calendar' },
  '/admin/payments': { ar: 'المدفوعات', en: 'Payments' },
  '/admin/prescriptions': { ar: 'الوصفات الطبية', en: 'Prescriptions' },
  '/admin/blog': { ar: 'المدونة', en: 'Blog' },
  '/admin/services': { ar: 'الخدمات', en: 'Services' },
  '/admin/techniques': { ar: 'التقنيات', en: 'Techniques' },
  '/admin/media': { ar: 'الميديا', en: 'Media' },
  '/admin/hero-slides': { ar: 'شرائح البطل', en: 'Hero Slides' },
  '/admin/testimonials': { ar: 'التقييمات', en: 'Testimonials' },
  '/admin/messages': { ar: 'الرسائل', en: 'Messages' },
  '/admin/patients': { ar: 'المرضى', en: 'Patients' },
  '/admin/reports': { ar: 'التقارير', en: 'Reports' },
  '/admin/editor': { ar: 'محرر الموقع', en: 'Live Editor' },
  '/admin/working-hours': { ar: 'ساعات العمل', en: 'Working Hours' },
  '/admin/settings': { ar: 'الإعدادات', en: 'Settings' },
};

function AdminShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { theme, setTheme } = useTheme();
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);

  const isLoginPage = pathname.includes('/login');

  useEffect(() => {
    if (!token) return;
    api.get<{ total: number }>('/analytics/notifications', token)
      .then(data => setNotifCount(data.total))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token && !isLoginPage) router.push('/admin/login');
    else if (token && isLoginPage) router.push('/admin/dashboard');
  }, [token, isLoginPage, router]);

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname as any, { locale: newLocale });
  };

  const getPageTitle = () => {
    const path = pathname?.replace(/^\/(ar|en)/, '') || '/admin';
    const matched = Object.entries(pageTitles).find(([key]) => path.startsWith(key) && key !== '/admin');
    if (matched) return isRTL ? matched[1].ar : matched[1].en;
    return isRTL ? 'لوحة التحكم' : 'Dashboard';
  };

  if (isLoginPage) return <>{children}</>;
  if (!token) return null;

  return (
    <div className={cn("flex min-h-screen bg-slate-50 dark:bg-[#0b1120] transition-colors", isRTL && "font-arabic")}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all", isRTL ? "lg:mr-[240px]" : "lg:ml-[240px]")}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Menu size={18} className="text-slate-500 dark:text-slate-400" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[12px]">
              <Link href="/admin" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Admin</Link>
              {pathname !== '/admin' && pathname !== '/admin/dashboard' && (
                <>
                  <ChevronRight size={12} className={cn("text-slate-300 dark:text-slate-600", isRTL && "rotate-180")} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{getPageTitle()}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/" target="_blank" className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
              <ExternalLink size={12} />
              {isRTL ? 'عرض الموقع' : 'View Site'}
            </Link>

            <div className="w-px h-4 bg-slate-200 dark:bg-white/5 mx-1 hidden md:block" />

            <button onClick={toggleLanguage} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Globe size={15} className="text-slate-400 dark:text-slate-500" />
            </button>

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <AnimatePresence mode="wait">
                <motion.div key={theme} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.15 }}>
                  {theme === 'dark' ? <Sun size={15} className="text-yellow-500" /> : <Moon size={15} className="text-slate-400" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <button className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Bell size={15} className="text-slate-400 dark:text-slate-500" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
