'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/context/auth-context';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Calendar, 
  ChevronDown, 
  Languages, 
  ArrowRight,
  ChevronRight,
  PhoneCall,
  Activity
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getMediaUrl } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';

export function Navbar() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tMedia = useTranslations('media');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [mounted, setMounted] = useState(false);
  const { user, token, logout } = useAuth();
  const isLoggedIn = !!token;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch real services with images
    api.get<Service[]>('/services')
      .then(setServices)
      .catch(err => console.error("Failed to fetch services:", err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const resourceItems = [
    { 
      title: t('patientGuide'), 
      desc: locale === 'ar' ? "تعليمات هامة وأسئلة شائعة قبل زيارتك." : "Essential instructions and FAQs for your visit.", 
      icon: <Activity className="text-orange-500" />, 
      href: "/patient-guide" 
    },
    { 
      title: t('successStories'), 
      desc: locale === 'ar' ? "قصص نجاح واقعية لمرضانا." : "Real success stories from our patients.", 
      icon: <Activity className="text-green-500" />, 
      href: "/success-stories" 
    },
    { 
      title: t('blog'), 
      desc: locale === 'ar' ? "أحدث المقالات الطبية في المسالك البولية." : "Latest medical articles and news.", 
      icon: <Activity className="text-blue-500" />, 
      href: "/blog" 
    }
  ];

  const mediaItems = [
    { 
      title: tMedia('gallery'), 
      desc: locale === 'ar' ? "صور من العيادة والعمليات الجراحية." : "Clinic and surgery gallery.", 
      icon: <Activity className="text-pink-500" />, 
      href: "/gallery" 
    },
    { 
      title: tMedia('videos'), 
      desc: locale === 'ar' ? "فيديوهات تعليمية ولقاءات للدكتور." : "Educational videos and interviews.", 
      icon: <Activity className="text-red-500" />, 
      href: "/videos" 
    }
  ];

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname as any, { locale: newLocale });
  };

  const isHomePage = pathname === '/' || pathname === `/${locale}`;
  const isSolid = scrolled || !isHomePage;

  if (!mounted) return null;

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4 lg:py-6"
      )}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav 
          className={cn(
            "relative flex items-center justify-between px-6 py-2 transition-all duration-500 rounded-[2.5rem]",
            scrolled 
              ? "bg-[var(--background)]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[var(--border)]" 
              : isHomePage ? "bg-transparent" : "bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--border)]"
          )}
        >
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <Logo className={cn("transition-transform duration-300", scrolled ? "scale-90" : "scale-100")} />
          </Link>

          {/* Nav Items */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/" label={t('home')} isSolid={isSolid} />
            
            <MegaMenuTrigger 
              label={t('services')} 
              isActive={activeMenu === 'services'} 
              onMouseEnter={() => setActiveMenu('services')}
              isSolid={isSolid}
            />
            
            <MegaMenuTrigger 
              label={t('patientGuide')} 
              isActive={activeMenu === 'resources'} 
              onMouseEnter={() => setActiveMenu('resources')}
              isSolid={isSolid}
            />

            <MegaMenuTrigger 
              label={t('media')} 
              isActive={activeMenu === 'media'} 
              onMouseEnter={() => setActiveMenu('media')}
              isSolid={isSolid}
            />

            <NavLink href="/contact" label={t('contact')} isSolid={isSolid} />
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
             <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-black text-[var(--foreground)]">
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </Button>
                <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1 text-[10px] font-black tracking-widest hover:text-[var(--primary)] text-[var(--foreground)]">
                  <Languages size={14} className="text-[var(--primary)]" />
                  <span>{locale === 'ar' ? 'EN' : 'AR'}</span>
                </button>
             </div>

             {isLoggedIn ? (
               <div className="flex items-center gap-2">
                 <Link href="/dashboard">
                   <Button variant="ghost" className="rounded-full font-bold text-sm px-5">
                      {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                   </Button>
                 </Link>
                 <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full border-red-500/20 text-red-500 hover:bg-red-500/5">
                    {locale === 'ar' ? 'خروج' : 'Logout'}
                 </Button>
               </div>
             ) : (
               <Link href="/auth/login">
                 <Button variant="ghost" className="rounded-full font-bold text-sm px-5">{tAuth('login.submit')}</Button>
               </Link>
             )}

            <Link href="/booking">
              <Button className="rounded-full px-8 py-2 font-black shadow-xl shadow-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white border-none">
                {t('bookNow')}
              </Button>
            </Link>
          </div>

          <button className={cn("lg:hidden p-2 rounded-full", !isSolid ? "text-white" : "text-[var(--foreground)]")} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mega Menu Content */}
        <AnimatePresence mode="wait">
          {activeMenu && (
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute left-0 right-0 px-4 pt-2 hidden lg:block"
              onMouseEnter={() => setActiveMenu(activeMenu)}
            >
              <div className="mx-auto max-w-6xl bg-[var(--background)]/95 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--border)] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="grid grid-cols-[1fr_320px]">
                  <div className="p-10 grid grid-cols-2 gap-x-8 gap-y-4">
                    {activeMenu === 'services' ? (
                      services.map((service) => (
                        <Link 
                          key={service.id} 
                          href={`/services/${service.id}`}
                          className="flex items-center gap-5 p-4 rounded-3xl transition-all hover:bg-[var(--primary)]/5 group/item border border-transparent hover:border-[var(--primary)]/10"
                        >
                          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner border border-[var(--border)]">
                             <img 
                               src={getMediaUrl(service.image || '/images/placeholder.png')} 
                               alt={locale === 'ar' ? service.titleAr : service.titleEn}
                               className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                             />
                          </div>
                          <div>
                            <h4 className="font-black text-base text-[var(--foreground)] group-hover/item:text-[var(--primary)] transition-colors line-clamp-1">
                               {locale === 'ar' ? service.titleAr : service.titleEn}
                            </h4>
                            <p className="text-xs text-[var(--muted)] mt-1 line-clamp-1">
                               {locale === 'ar' ? service.descriptionAr : service.descriptionEn}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      (activeMenu === 'resources' ? resourceItems : mediaItems).map((item: any) => (
                        <Link 
                          key={item.href} 
                          href={item.href as any}
                          className="flex items-start gap-5 p-4 rounded-3xl transition-all hover:bg-[var(--primary)]/5 group/item"
                        >
                          <div className="h-12 w-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-black text-base text-[var(--foreground)] group-hover/item:text-[var(--primary)]">{item.title}</h4>
                            <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{item.desc}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  
                  {/* Right Sidebar */}
                  <div className="bg-[var(--primary)]/5 p-10 flex flex-col justify-between border-l border-[var(--border)]">
                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-70">
                         {locale === 'ar' ? 'أبرز التحديثات' : 'Spotlight'}
                      </h5>
                      <div className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)] shadow-sm">
                        <p className="text-sm font-black text-[var(--foreground)] leading-tight">
                           {locale === 'ar' ? 'اكتشف أحدث التقنيات في جراحة الكلى والبروستاتا.' : 'Discover the latest techniques in Kidney and Prostate surgery.'}
                        </p>
                        <Link href="/blog" className="text-[var(--primary)] text-[10px] font-black mt-4 inline-flex items-center gap-2 hover:gap-3 transition-all">
                          {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'} <ArrowRight size={12} />
                        </Link>
                      </div>

                      <div className="space-y-3 pt-4">
                         <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">{locale === 'ar' ? 'الدعم' : 'Support'}</h5>
                         <Link href="/contact" className="flex items-center gap-3 text-xs font-bold text-[var(--muted)] hover:text-[var(--primary)]">
                            <PhoneCall size={16} className="text-[var(--primary)]" />
                            {locale === 'ar' ? 'اتصل بنا للمساعدة' : 'Contact us for help'}
                         </Link>
                      </div>
                    </div>
                    
                    <Link href="/booking">
                       <Button className="w-full rounded-2xl py-6 font-black bg-white dark:bg-zinc-900 border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white transition-all gap-2 group/btn shadow-sm">
                         {t('bookNow')} <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="lg:hidden absolute top-full left-0 right-0 p-4 z-40">
            <div className="bg-[var(--background)]/95 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--border)] shadow-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
               <div className="space-y-4">
                  <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-50">{t('services')}</h4>
                  <div className="grid gap-2">
                    {services.map((service) => (
                      <Link key={service.id} href={`/services/${service.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[var(--primary)]/[0.02] border border-[var(--border)]/50">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                           <img src={service.image || '/images/placeholder.png'} alt={service.titleAr} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-sm">{locale === 'ar' ? service.titleAr : service.titleEn}</div>
                      </Link>
                    ))}
                  </div>
               </div>
               <Link href="/booking" className="block pt-4">
                  <Button className="w-full rounded-2xl py-7 font-black bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-xl shadow-[var(--primary)]/20 border-none">Book Now</Button>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label, isSolid }: { href: string, label: string, isSolid: boolean }) {
  return (
    <Link href={href as any} className={cn("px-5 py-2 text-sm font-black transition-all rounded-full", !isSolid ? "text-white/80 hover:text-white" : "text-[var(--foreground)]/70 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5")}>
      {label}
    </Link>
  );
}

function MegaMenuTrigger({ label, isActive, onMouseEnter, isSolid }: any) {
  return (
    <button onMouseEnter={onMouseEnter} className={cn("flex items-center gap-1.5 px-5 py-2 text-sm font-black transition-all rounded-full outline-none", isActive ? (isSolid ? "text-[var(--primary)] bg-[var(--primary)]/5" : "text-white") : (!isSolid ? "text-white/80 hover:text-white" : "text-[var(--foreground)]/70 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"))}>
      {label} <ChevronDown size={14} className={cn("transition-transform duration-300", isActive && "rotate-180")} />
    </button>
  );
}
