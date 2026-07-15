'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Skeleton } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import {
  FileText, Printer, Calendar, Search,
  LayoutDashboard, User as UserIcon, LogOut,
  Clock, Pill, HeartPulse, ChevronRight, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PrescriptionsPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token === null) return;
    if (!token) { router.push('/auth/login'); return; }
    api.get<any[]>('/prescriptions/my', token)
      .then(setPrescriptions)
      .catch(err => console.error("Failed to fetch prescriptions:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => logout();

  const filteredPrescriptions = useMemo(() =>
    prescriptions.filter(r =>
      (r.diagnosisAr && r.diagnosisAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.diagnosisEn && r.diagnosisEn.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [prescriptions, searchTerm]
  );

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('menu.overview'), href: '/dashboard' },
    { id: 'appointments', icon: Calendar, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { id: 'reports', icon: FileText, label: t('menu.reports'), href: '/dashboard/reports' },
    { id: 'prescriptions', icon: Pill, label: t('menu.prescriptions'), href: '/dashboard/prescriptions', active: true },
    { id: 'profile', icon: UserIcon, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#0b1120] dark:to-indigo-950/20">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-indigo-200 dark:border-indigo-800/40 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-white/40">{isRTL ? 'جاري تحميل الروشتات...' : 'Loading prescriptions...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative pt-28 pb-20 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-[#0b1120] dark:to-indigo-950/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-5%] w-[35vw] h-[35vw] bg-orange-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block space-y-5">
              <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/30 dark:border-white/5 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
                <div className="relative overflow-hidden px-5 pt-8 pb-6 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900/80 dark:to-indigo-950/80">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl transform -translate-x-1/3 translate-y-1/3" />
                  <div className="relative text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/10 mb-3">
                      <span className="text-2xl font-black text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'Patient'}</p>
                    <p className="text-[10px] font-semibold text-indigo-200/70 uppercase tracking-widest mt-1">{isRTL ? 'حساب مريض' : 'Patient Account'}</p>
                    <div className="flex justify-center gap-1.5 mt-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white/80">{prescriptions.length} {isRTL ? 'روشتة' : 'rx'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="space-y-0.5">
                    {sidebarItems.map((item) => (
                      <Link key={item.id} href={item.href as any}
                        className={cn(
                          "group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all",
                          item.active
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            : "text-slate-500 dark:text-white/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
                        )}
                      >
                        <item.icon size={17} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                        <ChevronRight size={13} className={cn("ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", isRTL && "rotate-180", item.active && "opacity-100")} />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={17} className="shrink-0" />
                      {t('menu.logout')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-xl shadow-indigo-500/20">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <HeartPulse size={28} className="text-white/80 mb-3" />
                <h4 className="text-sm font-black text-white mb-1.5">{t('needHelp')}</h4>
                <p className="text-[11px] font-medium text-white/70 mb-4 leading-relaxed">{t('helpDesc')}</p>
                <Link href="/contact">
                  <Button className="w-full h-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 rounded-xl text-[11px] font-bold transition-all">
                    {t('contactSupport')}
                  </Button>
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
              {/* Header */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Pill size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{isRTL ? 'الروشتات الطبية' : 'Medical Prescriptions'}</h1>
                    <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{isRTL ? 'استعراض وطباعة روشتاتك السابقة' : 'View and print your past prescriptions'}</p>
                  </div>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={16} />
                  <input
                    type="text"
                    placeholder={isRTL ? 'ابحث عن روشتة...' : 'Search prescriptions...'}
                    className={cn("w-full py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-white/40 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-[13px] transition-all placeholder:text-slate-400", isRTL ? "pr-10 pl-4" : "pl-10 pr-4")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Prescriptions List */}
              {filteredPrescriptions.length > 0 ? (
                <div className="grid gap-6">
                  {filteredPrescriptions.map((rx, i) => (
                    <motion.div
                      key={rx.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.06 }}
                    >
                      <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-xl shadow-black/5">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/10 pb-5 mb-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Pill size={15} className="text-white" />
                              </div>
                              <h2 className="text-lg font-black text-slate-900 dark:text-white">{isRTL ? 'د. أحمد عبد اللطيف' : 'Dr. Ahmed Abdellatif'}</h2>
                            </div>
                            <p className="text-[12px] font-medium text-slate-500 dark:text-white/40">{isRTL ? 'استشاري المسالك البولية والذكورة' : 'Urology & Andrology Consultant'}</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-slate-400 dark:text-white/35 pt-1">
                              <span><strong className="text-slate-500 dark:text-white/50">{isRTL ? 'المريض:' : 'Patient:'}</strong> {user?.name}</span>
                              <span><strong className="text-slate-500 dark:text-white/50">{isRTL ? 'التاريخ:' : 'Date:'}</strong> {new Date(rx.createdAt).toLocaleDateString()}</span>
                              <span><strong className="text-slate-500 dark:text-white/50">{isRTL ? 'التشخيص:' : 'Diagnosis:'}</strong> {rx.diagnosisAr || rx.diagnosisEn || '---'}</span>
                            </div>
                          </div>
                          <Button onClick={() => window.print()}
                            variant="outline"
                            className="shrink-0 rounded-xl font-bold gap-2 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-500/20"
                          >
                            <Printer size={16} />
                            {isRTL ? 'طباعة' : 'Print'}
                          </Button>
                        </div>

                        {/* Medications */}
                        <div className="space-y-3 min-h-[160px]">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-lg mb-4">
                            <Pill size={20} />
                            <span className="tracking-wider">Rx</span>
                          </div>
                          {Array.isArray(rx.medications) && rx.medications.length > 0 ? (
                            <div className="space-y-3">
                              {rx.medications.map((med: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start pb-3 border-b border-slate-50 dark:border-white/5 last:border-0 last:pb-0">
                                  <div className="h-7 w-7 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[12px] shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-[14px] text-slate-800 dark:text-white/80">{med.name}</h4>
                                    <p className="text-[13px] font-medium text-slate-500 dark:text-white/40 mt-0.5">{med.dosage}{med.frequency ? ` — ${med.frequency}` : ''}</p>
                                    {med.duration && <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">{med.duration}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[13px] text-slate-400 dark:text-white/30 italic">{isRTL ? 'لم يتم إضافة أدوية' : 'No medications listed'}</p>
                          )}
                        </div>

                        {/* Instructions */}
                        {(rx.instructionsAr || rx.instructionsEn) && (
                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
                            <h5 className="font-bold text-[11px] text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">{isRTL ? 'تعليمات إضافية' : 'Additional Instructions'}</h5>
                            <p className="text-[13px] font-medium text-slate-600 dark:text-white/60 leading-relaxed">
                              {isRTL ? (rx.instructionsAr || rx.instructionsEn) : (rx.instructionsEn || rx.instructionsAr)}
                            </p>
                          </div>
                        )}

                        {/* Signature */}
                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 dark:text-white/25">
                          <span>{isRTL ? 'التوقيع:' : 'Signature:'} .......................</span>
                          <FileText size={18} className="opacity-30" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-white/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Pill size={28} className="text-slate-300 dark:text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white/60 mb-1">{isRTL ? 'لا توجد روشتات' : 'No Prescriptions'}</h3>
                  <p className="text-[13px] text-slate-400 dark:text-white/30 text-center max-w-sm">
                    {isRTL ? 'لم يتم تسجيل أي روشتات في ملفك الطبي بعد.' : 'No prescriptions have been recorded yet.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
