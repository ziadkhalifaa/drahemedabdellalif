'use client';

import { useState, useEffect, useRef } from 'react';
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
  Activity,
  User,
  ShieldCheck,
  Stethoscope,
  Newspaper,
  PlayCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
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
  const isRTL = locale === 'ar';
  
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [mounted, setMounted] = useState(false);
  const { user, token, isLoading: isAuthLoading, logout } = useAuth();
  const isLoggedIn = !!token;

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    api.get<Service[]>('/services')
      .then(res => setServices(res.slice(0, 6)))
      .catch(err => console.error("Failed to fetch services:", err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname as any, { locale: newLocale });
  };

  const isHomePage = pathname === '/' || pathname === `/${locale}`;
  
  if (!mounted) return null;

  const resourceItems = [
    { 
      title: t('patientGuide'), 
      desc: isRTL ? "تعليمات هامة وأسئلة شائعة قبل زيارتك." : "Essential instructions and FAQs for your visit.", 
      icon: <ShieldCheck className="text-orange-500" />, 
      href: "/patient-guide" 
    },
    { 
      title: t('successStories'), 
      desc: isRTL ? "قصص نجاح واقعية لمرضانا." : "Real success stories from our patients.", 
      icon: <Activity className="text-green-500" />, 
      href: "/success-stories" 
    },
    { 
      title: t('blog'), 
      desc: isRTL ? "أحدث المقالات الطبية في المسالك البولية." : "Latest medical articles and news.", 
      icon: <Newspaper className="text-blue-500" />, 
      href: "/blog" 
    }
  ];

  const mediaItems = [
    { 
      title: tMedia('gallery'), 
      desc: isRTL ? "صور من العيادة والعمليات الجراحية." : "Clinic and surgery gallery.", 
      icon: <ImageIcon className="text-pink-500" />, 
      href: "/gallery" 
    },
    { 
      title: tMedia('videos'), 
      desc: isRTL ? "فيديوهات تعليمية ولقاءات للدكتور." : "Educational videos and interviews.", 
      icon: <PlayCircle className="text-red-500" />, 
      href: "/videos" 
    }
  ];

  return (
    <header 
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500",
        scrolled ? "py-3" : "py-6 lg:py-8"
      )}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 z-[60] bg-gradient-to-r from-primary to-blue-500 origin-left"
        style={{ scaleX }}
      />
      <motion.nav 
        layout
        className={cn(
          "relative flex items-center justify-between gap-4 px-6 py-2 transition-all duration-500 glass",
          scrolled 
            ? "w-[95%] lg:w-[85%] rounded-[2rem] shadow-2xl" 
            : "w-[98%] lg:w-[92%] rounded-[2.5rem] bg-white/50 dark:bg-slate-900/40 border-transparent shadow-none"
        )}
      >
        {/* Brand/Logo */}
        <Link href="/" className="relative z-10 shrink-0">
          <Logo className={cn("transition-all duration-500", scrolled ? "scale-90" : "scale-100")} />
        </Link>

        {/* Center Navigation - Desktop */}
        <div className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5">
          <NavLink href="/" label={t('home')} />
          
          <NavLink href="/about" label={t('aboutUs')} />
          
          <MenuTrigger 
            label={t('services')} 
            isActive={activeMenu === 'services'} 
            onMouseEnter={() => setActiveMenu('services')}
            href="/services"
          />
          
          <MenuTrigger 
            label={t('patientGuide')} 
            isActive={activeMenu === 'resources'} 
            onMouseEnter={() => setActiveMenu('resources')}
          />

          <MenuTrigger 
            label={t('media')} 
            isActive={activeMenu === 'media'} 
            onMouseEnter={() => setActiveMenu('media')}
          />

          <NavLink href="/contact" label={t('contact')} />
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Settings & Auth */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-800 text-foreground transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-blue-600" />}
                </motion.div>
              </AnimatePresence>
            </Button>
            
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-2 px-3 py-1 text-[10px] font-black tracking-widest hover:text-primary transition-colors text-foreground"
            >
              <Languages size={14} className="text-primary" />
              <span>{locale.toUpperCase()}</span>
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            {!isAuthLoading && (
              isLoggedIn ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="h-8 rounded-full font-bold text-[10px] px-3 gap-2">
                    <User size={12} />
                    {isRTL ? 'ملفي' : 'Account'}
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="h-8 rounded-full font-bold text-[10px] px-3">
                      {tAuth('login.submit')}
                    </Button>
                  </Link>
                  <div className="w-[1px] h-3 bg-border mx-0.5" />
                  <Link href="/auth/register">
                    <Button variant="ghost" size="sm" className="h-8 rounded-full font-bold text-[10px] px-3">
                      {tAuth('register.submit')}
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Premium CTA */}
          <Link href="/booking">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-6 py-2.5 rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-gold animate-pulse-slow opacity-90" />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10 flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                <Calendar size={14} />
                {t('bookNow')}
              </span>
            </motion.button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground" 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mega Menu Content */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute top-full left-0 right-0 pt-2 hidden lg:flex justify-center px-4"
          >
            <div className="w-full max-w-6xl glass rounded-[2.5rem] shadow-premium overflow-hidden grid grid-cols-[1fr_320px] border border-white/20 dark:border-white/10">
              <div className="p-8 grid grid-cols-2 gap-4">
                {activeMenu === 'services' ? (
                  services.map((service, idx) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link 
                        href={`/services/${service.slug || service.id}`}
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-primary/5 group/item border border-transparent hover:border-primary/10"
                      >
                        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner border border-border">
                           <img 
                             src={getMediaUrl(service.image || '/images/placeholder.png')} 
                             alt={isRTL ? service.titleAr : service.titleEn}
                             className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                           />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-foreground group-hover/item:text-primary transition-colors line-clamp-1">
                             {isRTL ? service.titleAr : service.titleEn}
                          </h4>
                          <p className="text-[10px] text-muted mt-1 line-clamp-1 opacity-70">
                             {isRTL ? service.descriptionAr : service.descriptionEn}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  (activeMenu === 'resources' ? resourceItems : mediaItems).map((item, idx) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link 
                        href={item.href as any}
                        className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:bg-primary/5 group/item"
                      >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary transition-transform group-hover/item:scale-110">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-foreground group-hover/item:text-primary transition-colors">{item.title}</h4>
                          <p className="text-[10px] text-muted mt-1 line-clamp-2 opacity-70 leading-relaxed">{item.desc}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Right Sidebar - Spotlight */}
              <div className="bg-primary/[0.03] p-8 flex flex-col justify-between border-s border-border">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {isRTL ? 'أبرز التحديثات' : 'Spotlight'}
                  </div>
                  <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-border shadow-sm">
                    <p className="text-xs font-bold text-foreground leading-relaxed">
                       {isRTL 
                         ? 'اكتشف أحدث تقنيات الهوليب (HoLEP) لعلاج تضخم البروستاتا بالليزر.' 
                         : 'Discover the latest HoLEP techniques for laser prostate treatment.'}
                    </p>
                    <Link href="/blog" className="text-primary text-[10px] font-black mt-4 inline-flex items-center gap-2 hover:gap-3 transition-all group/link">
                      {isRTL ? 'اقرأ المزيد' : 'Read More'} 
                      <ChevronRight size={12} className={cn("transition-transform", isRTL && "rotate-180 group-hover/link:-translate-x-1", !isRTL && "group-hover/link:translate-x-1")} />
                    </Link>
                  </div>

                  <div className="space-y-3">
                     <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">{isRTL ? 'الدعم' : 'Support'}</h5>
                     <Link href="/contact" className="flex items-center gap-3 text-[11px] font-bold text-muted hover:text-primary transition-colors">
                        <PhoneCall size={14} className="text-primary" />
                        {isRTL ? 'اتصل بنا للمساعدة' : 'Contact us for help'}
                     </Link>
                  </div>
                </div>
                
                <Link href="/booking">
                   <Button className="w-full rounded-xl py-5 font-black bg-white dark:bg-slate-900 border border-border text-foreground hover:bg-primary hover:text-white transition-all gap-2 group/btn shadow-sm text-xs">
                     {t('bookNow')} 
                     <ChevronRight size={14} className={cn("transition-transform", isRTL ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1")} />
                   </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden"
          >
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="h-full flex flex-col p-6 pt-24"
            >
              <div className="space-y-6 overflow-y-auto pb-20">
                {/* Mobile Links */}
                <div className="grid gap-2">
                  <MobileNavLink href="/" label={t('home')} onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/about" label={t('aboutUs')} onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/services" label={t('services')} onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/patient-guide" label={t('patientGuide')} onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/gallery" label={t('media')} onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/contact" label={t('contact')} onClick={() => setMobileOpen(false)} />
                </div>

                <div className="h-[1px] bg-border" />

                {/* Mobile Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={toggleLanguage} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary/5 border border-primary/10 gap-2">
                      <Languages size={20} className="text-primary" />
                      <span className="text-[10px] font-black tracking-widest uppercase">{isRTL ? 'English' : 'العربية'}</span>
                   </button>
                   <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary/5 border border-primary/10 gap-2">
                      {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
                      <span className="text-[10px] font-black tracking-widest uppercase">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                   </button>
                </div>

                {!isAuthLoading && (
                  isLoggedIn ? (
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full rounded-2xl py-6 font-black gap-2">
                        <User size={18} />
                        {isRTL ? 'ملفي' : 'Account'}
                      </Button>
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="w-full">
                        <Button variant="outline" className="w-full rounded-2xl py-6 font-black">
                          {tAuth('login.submit')}
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="w-full">
                        <Button className="w-full rounded-2xl py-6 font-black">
                          {tAuth('register.submit')}
                        </Button>
                      </Link>
                    </div>
                  )
                )}
              </div>

              {/* Mobile Fixed CTA */}
              <div className="absolute bottom-6 left-6 right-6">
                <Link href="/booking" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-2xl py-7 font-black bg-gradient-gold text-white shadow-xl border-none text-base">
                    {t('bookNow')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label }: { href: string, label: string }) {
  return (
    <Link 
      href={href as any} 
      className="px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5"
    >
      {label}
    </Link>
  );
}

function MenuTrigger({ label, isActive, onMouseEnter, href }: { label: string, isActive: boolean, onMouseEnter: () => void, href?: string }) {
  const content = (
    <>
      {label} 
      <ChevronDown size={12} className={cn("transition-transform duration-300 opacity-50", isActive && "rotate-180 opacity-100")} />
    </>
  );

  const className = cn(
    "flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all rounded-full outline-none", 
    isActive ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-primary hover:bg-primary/5"
  );

  if (href) {
    return (
      <Link href={href as any} onMouseEnter={onMouseEnter} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onMouseEnter={onMouseEnter} className={className}>
      {content}
    </button>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string, label: string, onClick: () => void }) {
  return (
    <Link 
      href={href as any} 
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group"
    >
      <span className="text-lg font-black uppercase tracking-tight text-foreground/80 group-hover:text-primary">{label}</span>
      <ChevronRight size={20} className="text-muted opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all" />
    </Link>
  );
}
