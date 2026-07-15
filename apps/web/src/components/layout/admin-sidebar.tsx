'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from './admin-layout';
import {
  LayoutDashboard, Calendar, CalendarDays, FileText,
  Star, X, Image, Settings, Users, Edit3,
  Clock, Mail, CreditCard, Stethoscope, Pill, FileBarChart, Newspaper, Shield, Building2, Send, CalendarOff,
  Search, LogOut as LogOutIcon,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, Link } from '@/i18n/routing';
import React, { useState, useMemo } from 'react';

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
      { href: '/admin/clinics', icon: Building2, labelKey: 'clinics' },
      { href: '/admin/blog', icon: FileText, labelKey: 'blog' },
      { href: '/admin/media', icon: Image, labelKey: 'media' },
    ]
  },
  {
    title: 'feedback',
    items: [
      { href: '/admin/testimonials', icon: Star, labelKey: 'testimonials' },
      { href: '/admin/messages', icon: Mail, labelKey: 'messages' },
      { href: '/admin/newsletter', icon: Send, labelKey: 'newsletter' },
    ]
  },
  {
    title: 'system',
    items: [
      { href: '/admin/patients', icon: Users, labelKey: 'patients' },
      { href: '/admin/reports', icon: FileBarChart, labelKey: 'reports' },
      { href: '/admin/editor', icon: Edit3, labelKey: 'live_editor' },
      { href: '/admin/working-hours', icon: Clock, labelKey: 'working_hours' },
      { href: '/admin/availability', icon: CalendarOff, labelKey: 'availability' },
      { href: '/admin/audit-logs', icon: Shield, labelKey: 'audit_logs' },
      { href: '/admin/settings', icon: Settings, labelKey: 'settings' },
    ]
  }
];

const sectionIcons = [LayoutDashboard, FileText, Mail, Shield];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

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
    'clinics': isRTL ? 'العيادات' : 'Clinics',
    'newsletter': isRTL ? 'النشرة البريدية' : 'Newsletter',
    'availability': isRTL ? 'حجز المواعيد' : 'Availability',
  };

  const getLabel = (item: typeof navSections[0]['items'][0]) => labelMap[item.labelKey] || t(item.labelKey);

  const sectionLabels = [
    isRTL ? 'الرئيسية' : 'MAIN',
    isRTL ? 'المحتوى' : 'CONTENT',
    isRTL ? 'التواصل' : 'FEEDBACK',
    isRTL ? 'النظام' : 'SYSTEM',
  ];

  const allNavItems = useMemo(() =>
    navSections.flatMap(s => s.items),
    []
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const q = searchQuery.toLowerCase();
    return navSections
      .map(s => ({
        ...s,
        items: s.items.filter(item => getLabel(item).toLowerCase().includes(q))
      }))
      .filter(s => s.items.length > 0);
  }, [searchQuery]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0c1222] dark:bg-[#0c1222]">
      {/* Decorative bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-30%] w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Brand */}
      <div className="relative px-4 pt-5 pb-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <Link href="/admin" className="flex items-center gap-3 group" onClick={() => window.innerWidth < 1024 && onClose()}>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-500 to-purple-600 flex items-center justify-center text-[16px] font-black text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
              DA
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c1222] animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold text-white truncate leading-tight group-hover:text-indigo-300 transition-colors">{isRTL ? 'د. أحمد عبد اللطيف' : 'Dr. Ahmed Abdellatif'}</h1>
            <p className="text-[9px] text-slate-500 font-medium mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isRTL ? 'لوحة التحكم' : 'Admin Panel'}
            </p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="relative px-4 pb-3">
        <div className="relative">
          <Search size={14} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-600", isRTL ? "right-3" : "left-3")} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            className={cn(
              "w-full py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-400 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 focus:bg-indigo-500/[0.04] transition-all",
              isRTL ? "pr-8 pl-3 text-right" : "pl-8 pr-3"
            )}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400", isRTL ? "left-3" : "right-3")}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
        {searchQuery.trim() ? (
          <div className="space-y-0.5 px-1">
            {allNavItems.filter(item => getLabel(item).toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href as any}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                    active ? "bg-indigo-500/[0.12] text-indigo-400" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                  )}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  {active && (
                    <motion.div layoutId="sidebar-active-search" className={cn("absolute top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500", isRTL ? "right-0 rounded-l-full" : "left-0 rounded-r-full")} transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                  )}
                  <item.icon size={17} className={cn("shrink-0", active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400")} />
                  <span className="truncate">{getLabel(item)}</span>
                </Link>
              );
            })}
            {allNavItems.filter(item => getLabel(item).toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="py-8 text-center">
                <Search size={18} className="mx-auto mb-2 text-slate-700" />
                <p className="text-[11px] text-slate-600">{isRTL ? 'لا توجد نتائج' : 'No results found'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredSections.map((section, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 px-3 mb-2">
                  {React.createElement(sectionIcons[idx] || Activity, { size: 10, className: "text-slate-700" })}
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
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
                            ? "bg-gradient-to-r from-indigo-500/[0.12] to-indigo-500/[0.04] text-indigo-400 shadow-sm shadow-indigo-500/5"
                            : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                        )}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                      >
                        {active && (
                          <motion.div
                            layoutId={`sidebar-active-${idx}`}
                            className={cn("absolute top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-400 to-purple-500", isRTL ? "right-0 rounded-l-full" : "left-0 rounded-r-full")}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          />
                        )}
                        <item.icon
                          size={17}
                          className={cn(
                            "shrink-0 transition-all duration-200",
                            active
                              ? "text-indigo-400"
                              : "text-slate-600 group-hover:text-slate-400 group-hover:scale-110"
                          )}
                        />
                        <span className="truncate">{getLabel(item)}</span>
                        {active && (
                          <span className={cn("ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse", isRTL ? "mr-auto ml-0" : "ml-auto")} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* User */}
      <div className="relative px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.06] mb-2.5 group hover:from-indigo-500/[0.06] hover:to-indigo-500/[0.03] hover:border-indigo-500/20 transition-all duration-200">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 flex items-center justify-center text-[12px] font-bold text-indigo-400 border border-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c1222]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate leading-tight">{user?.name || (isRTL ? 'أدمن' : 'Admin')}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 text-[8px] font-bold uppercase tracking-wider">{user?.role || 'admin'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-red-500/[0.08] hover:text-red-400 transition-all duration-200 group"
        >
          <LogOutIcon size={15} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {t('logout')}
        </button>
      </div>
    </div>
  );

  // Desktop
  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 z-40 hidden w-[250px] flex-col bg-[#0c1222] lg:flex overflow-hidden",
        isRTL ? "right-0 border-l border-white/[0.04]" : "left-0 border-r border-white/[0.04]"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "absolute inset-y-0 w-[270px] bg-[#0c1222] flex shadow-2xl overflow-hidden",
                isRTL ? "right-0 border-l border-white/[0.04]" : "left-0 border-r border-white/[0.04]"
              )}
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
