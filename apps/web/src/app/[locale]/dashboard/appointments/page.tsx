'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Skeleton } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import { 
  Calendar, 
  FileText,
  User as UserIcon,
  LogOut,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  Clock3,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

export default function PatientAppointmentsPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const { token, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    if (token === null) {
      // Waiting for auth to load or no token
      return;
    }

    if (!token) {
      router.push('/auth/login');
      return;
    }

    api.get<any[]>('/appointments/my', token)
      .then(setAppointments)
      .catch(err => console.error("Failed to fetch appointments:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  const filteredAppointments = appointments.filter(a => 
    statusFilter === 'ALL' ? true : a.status === statusFilter
  );

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: t('menu.overview'), href: '/dashboard' },
    { icon: <Calendar size={20} />, label: t('menu.appointments'), href: '/dashboard/appointments', active: true },
    { icon: <FileText size={20} />, label: t('menu.reports'), href: '/dashboard/reports' },
    { icon: <FileText size={20} />, label: 'Prescriptions', href: '/dashboard/prescriptions' },
    { icon: <UserIcon size={20} />, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { icon: <Clock3 size={14} />, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', label: t('appointments.pending', { fallback: 'Pending' }) };
      case 'APPROVED': return { icon: <CheckCircle size={14} />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: t('appointments.approved', { fallback: 'Approved' }) };
      case 'COMPLETED': return { icon: <CheckCircle size={14} />, color: 'text-green-500 bg-green-500/10 border-green-500/20', label: t('appointments.completed', { fallback: 'Completed' }) };
      case 'CANCELLED': 
      case 'REJECTED': return { icon: <XCircle size={14} />, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: t('appointments.cancelled', { fallback: 'Cancelled' }) };
      default: return { icon: <Clock size={14} />, color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20', label: status };
    }
  };

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
                    <Link 
                      key={item.href} 
                      href={item.href as any}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                        item.active 
                          ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" 
                          : "text-[var(--muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
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
            </aside>

            {/* Main Content */}
            <div className="space-y-8">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">{t('menu.appointments')}</h1>
                  <p className="text-[var(--muted)]">{t('appointments.manage', { fallback: 'Manage your appointments and consultations.' })}</p>
                </div>
                
                <Link href="/booking">
                  <Button className="rounded-2xl px-8 py-6 font-bold shadow-xl shadow-[var(--primary)]/20 gap-2">
                    <Calendar size={18} />
                    {t('appointments.bookNow')}
                  </Button>
                </Link>
              </header>

              {/* Filters */}
              <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s as any)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                      statusFilter === s 
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/20" 
                        : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5"
                    )}
                  >
                    {t(`appointments.filters.${s.toLowerCase()}`, { fallback: s })}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredAppointments.map((appt, i) => {
                      const status = getStatusConfig(appt.status);
                      const isOnline = appt.type === 'ONLINE';

                      return (
                        <motion.div
                          key={appt.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="p-6 border-[var(--border)] rounded-3xl hover:shadow-lg transition-all group overflow-hidden relative">
                            {appt.status === 'APPROVED' && (
                              <div className="absolute top-0 right-0 h-full w-1.5 bg-blue-500" />
                            )}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-5">
                                <div className={cn(
                                  "h-16 w-16 rounded-2xl flex flex-col items-center justify-center shrink-0",
                                  isOnline ? "bg-blue-500/10 text-blue-500" : "bg-[var(--primary)]/10 text-[var(--primary)]"
                                )}>
                                  <span className="text-xs font-bold uppercase">
                                    {new Date(appt.date).toLocaleString('default', { month: 'short' })}
                                  </span>
                                  <span className="text-2xl font-black leading-none mt-1">
                                    {new Date(appt.date).getDate()}
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-black">
                                      {isOnline ? t('wizard.onlineConsultation', { fallback: 'Online Consultation' }) : t('wizard.clinicVisit', { fallback: 'Clinic Visit' })}
                                    </h4>
                                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border", status.color)}>
                                      {status.icon}
                                      {status.label}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted)] font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <Clock size={16} /> 
                                      {appt.timeSlot}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      {isOnline ? <Video size={16} /> : <MapPin size={16} />}
                                      {isOnline ? 'Google Meet / Jitsi' : t('clinicAddress', { fallback: 'Clinic Address' })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {isOnline && appt.status === 'APPROVED' && (
                                  <Link href={`/dashboard/video/${appt.meetingId || appt.id}`}>
                                    <Button className="rounded-xl px-6 py-5 font-bold gap-2 shadow-lg shadow-[var(--primary)]/20 w-full md:w-auto">
                                      <Video size={18} />
                                      {t('joinMeeting')}
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <Card className="p-20 text-center border-[var(--border)] border-dashed rounded-[40px] bg-[var(--primary)]/5">
                  <div className="h-20 w-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--primary)]">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('noAppointmentsFound')}</h3>
                  <p className="text-[var(--muted)] max-w-sm mx-auto mb-8">
                    {t('appointments.noAppointmentsDesc', { fallback: 'You do not have any appointments matching this status.' })}
                  </p>
                  <Link href="/booking">
                    <Button className="rounded-2xl px-8 py-6 font-bold shadow-xl shadow-[var(--primary)]/20 gap-2">
                      <Calendar size={18} />
                      {t('appointments.bookNow')}
                    </Button>
                  </Link>
                </Card>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
