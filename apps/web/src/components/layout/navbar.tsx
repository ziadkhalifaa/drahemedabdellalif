'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { 
  Moon, Sun, Menu, X, Calendar, ChevronDown, Languages, ChevronRight,
  ShieldCheck, Activity, Newspaper, PlayCircle, Image as ImageIcon, Check, User
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getMediaUrl } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';
import useSWR from 'swr';

export function Navbar() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tMedia = useTranslations('media');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const isRTL = locale === 'ar';
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const { data: servicesData } = useSWR<Service[]>('/services', api.get);
  const services = servicesData?.slice(0, 6) || [];
  const [mounted, setMounted] = useState(false);
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const isLoggedIn = !!token;

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname as any, { locale: newLocale });
  };

  if (!mounted) return null;

  const resourceItems = [
    { title: t('patientGuide'), desc: isRTL ? "تعليمات هامة قبل زيارتك." : "Essential instructions.", icon: <ShieldCheck className="text-orange-500" />, href: "/patient-guide" },
    { title: t('successStories'), desc: isRTL ? "قصص نجاح واقعية." : "Real success stories.", icon: <Activity className="text-green-500" />, href: "/success-stories" },
    { title: t('blog'), desc: isRTL ? "أحدث المقالات الطبية." : "Latest medical articles.", icon: <Newspaper className="text-blue-500" />, href: "/blog" }
  ];

  const mediaItems = [
    { title: tMedia('gallery'), desc: isRTL ? "صور من العيادة والعمليات." : "Clinic and surgery gallery.", icon: <ImageIcon className="text-pink-500" />, href: "/gallery" },
    { title: tMedia('videos'), desc: isRTL ? "فيديوهات تعليمية ولقاءات." : "Educational videos and interviews.", icon: <PlayCircle className="text-red-500" />, href: "/videos" }
  ];

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('aboutUs') },
    { href: '/services', label: t('services'), trigger: 'services' },
    { href: '/patient-guide', label: t('patientGuide'), trigger: 'resources' },
    { href: '/gallery', label: t('media'), trigger: 'media' },
    { href: '/contact', label: t('contact') }
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-border shadow-sm py-1" 
          : "bg-white dark:bg-slate-950 border-transparent py-2"
      )}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="relative z-10 shrink-0">
          <Logo className={cn("transition-all duration-300", scrolled ? "scale-90" : "scale-100")} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isTrigger = !!item.trigger;
            const isCurrent = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            
            return (
              <div 
                key={item.href} 
                className="relative group"
                onMouseEnter={() => isTrigger && setActiveMenu(item.trigger)}
              >
                <Link
                  href={item.href as any}
                  className={cn(
                    "flex items-center gap-1.5 py-3 text-sm font-bold uppercase tracking-wider transition-colors outline-none",
                    isCurrent ? "text-primary dark:text-primary-light" : "text-foreground/80 hover:text-primary dark:hover:text-primary-light"
                  )}
                >
                  {item.label}
                  {isTrigger && <ChevronDown size={14} className={cn("transition-transform", activeMenu === item.trigger && "rotate-180")} />}
                </Link>

                {/* Dropdown Menu */}
                {isTrigger && (
                  <AnimatePresence>
                    {activeMenu === item.trigger && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "absolute top-full pt-2 w-[320px] z-50",
                          isRTL ? "right-0" : "left-0"
                        )}
                      >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border p-3 flex flex-col gap-1 relative overflow-hidden">
                          {/* Triangle indicator */}
                          <div className={cn(
                             "absolute -top-2 w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-border rotate-45",
                             isRTL ? "right-8" : "left-8"
                          )} />
                          
                          {item.trigger === 'services' && services.map(service => (
                            <Link 
                              key={service.id} 
                              href={`/services/${service.slug || service.id}`}
                              className="relative z-10 flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                            >
                               <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-border/50">
                                 <img src={getMediaUrl(service.image || '/images/placeholder.png')} alt={isRTL ? service.titleAr : service.titleEn} className="w-full h-full object-cover" />
                               </div>
                               <div>
                                 <div className="text-sm font-bold text-foreground group-hover/item:text-primary">{isRTL ? service.titleAr : service.titleEn}</div>
                               </div>
                            </Link>
                          ))}
                          
                          {item.trigger === 'resources' && resourceItems.map(res => (
                            <Link 
                              key={res.href} 
                              href={res.href as any}
                              className="relative z-10 flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                            >
                              <div className="p-2 rounded-lg bg-primary/5 shrink-0 group-hover/item:scale-110 transition-transform">
                                {res.icon}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-foreground group-hover/item:text-primary">{res.title}</div>
                                <div className="text-xs text-muted mt-0.5">{res.desc}</div>
                              </div>
                            </Link>
                          ))}

                          {item.trigger === 'media' && mediaItems.map(med => (
                            <Link 
                              key={med.href} 
                              href={med.href as any}
                              className="relative z-10 flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                            >
                              <div className="p-2 rounded-lg bg-primary/5 shrink-0 group-hover/item:scale-110 transition-transform">
                                {med.icon}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-foreground group-hover/item:text-primary">{med.title}</div>
                                <div className="text-xs text-muted mt-0.5">{med.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-600" />}
            </Button>
            
            <div ref={langRef} className="relative">
              <Button variant="ghost" size="sm" onClick={() => setLangOpen(!langOpen)} className="rounded-full font-bold gap-2">
                <Languages size={16} />
                <span>{locale === 'ar' ? 'العربية' : 'EN'}</span>
                <ChevronDown size={14} className={cn("transition-transform", langOpen && "rotate-180")} />
              </Button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn("absolute top-full mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-border p-2 z-50", isRTL ? "left-0" : "right-0")}
                  >
                    <button onClick={() => { if(locale !== 'ar') router.replace(pathname as any, { locale: 'ar' }); setLangOpen(false); }} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800", locale === 'ar' && "text-primary bg-primary/5")}>العربية</button>
                    <button onClick={() => { if(locale !== 'en') router.replace(pathname as any, { locale: 'en' }); setLangOpen(false); }} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800", locale === 'en' && "text-primary bg-primary/5")}>English</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-px h-6 bg-border" />

          {!isAuthLoading && (
            isLoggedIn ? (
              <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button variant="outline" size="sm" className="rounded-full font-bold gap-2">
                  <User size={14} />
                  {isRTL ? 'ملفي' : 'Account'}
                </Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login"><Button variant="ghost" size="sm" className="rounded-full font-bold">{tAuth('login.submit')}</Button></Link>
                <Link href="/auth/register"><Button variant="default" size="sm" className="rounded-full font-bold">{tAuth('register.submit')}</Button></Link>
              </div>
            )
          )}

          <Link href="/booking">
            <Button className="rounded-full font-black bg-gradient-gold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all gap-2 px-6">
              <Calendar size={16} />
              {t('bookNow')}
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 top-[88px] z-40 bg-white dark:bg-slate-950 overflow-y-auto lg:hidden"
          >
            <div className="p-6 space-y-6">
              <div className="grid gap-2">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href as any} onClick={() => setMobileOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent transition-colors font-bold text-lg">
                    {item.label}
                    <ChevronRight size={20} className={cn("text-muted opacity-50", isRTL && "rotate-180")} />
                  </Link>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={toggleLanguage} className="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 gap-2 font-bold text-sm">
                    <Languages size={24} className="text-primary" />
                    {isRTL ? 'English' : 'العربية'}
                 </button>
                 <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900 gap-2 font-bold text-sm">
                    {theme === 'dark' ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-blue-500" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                 </button>
              </div>

              {!isAuthLoading && (
                isLoggedIn ? (
                  <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-xl py-6 font-black gap-2 text-lg">
                      <User size={20} />
                      {isRTL ? 'ملفي الشخصي' : 'My Account'}
                    </Button>
                  </Link>
                ) : (
                  <div className="grid gap-3">
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl py-6 font-black text-lg">{tAuth('login.submit')}</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full rounded-xl py-6 font-black text-lg">{tAuth('register.submit')}</Button>
                    </Link>
                  </div>
                )
              )}

              <div className="pt-4 pb-20">
                <Link href="/booking" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-xl py-8 font-black bg-gradient-gold text-white shadow-xl text-xl gap-3">
                    <Calendar size={24} />
                    {t('bookNow')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
