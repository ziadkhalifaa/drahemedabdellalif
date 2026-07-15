'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import { 
  Calendar, FileText, User as UserIcon, LogOut, Video,
  Clock, Pill, History, LayoutDashboard, HeartPulse, Activity, Star
} from 'lucide-react';
import { cn, formatTime12Hour } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MedicalTimeline } from '@/components/dashboard/medical-timeline';
import { useAuth } from '@/context/auth-context';

function DashboardContent() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, logout, isLoading } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  // Rating Modal States
  const rateAppointmentId = searchParams.get('rateAppointmentId');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (rateAppointmentId) {
      setShowReviewModal(true);
    }
  }, [rateAppointmentId]);

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [apptsData, reportsData, presData] = await Promise.all([
          api.get<any[]>('/appointments/my', token),
          api.get<any[]>('/reports/my', token),
          api.get<any[]>('/prescriptions/my', token).catch(() => [])
        ]);
        setAppointments(apptsData);
        setReports(reportsData);
        setPrescriptions(presData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, isLoading, router]);

  const activeAppointments = appointments.filter((a: any) => 
    a.status === 'approved' || a.status === 'pending'
  );

  const timelineItems = [
    ...appointments.map(a => ({ id: a.id, type: 'appointment' as const, title: a.service?.titleAr || a.service?.titleEn || t('medicalConsultation'), date: new Date(a.date), status: a.status })),
    ...reports.map(r => ({ id: r.id, type: 'report' as const, title: r.title, date: new Date(r.createdAt) })),
    ...prescriptions.map(p => ({ id: p.id, type: 'prescription' as const, title: p.diagnosisAr || p.diagnosisEn || t('prescriptionsLabel'), date: new Date(p.createdAt), data: { ...p, patient: user } }))
  ];

  const sidebarItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: t('menu.overview'), onClick: () => setActiveTab('overview'), active: activeTab === 'overview' },
    { id: 'timeline', icon: <History size={20} />, label: t('menu.medicalJourney'), onClick: () => setActiveTab('timeline'), active: activeTab === 'timeline' },
    { id: 'appointments', icon: <Calendar size={20} />, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { id: 'reports', icon: <FileText size={20} />, label: t('menu.reports'), href: '/dashboard/reports' },
    { id: 'prescriptions', icon: <FileText size={20} />, label: 'Prescriptions', href: '/dashboard/prescriptions' },
    { id: 'profile', icon: <UserIcon size={20} />, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-[var(--primary)]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative pt-32 pb-20 overflow-hidden bg-[var(--background)]">
        
        {/* Dynamic Abstract Background */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
           <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[280px_1fr] gap-10">
            
            {/* Sidebar (Premium Glass) */}
            <aside className="hidden lg:block space-y-6">
              <Card className="p-5 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/5 rounded-[2.5rem]">
                <div className="flex items-center gap-4 px-4 py-4 mb-4 border-b border-white/10">
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-blue-600 flex items-center justify-center text-white shadow-inner">
                      <span className="font-black text-xl">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                   </div>
                   <div className="overflow-hidden">
                      <p className="font-black text-[var(--foreground)] truncate">{user?.name}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Patient Account</p>
                   </div>
                </div>

                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    item.href ? (
                      <Link 
                        key={item.id} 
                        href={item.href as any}
                        className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all text-[var(--muted)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-4">
                           {item.icon}
                           {item.label}
                        </div>
                      </Link>
                    ) : (
                      <button 
                        key={item.id} 
                        onClick={item.onClick}
                        className={cn(
                          "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group",
                          item.active 
                            ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" 
                            : "text-[var(--muted)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        )}
                      >
                        {item.active && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        <div className="relative z-10 flex items-center gap-4">
                           {item.icon}
                           {item.label}
                        </div>
                      </button>
                    )
                  ))}
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-4"
                  >
                    <LogOut size={20} />
                    {t('menu.logout')}
                  </button>
                </div>
              </Card>

              {/* Support Banner */}
              <Card className="p-8 bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white border-none rounded-[2.5rem] shadow-2xl shadow-[var(--primary)]/20 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                 <HeartPulse size={32} className="mb-4 opacity-80" />
                 <h4 className="font-black text-xl mb-2">{t('needHelp')}</h4>
                 <p className="text-xs font-medium text-white/80 mb-6 leading-relaxed">{t('helpDesc')}</p>
                 <Link href="/contact" className="block w-full">
                   <Button className="w-full h-12 bg-white text-[var(--primary)] hover:bg-gray-50 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1">
                      {t('contactSupport')}
                   </Button>
                 </Link>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="space-y-10">
              
              {/* Header */}
              <motion.header 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--foreground)]">
                    {activeTab === 'overview' 
                      ? t('welcome', { name: user?.name?.split(' ')[0] || 'Patient' })
                      : t('medicalJourney')}
                  </h1>
                  <p className="text-[var(--muted)] font-medium mt-2">
                    {activeTab === 'overview' ? t('subtitle') : t('trackHistory')}
                  </p>
                </div>
                <Link href="/booking">
                  <Button className="h-14 px-8 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black shadow-xl shadow-[var(--primary)]/20 gap-3 transition-transform hover:-translate-y-1">
                    <Calendar size={18} />
                    {t('appointments.bookNow')}
                  </Button>
                </Link>
              </motion.header>

              {activeTab === 'overview' ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="space-y-10"
                >
                  {/* Stats Grid */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <StatCard 
                      icon={<Calendar />} 
                      color="blue"
                      label={t('upcoming')} 
                      value={activeAppointments.length.toString()} 
                    />
                    <StatCard 
                      icon={<FileText />} 
                      color="purple"
                      label={t('reportsLabel')} 
                      value={reports?.length?.toString() || "0"} 
                    />
                    <StatCard 
                      icon={<Pill />} 
                      color="emerald"
                      label={t('prescriptionsLabel')} 
                      value={prescriptions?.length?.toString() || "0"} 
                    />
                  </div>

                  {/* Upcoming Appointment Widget */}
                  <section className="space-y-6">
                    <h2 className="text-xl font-black flex items-center gap-3 text-[var(--foreground)]">
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                         <Clock size={16} />
                      </div>
                      {t('upcomingAppointment')}
                    </h2>
                    {activeAppointments && activeAppointments.length > 0 ? (
                      <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5 hover:border-[var(--primary)]/30 transition-all duration-500 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-colors duration-700" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 border border-[var(--primary)]/10 flex flex-col items-center justify-center text-[var(--primary)] shadow-inner">
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {activeAppointments[0]?.date ? new Date(activeAppointments[0].date).toLocaleString('en', { month: 'short' }) : '---'}
                              </span>
                              <span className="text-3xl font-black mt-1">
                                {activeAppointments[0]?.date ? new Date(activeAppointments[0].date).getDate() : '--'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-[var(--foreground)] mb-1">
                                {activeAppointments[0]?.service?.titleAr || activeAppointments[0]?.service?.titleEn || t('medicalConsultation')}
                              </h4>
                              <p className="text-sm font-bold text-[var(--muted)] flex items-center gap-2">
                                <Clock size={14} className="text-[var(--primary)]" /> 
                                {activeAppointments[0]?.timeSlot ? formatTime12Hour(activeAppointments[0].timeSlot, isRTL) : (activeAppointments[0]?.time ? formatTime12Hour(activeAppointments[0].time, isRTL) : '--:--')}
                                <span className="mx-2 opacity-30">•</span>
                                <span className={activeAppointments[0]?.type === 'ONLINE' ? 'text-blue-500' : 'text-emerald-500'}>
                                  {activeAppointments[0]?.type === 'ONLINE' ? 'Online Video' : 'Clinic Visit'}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {activeAppointments[0]?.type === 'ONLINE' && (
                              activeAppointments[0]?.status === 'approved' ? (
                                <Link href={`/dashboard/video/${activeAppointments[0]?.meetingId || 'room'}`}>
                                  <Button className="h-12 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white gap-2 font-bold shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-1">
                                    <Video size={18} />
                                    {t('joinMeeting')}
                                  </Button>
                                </Link>
                              ) : (
                                <div className="px-5 py-3 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-2xl text-sm font-black flex items-center gap-2">
                                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                                  {t('appointments.pending')}
                                </div>
                              )
                            )}
                            {activeAppointments[0]?.type === 'IN_CLINIC' && (
                              <div className="px-5 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-sm font-black">
                                {activeAppointments[0]?.status === 'approved' 
                                   ? t('appointments.approved', { fallback: 'Confirmed Clinic Visit' }) 
                                   : t('appointments.pending', { fallback: 'Clinic Visit - Pending Confirmation' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-12 text-center border-dashed border-white/20 bg-black/5 dark:bg-white/5 rounded-[2.5rem]">
                        <Calendar size={32} className="mx-auto mb-4 text-[var(--muted)] opacity-50" />
                        <p className="text-[var(--muted)] font-bold text-lg">{t('noAppointmentsFound')}</p>
                      </Card>
                    )}
                  </section>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Reports Grid */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-3 text-[var(--foreground)]">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                             <FileText size={16} />
                          </div>
                          {t('latestReports')}
                        </h2>
                        <Link href="/dashboard/reports" className="text-xs font-black text-[var(--primary)] uppercase tracking-widest hover:underline">
                          {t('viewAll')}
                        </Link>
                      </div>
                      {reports && reports.length > 0 ? (
                        <div className="space-y-4">
                          {reports.slice(0, 3).map((report, idx) => (
                            <motion.div key={report.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                              <Card className="p-5 bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/20 rounded-[2rem] hover:border-purple-500/30 transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Activity size={18} />
                                  </div>
                                  <div>
                                    <p className="font-black text-sm text-[var(--foreground)] group-hover:text-purple-500 transition-colors">{report.title}</p>
                                    <p className="text-[10px] font-bold text-[var(--muted)] mt-1 uppercase tracking-widest">
                                       {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-purple-500 hover:bg-purple-500/10 rounded-xl">
                                  <FileText size={18} />
                                </Button>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-10 text-center border-dashed border-white/20 bg-black/5 dark:bg-white/5 rounded-[2.5rem]">
                          <p className="text-[var(--muted)] font-bold">{t('reports.noReports')}</p>
                        </Card>
                      )}
                    </section>

                    {/* Prescriptions Grid */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-3 text-[var(--foreground)]">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                             <Pill size={16} />
                          </div>
                          {t('latestPrescriptions')}
                        </h2>
                      </div>
                      {prescriptions && prescriptions.length > 0 ? (
                        <div className="space-y-4">
                          {prescriptions.slice(0, 3).map((rx, idx) => (
                            <motion.div key={rx.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                              <Card className="p-5 bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/20 rounded-[2rem] hover:border-emerald-500/30 transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Pill size={18} />
                                  </div>
                                  <div>
                                    <p className="font-black text-sm text-[var(--foreground)] group-hover:text-emerald-500 transition-colors truncate max-w-[150px]">
                                      {rx.diagnosisAr || rx.diagnosisEn || 'Prescription'}
                                    </p>
                                    <p className="text-[10px] font-bold text-[var(--muted)] mt-1 uppercase tracking-widest">
                                       {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : ''}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-emerald-500 hover:bg-emerald-500/10 rounded-xl">
                                  <FileText size={18} />
                                </Button>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-10 text-center border-dashed border-white/20 bg-black/5 dark:bg-white/5 rounded-[2.5rem]">
                          <p className="text-[var(--muted)] font-bold">{t('noPrescriptions')}</p>
                        </Card>
                      )}
                    </section>
                  </div>
                </motion.div>
              ) : (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5">
                    <MedicalTimeline items={timelineItems} />
                  </Card>
                </motion.section>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Review & Rating Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] to-blue-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="fill-current animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">
                {t('review.title')}
              </h3>
              <p className="text-[var(--muted)] text-sm mb-6 leading-relaxed">
                {t('review.subtitle')}
              </p>
              
              {/* Stars Selection */}
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-amber-400 transition-transform active:scale-95 hover:scale-110"
                  >
                    <Star 
                      size={40} 
                      className={cn(
                        "transition-colors",
                        star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-700"
                      )} 
                    />
                  </button>
                ))}
              </div>
              
              {/* Feedback Input */}
              <div className="space-y-2 text-right mb-8">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--muted)] ml-1 block text-right">
                  {t('review.commentLabel')}
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t('review.commentPlaceholder')}
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all resize-none text-sm font-bold text-[var(--foreground)]"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={async () => {
                    setSubmittingReview(true);
                    try {
                      await api.post(`/appointments/${rateAppointmentId}/review`, {
                        rating: reviewRating,
                        comment: reviewComment || undefined
                      }, token);
                      toast.success(t('review.submitSuccess'));
                      setShowReviewModal(false);
                      // Clear search query param cleanly
                      const url = new URL(window.location.href);
                      url.searchParams.delete('rateAppointmentId');
                      window.history.replaceState({}, '', url.pathname + url.search);
                    } catch (e: any) {
                      toast.error(e.message || t('review.submitFailed'));
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                  disabled={submittingReview}
                  className="flex-1 py-6 text-sm font-black rounded-2xl bg-gradient-to-r from-[var(--primary)] to-blue-600 shadow-lg shadow-[var(--primary)]/25 text-white"
                >
                  {submittingReview ? t('review.submitting') : t('review.submit')}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowReviewModal(false);
                    const url = new URL(window.location.href);
                    url.searchParams.delete('rateAppointmentId');
                    window.history.replaceState({}, '', url.pathname + url.search);
                  }}
                  disabled={submittingReview}
                  className="py-6 text-sm font-black rounded-2xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[var(--foreground)] bg-transparent"
                >
                  {t('review.skip')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-[var(--primary)]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
  };

  return (
    <Card className="relative overflow-hidden p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5 group hover:-translate-y-1 transition-all duration-500">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity ${colors[color].split(' ')[1]}`} />
      <div className="relative z-10 flex items-center gap-6">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-[var(--foreground)]">{value}</p>
        </div>
      </div>
    </Card>
  );
}

