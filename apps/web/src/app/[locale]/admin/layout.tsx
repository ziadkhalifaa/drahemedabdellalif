'use client';

import { AdminProvider, useAuth } from '@/components/layout/admin-layout';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTheme } from '@/components/theme-provider';
import { 
  Menu, 
  Bell, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  ChevronRight,
  ExternalLink,
  LayoutGrid
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

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

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className={cn("flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500", isRTL && "font-arabic")}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-500",
        isRTL ? "lg:mr-72" : "lg:ml-72"
      )}>
        {/* Premium Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-4 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            
            <div className="hidden sm:flex items-center gap-3">
               <div className="p-2 rounded-xl bg-primary/5 dark:bg-primary/10 text-primary">
                 <LayoutGrid size={18} />
               </div>
               <div className="flex flex-col">
                 <h1 className="text-xs font-black uppercase tracking-widest text-foreground leading-none">{isRTL ? 'التحكم' : 'Console'}</h1>
                 <span className="text-[10px] font-bold text-muted uppercase tracking-tighter opacity-60">{isRTL ? 'منصة الإدارة v2.0' : 'Admin Platform v2.0'}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
             {/* View Site */}
             <Link href="/" target="_blank" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 dark:hover:bg-primary/10 text-primary transition-all">
               <span>{isRTL ? 'معاينة الموقع' : 'Live Site'}</span>
               <ExternalLink size={12} />
             </Link>

             <div className="w-[1px] h-6 bg-border mx-1 hidden md:block" />

             {/* Language Switcher */}
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
             >
               <Globe size={16} className="text-muted group-hover:text-primary transition-colors" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{locale}</span>
             </button>

             {/* Theme Toggle */}
             <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className="relative h-9 w-9 rounded-xl flex items-center justify-center overflow-hidden hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
             >
               <AnimatePresence mode="wait">
                 <motion.div
                   key={theme}
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: -20, opacity: 0 }}
                   transition={{ duration: 0.2 }}
                 >
                   {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-600" />}
                 </motion.div>
               </AnimatePresence>
             </button>

             {/* Notifications */}
             <button className="relative h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-all group">
               <Bell size={18} className="text-muted group-hover:text-foreground transition-colors" />
               {notifCount > 0 && (
                 <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 text-[9px] text-white font-bold flex items-center justify-center px-0.5">
                   {notifCount > 99 ? '99+' : notifCount}
                 </span>
               )}
             </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-4 lg:p-8 flex-1 w-full max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
