'use client';

import { AdminProvider, useAuth } from '@/components/layout/admin-layout';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTheme } from '@/components/theme-provider';
import { Menu, Bell, Globe, Moon, Sun, ChevronRight, ExternalLink, Calendar, MessageCircle, Star, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  '/admin/clinics': { ar: 'العيادات', en: 'Clinics' },
  '/admin/newsletter': { ar: 'النشرة البريدية', en: 'Newsletter' },
  '/admin/availability': { ar: 'حجز المواعيد', en: 'Availability' },
  '/admin/audit-logs': { ar: 'سجل النشاط', en: 'Audit Logs' },
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
  const [notifData, setNotifData] = useState({ pendingAppointments: 0, unreadMessages: 0, pendingTestimonials: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname.includes('/login');

  useEffect(() => {
    if (!token) return;
    api.get<{ total: number; pendingAppointments: number; unreadMessages: number; pendingTestimonials: number }>('/analytics/notifications', token)
      .then(data => {
        setNotifCount(data.total);
        setNotifData({ pendingAppointments: data.pendingAppointments, unreadMessages: data.unreadMessages, pendingTestimonials: data.pendingTestimonials });
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <Bell size={15} className="text-slate-400 dark:text-slate-500" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{isRTL ? 'الإشعارات' : 'Notifications'}</h3>
                      {notifCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold">{notifCount}</span>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      {notifData.pendingAppointments > 0 && (
                        <Link href="/admin/appointments" onClick={() => setNotifOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Calendar size={14} className="text-indigo-500" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-slate-700 dark:text-white/60">{isRTL ? 'مواعيد في الانتظار' : 'Pending Appointments'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[11px] font-bold">{notifData.pendingAppointments}</span>
                        </Link>
                      )}
                      {notifData.unreadMessages > 0 && (
                        <Link href="/admin/messages" onClick={() => setNotifOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><MessageCircle size={14} className="text-amber-500" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-slate-700 dark:text-white/60">{isRTL ? 'رسائل جديدة' : 'Unread Messages'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-bold">{notifData.unreadMessages}</span>
                        </Link>
                      )}
                      {notifData.pendingTestimonials > 0 && (
                        <Link href="/admin/testimonials" onClick={() => setNotifOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center"><Star size={14} className="text-rose-500" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-slate-700 dark:text-white/60">{isRTL ? 'تقييمات تنتظر الموافقة' : 'Pending Testimonials'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[11px] font-bold">{notifData.pendingTestimonials}</span>
                        </Link>
                      )}
                      {notifCount === 0 && (
                        <div className="py-6 text-center">
                          <Bell size={20} className="mx-auto mb-2 text-slate-300 dark:text-white/15" />
                          <p className="text-[12px] text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
