'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from './admin-layout';
import { 
  LogOut, LayoutDashboard, Calendar, FileText, 
  Package, MessageSquare, Star, X, Image, 
  Settings, ChevronRight, PieChart, Users, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navSections = [
  {
    title: 'Main',
    items: [
      { href: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/admin/appointments', icon: Calendar, labelKey: 'appointments' },
      { href: '/admin/editor', icon: Edit3, labelKey: 'live_editor' },
    ]
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/hero-slides', icon: Image, labelKey: 'Hero Slides' },
      { href: '/admin/services', icon: Package, labelKey: 'Services' },
      { href: '/admin/techniques', icon: Star, labelKey: 'Techniques' },
      { href: '/admin/blog', icon: FileText, labelKey: 'blog' },
      { href: '/admin/media', icon: Image, labelKey: 'media' },
    ]
  },
  {
    title: 'Feedback',
    items: [
      { href: '/admin/testimonials', icon: Star, labelKey: 'testimonials' },
      { href: '/admin/messages', icon: MessageSquare, labelKey: 'messages' },
    ]
  },
  {
    title: 'System',
    items: [
      { href: '/admin/settings', icon: Settings, labelKey: 'settings' },
    ]
  }
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('admin');
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname?.endsWith('/admin');
    return pathname?.includes(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#072a44] text-white">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Dr. Ahmed</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Admin Panel</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item: any) => (
                <a
                  key={item.href}

                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive(item.href) 
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={cn(
                      "transition-transform group-hover:scale-110",
                      isActive(item.href) ? "text-white" : "text-white/40"
                    )} />
                    <span>{item.labelKey === 'live_editor' ? 'Live Website Editor' : t(item.labelKey)}</span>
                  </div>
                  {isActive(item.href) && (
                    <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 font-bold transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} /> 
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#072a44] lg:flex shadow-2xl">
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-72 flex-col bg-[#072a44] flex shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
