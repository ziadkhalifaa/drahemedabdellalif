'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from './admin-layout';
import { 
  LogOut, LayoutDashboard, Calendar, CalendarDays, FileText, 
  Star, X, Image, Settings, Users, Edit3,
  Clock, Mail, CreditCard, Stethoscope, Pill, FileBarChart, Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, Link } from '@/i18n/routing';

const navSections = [
  {
    title: 'main',
    items: [
      { href: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/admin/appointments', icon: Calendar, labelKey: 'appointments' },
      { href: '/admin/calendar', icon: CalendarDays, labelKey: 'calendar_view' },
      { href: '/admin/payments', icon: CreditCard, labelKey: 'payments' },
      { href: '/admin/prescriptions', icon: Pill, labelKey: 'prescriptions' },
    ]
  },
  {
    title: 'content',
    items: [
      { href: '/admin/hero-slides', icon: Newspaper, labelKey: 'Hero Slides' },
      { href: '/admin/services', icon: Stethoscope, labelKey: 'Services' },
      { href: '/admin/techniques', icon: Star, labelKey: 'Techniques' },
      { href: '/admin/blog', icon: FileText, labelKey: 'blog' },
      { href: '/admin/media', icon: Image, labelKey: 'media' },
    ]
  },
  {
    title: 'feedback',
    items: [
      { href: '/admin/testimonials', icon: Star, labelKey: 'testimonials' },
      { href: '/admin/messages', icon: Mail, labelKey: 'messages' },
    ]
  },
  {
    title: 'system',
    items: [
      { href: '/admin/patients', icon: Users, labelKey: 'patients' },
      { href: '/admin/reports', icon: FileBarChart, labelKey: 'reports' },
      { href: '/admin/editor', icon: Edit3, labelKey: 'live_editor' },
      { href: '/admin/working-hours', icon: Clock, labelKey: 'working_hours' },
      { href: '/admin/settings', icon: Settings, labelKey: 'settings' },
    ]
  }
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/dashboard';
    return pathname?.startsWith(href);
  };

  const labelMap: Record<string, string> = {
    'live_editor': isRTL ? 'محرر الموقع' : 'Live Editor',
    'payments': isRTL ? 'المدفوعات' : 'Payments',
    'calendar_view': isRTL ? 'التقويم' : 'Calendar',
    'prescriptions': isRTL ? 'الوصفات الطبية' : 'Prescriptions',
    'reports': isRTL ? 'التقارير' : 'Reports',
  };

  const sectionLabels = [
    isRTL ? 'الرئيسية' : 'MAIN',
    isRTL ? 'المحتوى' : 'CONTENT',
    isRTL ? 'التواصل' : 'FEEDBACK',
    isRTL ? 'النظام' : 'SYSTEM',
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => window.innerWidth < 1024 && onClose()}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/25">
            A
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold text-white truncate">{isRTL ? 'د. أحمد عبد اللطيف' : 'Dr. Ahmed'}</h1>
            <p className="text-[10px] text-slate-400 font-medium">{isRTL ? 'لوحة التحكم' : 'Admin Panel'}</p>
          </div>
        </Link>
      </div>

      <div className="mx-5 h-px bg-white/5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-hide">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {sectionLabels[idx]}
              </span>
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                      active
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <item.icon size={16} className={active ? "text-indigo-400" : "text-slate-500"} />
                    <span>{labelMap[item.labelKey] || t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 pb-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={14} />
          {t('logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 z-40 hidden w-[240px] flex-col bg-[#0f172a] lg:flex",
        isRTL ? "right-0 border-l border-white/5" : "left-0 border-r border-white/5"
      )}>
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
            <motion.aside 
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={cn("absolute inset-y-0 w-[260px] bg-[#0f172a] flex shadow-2xl", isRTL ? "right-0" : "left-0")}
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
