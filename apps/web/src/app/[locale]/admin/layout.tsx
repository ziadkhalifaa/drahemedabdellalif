'use client';

import { AdminProvider, useAuth } from '@/components/layout/admin-layout';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTheme } from '@/components/theme-provider';
import { 
  Menu, Bell, Globe, Moon, Sun, ExternalLink, Search, ChevronRight
} from 'lucide-react';
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
  '/admin/newsletter': { ar: 'النشرة البريدية', en: 'Newsletter' },
  '/admin/patients': { ar: 'المرضى', en: 'Patients' },
  '/admin/reports': { ar: 'التقارير', en: 'Reports' },
  '/admin/editor': { ar: 'محرر الموقع', en: 'Live Editor' },
  '/admin/working-hours': { ar: 'ساعات العمل', en: 'Working Hours' },
  '/admin/settings': { ar: 'الإعدادات', en: 'Settings' },
};

function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { theme, setTheme } = useTheme();
  const { token, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  const isLoginPage = pathname.includes('/login');

  useEffect(() => {
    if (!token) return;
    
    const fetchNotifications = () => {
      api.get<{ total: number }>('/analytics/notifications', token)
        .then(data => setNotifCount(data.total))
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token && !isLoginPage) {
      router.push('/admin/login');
    } else if (token && isLoginPage) {
      router.push('/admin/dashboard');
    }
  }, [token, isLoginPage, router]);

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname as any, { locale: newLocale });
  };

  // Get current page title
  const getPageTitle = () => {
    const path = pathname?.replace(/^\/(ar|en)/, '') || '/admin';
    const matched = Object.entries(pageTitles).find(([key]) => path.startsWith(key) && key !== '/admin');
    if (matched) return isRTL ? matched[1].ar : matched[1].en;
    return isRTL ? 'لوحة التحكم' : 'Dashboard';
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className={cn("flex min-h-screen bg-gray-50/50 dark:bg-[#0c1220] transition-colors duration-300", isRTL && "font-arabic")}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isRTL ? "lg:mr-[260px]" : "lg:ml-[260px]"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f1a2e]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/[0.06]">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Menu size={20} className="text-gray-500 dark:text-white/50" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/admin" className="text-[11px] font-medium text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors uppercase tracking-wider">
                  {isRTL ? 'الرئيسية' : 'Home'}
                </Link>
                {pathname !== '/admin' && pathname !== '/admin/dashboard' && (
                  <>
                    <ChevronRight size={12} className={cn("text-gray-300 dark:text-white/20", isRTL && "rotate-180")} />
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-white/70 uppercase tracking-wider">
                      {getPageTitle()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              {/* View Site */}
              <Link 
                href="/" 
                target="_blank"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 dark:text-white/40 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
              >
                <ExternalLink size={13} />
                <span>{isRTL ? 'عرض الموقع' : 'View Site'}</span>
              </Link>

              <div className="w-px h-5 bg-gray-200 dark:bg-white/[0.06] mx-1 hidden md:block" />

              {/* Language */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
              >
                <Globe size={15} className="text-gray-400 dark:text-white/30 group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-semibold text-gray-500 dark:text-white/40 uppercase">{locale}</span>
              </button>

              {/* Theme */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {theme === 'dark' ? (
                      <Sun size={16} className="text-yellow-500" />
                    ) : (
                      <Moon size={16} className="text-gray-400" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                <Bell size={16} className="text-gray-400 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors" />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center px-1">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>

              {/* User avatar */}
              <div className="w-px h-5 bg-gray-200 dark:bg-white/[0.06] mx-1 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5 pl-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-[11px] font-bold text-primary border border-primary/10">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-[12px] font-semibold text-gray-700 dark:text-white/80 leading-none">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1400px] mx-auto"
          >
            {children}
          </motion.div>
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
