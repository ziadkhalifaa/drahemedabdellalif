'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from './admin-layout';
import { 
  LogOut, LayoutDashboard, Calendar, CalendarDays, FileText, 
  Package, MessageSquare, Star, X, Image, 
  Settings, ChevronDown, Users, Edit3,
  Clock, Bell, Mail, Building2, CreditCard,
  Stethoscope, Pill, FileBarChart, Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, Link } from '@/i18n/routing';
import { useState } from 'react';

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
      { href: '/admin/testimonials', icon: MessageSquare, labelKey: 'testimonials' },
      { href: '/admin/messages', icon: Mail, labelKey: 'messages' },
      { href: '/admin/newsletter', icon: Bell, labelKey: 'newsletterLabel' },
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/dashboard';
    return pathname?.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a1628] dark:bg-[#060e1a] text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] via-transparent to-primary/[0.02] pointer-events-none" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Brand Header */}
      <div className="relative px-5 pt-7 pb-5">
        <Link href="/admin" className="flex items-center gap-3.5 group" onClick={() => window.innerWidth < 1024 && onClose()}>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-500 group-hover:shadow-primary/40 group-hover:scale-105">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a1628] dark:border-[#060e1a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[13px] font-bold text-white truncate leading-tight">{isRTL ? 'د. أحمد عبد اللطيف' : 'Dr. Ahmed Abdellatif'}</h2>
            <p className="text-[10px] text-white/30 font-medium mt-0.5 uppercase tracking-wider">{isRTL ? 'لوحة التحكم' : 'Admin Panel'}</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar scrollbar-hide">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {/* Section header */}
            <div className="px-3 py-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/20">
                {isRTL ? (idx === 0 ? 'الرئيسية' : idx === 1 ? 'المحتوى' : idx === 2 ? 'التواصل' : 'النظام') : section.title}
              </span>
            </div>

            {/* Section items */}
            <div className="space-y-0.5">
              {section.items.map((item: any) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative",
                      active 
                        ? "bg-white/[0.08] text-white" 
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                    )}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div 
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                      active 
                        ? "bg-primary/20 text-primary" 
                        : "bg-white/[0.04] text-white/30 group-hover:bg-white/[0.08] group-hover:text-white/60"
                    )}>
                      <item.icon size={16} />
                    </div>
                    <span className="flex-1 truncate">
                      {item.labelKey === 'live_editor'
                        ? (isRTL ? 'محرر الموقع' : 'Live Editor')
                        : item.labelKey === 'clinics'
                        ? (isRTL ? 'العيادات' : 'Clinics')
                        : item.labelKey === 'payments'
                        ? (isRTL ? 'المدفوعات' : 'Payments')
                        : item.labelKey === 'calendar_view'
                        ? (isRTL ? 'التقويم' : 'Calendar')
                        : item.labelKey === 'prescriptions'
                        ? (isRTL ? 'الوصفات الطبية' : 'Prescriptions')
                        : item.labelKey === 'reports'
                        ? (isRTL ? 'التقارير' : 'Reports')
                        : t(item.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="relative px-4 pb-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-white/80 border border-white/[0.08]">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/80 truncate">{user?.name}</p>
            <p className="text-[10px] text-white/25 uppercase tracking-wider">{user?.role || 'admin'}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="group flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/30 transition-all hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/10"
        >
          <LogOut size={14} className="transition-transform group-hover:-translate-x-0.5" /> 
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 z-40 hidden w-[260px] flex-col bg-[#0a1628] dark:bg-[#060e1a] lg:flex",
          isRTL ? "right-0 border-l border-white/[0.06]" : "left-0 border-r border-white/[0.06]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={onClose} 
            />
            <motion.aside 
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "absolute inset-y-0 w-[280px] flex-col bg-[#0a1628] dark:bg-[#060e1a] flex shadow-2xl",
                isRTL ? "right-0" : "left-0"
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
