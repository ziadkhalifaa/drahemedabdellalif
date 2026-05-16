'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from './admin-layout';
import { 
  LogOut, LayoutDashboard, Calendar, FileText, 
  Package, MessageSquare, Star, X, Image, 
  Settings, ChevronRight, PieChart, Users, Edit3,
  Clock, Bell, ShieldCheck, Mail, Users2, Layout,
  Building2, CreditCard
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
      { href: '/admin/clinics', icon: Building2, labelKey: 'clinics' },
      { href: '/admin/payments', icon: CreditCard, labelKey: 'payments' },
      { href: '/admin/editor', icon: Edit3, labelKey: 'live_editor' },
    ]
  },
  {
    title: 'content',
    items: [
      { href: '/admin/hero-slides', icon: Layout, labelKey: 'Hero Slides' },
      { href: '/admin/services', icon: Package, labelKey: 'Services' },
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
      { href: '/admin/newsletter', icon: Bell, labelKey: 'newsletter' },
    ]
  },
  {
    title: 'system',
    items: [
      { href: '/admin/patients', icon: Users2, labelKey: 'patients' },
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#072a44] dark:bg-slate-950 text-white relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      {/* Brand Header */}
      <div className="relative flex items-center justify-between px-6 py-8 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight uppercase">Dr. Ahmed</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black">Admin Console</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar scrollbar-hide">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
               {isRTL ? (idx === 0 ? 'الرئيسية' : idx === 1 ? 'المحتوى' : idx === 2 ? 'التفاعل' : 'النظام') : section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300",
                    isActive(item.href) 
                      ? "bg-gradient-to-r from-primary/40 to-primary/20 text-white shadow-xl border border-white/10" 
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={cn(
                      "transition-all duration-300",
                      isActive(item.href) ? "text-primary-light scale-110" : "text-white/30 group-hover:text-white/60"
                    )} />
                    <span>{item.labelKey === 'live_editor'
                      ? (isRTL ? 'محرر الموقع' : 'Live Editor')
                      : item.labelKey === 'clinics'
                      ? (isRTL ? 'العيادات' : 'Clinics')
                      : item.labelKey === 'payments'
                      ? (isRTL ? 'المدفوعات' : 'Payments')
                      : t(item.labelKey)}</span>
                  </div>
                  {isActive(item.href) && (
                    <motion.div 
                      layoutId="active-indicator" 
                      className="w-1.5 h-1.5 rounded-full bg-primary-light shadow-[0_0_8px_var(--primary-light)]" 
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="relative p-4 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light/30 to-primary/30 flex items-center justify-center text-sm font-black border border-white/10">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate text-white">{user?.name}</p>
            <p className="text-[9px] text-white/40 truncate font-bold uppercase tracking-wider">{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs text-red-400 font-black transition-all hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/10"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-1" /> 
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
          "fixed inset-y-0 z-40 hidden w-72 flex-col border-white/10 bg-[#072a44] lg:flex shadow-[0_0_40px_rgba(0,0,0,0.5)]",
          isRTL ? "right-0 border-l" : "left-0 border-r"
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={onClose} 
            />
            <motion.aside 
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "absolute inset-y-0 w-80 flex-col bg-[#072a44] flex shadow-2xl",
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
