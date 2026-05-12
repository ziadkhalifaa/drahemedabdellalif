'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import { 
  Calendar, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Video,
  Clock,
  ChevronRight,
  Pill,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';
import { MedicalTimeline } from '@/components/dashboard/medical-timeline';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(storedUser));

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
  }, []);

  const timelineItems = [
    ...appointments.map(a => ({ id: a.id, type: 'appointment' as const, title: a.service?.titleAr || 'Consultation', date: new Date(a.date), status: a.status })),
    ...reports.map(r => ({ id: r.id, type: 'report' as const, title: r.title, date: new Date(r.createdAt) })),
    ...prescriptions.map(p => ({ id: p.id, type: 'prescription' as const, title: p.diagnosisAr || 'Prescription', date: new Date(p.createdAt) }))
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };
  
  const sidebarItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: t('menu.overview'), onClick: () => setActiveTab('overview'), active: activeTab === 'overview' },
    { id: 'timeline', icon: <History size={20} />, label: 'Medical Journey', onClick: () => setActiveTab('timeline'), active: activeTab === 'timeline' },
    { id: 'appointments', icon: <Calendar size={20} />, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { id: 'reports', icon: <FileText size={20} />, label: t('menu.reports'), href: '/dashboard/reports' },
    { id: 'profile', icon: <UserIcon size={20} />, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            
            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <Card className="p-4 border-[var(--border)] rounded-3xl shadow-sm">
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    item.href ? (
                      <Link 
                        key={item.id} 
                        href={item.href as any}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ) : (
                      <button 
                        key={item.id} 
                        onClick={item.onClick}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                          item.active 
                            ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" 
                            : "text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all mt-4"
                  >
                    <LogOut size={20} />
                    {t('menu.logout')}
                  </button>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white border-none rounded-3xl shadow-xl">
                 <h4 className="font-bold mb-2">{t('needHelp')}</h4>
                 <p className="text-xs text-white/80 mb-4">{t('helpDesc')}</p>
                 <Link href="/contact" className="block w-full">
                   <Button variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 rounded-xl border-none">
                      {t('contactSupport')}
                   </Button>
                 </Link>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="space-y-8">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">
                    {activeTab === 'overview' 
                      ? t('welcome', { name: user?.name?.split(' ')[0] || 'Patient' })
                      : 'Medical Journey'}
                  </h1>
                  <p className="text-[var(--muted)]">
                    {activeTab === 'overview' 
                      ? 'Manage your medical journey with Dr. Ahmed Abdellatif.'
                      : 'Track your history, appointments, and results.'}
                  </p>
                </div>
                <Link href="/booking">
                  <Button className="rounded-2xl px-8 py-6 font-bold shadow-xl shadow-[var(--primary)]/20 gap-2">
                    <Calendar size={18} />
                    {t('appointments.bookNow')}
                  </Button>
                </Link>
              </header>

              {activeTab === 'overview' ? (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    <StatCard 
                      icon={<Calendar className="text-blue-500" />} 
                      label={t('upcoming')} 
                      value={appointments.filter((a: any) => a?.date && new Date(a.date) >= new Date()).length.toString()} 
                    />
                    <StatCard 
                      icon={<FileText className="text-purple-500" />} 
                      label={t('reportsLabel')} 
                      value={reports?.length?.toString() || "0"} 
                    />
                    <StatCard 
                      icon={<Clock className="text-orange-500" />} 
                      label={t('totalVisits')} 
                      value={appointments?.length?.toString() || "0"} 
                    />
                  </div>

                  {/* Recent Appointment */}
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calendar size={20} className="text-[var(--primary)]" />
                      {t('upcomingAppointment')}
                    </h2>
                    {appointments && appointments.length > 0 ? (
                      <Card className="p-6 border-[var(--border)] rounded-3xl hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 h-full w-2 bg-[var(--primary)]" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-[var(--primary)]/10 flex flex-col items-center justify-center text-[var(--primary)]">
                              <span className="text-xs font-bold uppercase">
                                {appointments[0]?.date ? new Date(appointments[0].date).toLocaleString('default', { month: 'short' }) : '---'}
                              </span>
                              <span className="text-2xl font-black">
                                {appointments[0]?.date ? new Date(appointments[0].date).getDate() : '--'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-lg font-black">{appointments[0]?.service?.titleAr || appointments[0]?.service?.titleEn || t('medicalConsultation')}</h4>
                              <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                                <Clock size={14} /> {appointments[0]?.time || '--:--'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Link href={`/dashboard/video/${appointments[0]?.meetingId || 'room'}`}>
                              <Button variant="outline" className="rounded-xl border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white gap-2 font-bold px-6">
                                <Video size={18} />
                                {t('joinMeeting')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-12 text-center border-[var(--border)] border-dashed rounded-3xl bg-[var(--primary)]/5">
                        <p className="text-[var(--muted)] font-medium">{t('noAppointmentsFound')}</p>
                      </Card>
                    )}
                  </section>

                  {/* Reports Preview */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText size={20} className="text-[var(--primary)]" />
                        {t('latestReports')}
                      </h2>
                      <Link href="/dashboard/reports" className="text-sm font-bold text-[var(--primary)] hover:underline">
                        {t('viewAll')}
                      </Link>
                    </div>
                    {reports && reports.length > 0 ? (
                      <div className="space-y-3">
                        {reports.slice(0, 2).map((report) => (
                          <Card key={report.id} className="p-4 border-[var(--border)] rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="text-[var(--primary)]" />
                              <div>
                                <p className="font-bold text-sm">{report.title}</p>
                                <p className="text-[10px] text-[var(--muted)]">
                                   {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[var(--primary)] font-bold">{t('downloadReport')}</Button>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-12 text-center border-[var(--border)] border-dashed rounded-3xl bg-[var(--primary)]/5">
                        <p className="text-[var(--muted)] font-medium">{t('reports.noReports')}</p>
                      </Card>
                    )}
                  </section>
                </>
              ) : (
                <section className="space-y-6">
                  <MedicalTimeline items={timelineItems} />
                </section>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <Card className="p-6 border-[var(--border)] rounded-3xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </Card>
  );
}
