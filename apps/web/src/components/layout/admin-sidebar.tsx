'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from './admin-layout';
import {
  LogOut, LayoutDashboard, Calendar, CalendarDays, FileText,
  Star, X, Image, Settings, Users, Edit3,
  Clock, Mail, CreditCard, Stethoscope, Pill, FileBarChart, Newspaper, Shield
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
      { href: '/admin/audit-logs', icon: Shield, labelKey: 'audit_logs' },
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
    'audit_logs': isRTL ? 'سجل النشاط' : 'Audit Logs',
  };

  const sectionLabels = [
    isRTL ? 'الرئيسية' : 'MAIN',
    isRTL ? 'المحتوى' : 'CONTENT',
    isRTL ? 'التواصل' : 'FEEDBACK',
    isRTL ? 'النظام' : 'SYSTEM',
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0c1222] dark:bg-[#0c1222]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Brand */}
      <div className="relative px-5 pt-5 pb-4">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={() => window.innerWidth < 1024 && onClose()}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-500 to-purple-600 flex items-center justify-center text-[14px] font-black text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
            A
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold text-white truncate leading-tight">{isRTL ? 'د. أحمد عبد اللطيف' : 'Dr. Ahmed'}</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{isRTL ? 'لوحة التحكم' : 'Admin Panel'}</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
        <div className="space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
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
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                        active
                          ? "bg-indigo-500/[0.12] text-indigo-400"
                          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                      )}
                      onClick={() => window.innerWidth < 1024 && onClose()}
                    >
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500"
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                      )}
                      <item.icon
                        size={17}
                        className={cn(
                          "shrink-0 transition-colors duration-200",
                          active
                            ? "text-indigo-400"
                            : "text-slate-600 group-hover:text-slate-400"
                        )}
                      />
                      <span className="truncate">{labelMap[item.labelKey] || t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* User */}
      <div className="relative px-4 py-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.04] mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 flex items-center justify-center text-[12px] font-bold text-indigo-400 border border-indigo-500/10">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-red-500/[0.08] hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={15} className="shrink-0" />
          {t('logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 z-40 hidden w-[250px] flex-col bg-[#0c1222] lg:flex relative overflow-hidden",
        isRTL ? "right-0 border-l border-white/[0.04]" : "left-0 border-r border-white/[0.04]"
      )}>
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.aside
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn("absolute inset-y-0 w-[260px] bg-[#0c1222] flex shadow-2xl border-white/[0.04] relative overflow-hidden", isRTL ? "right-0 border-l" : "left-0 border-r")}
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
