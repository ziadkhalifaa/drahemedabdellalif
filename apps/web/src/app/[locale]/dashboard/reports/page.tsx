'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Skeleton } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import { 
  FileText, 
  Download,
  Calendar,
  Search,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

import { useState, useEffect } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

export default function ReportsPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const { token, logout } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.push('/auth/login');
      return;
    }

    api.get<any[]>('/reports/my', token)
      .then(setReports)
      .catch(err => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: t('menu.overview'), href: '/dashboard' },
    { icon: <Calendar size={20} />, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { icon: <FileText size={20} />, label: t('menu.reports'), href: '/dashboard/reports', active: true },
    { icon: <FileText size={20} />, label: 'Prescriptions', href: '/dashboard/prescriptions' },
    { icon: <UserIcon size={20} />, label: t('menu.profile'), href: '/dashboard/profile' },
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
                  <h1 className="text-3xl font-black tracking-tight">{t('reports.title')}</h1>
                  <p className="text-[var(--muted)]">Access all your medical reports and test results.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search reports..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </header>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)}
                </div>
              ) : filteredReports.length > 0 ? (
                <div className="grid gap-4">
                  {filteredReports.map((report, i) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="p-6 border-[var(--border)] rounded-3xl hover:shadow-lg transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                              <FileText size={28} />
                            </div>
                            <div>
                              <h4 className="text-lg font-black">{report.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-[var(--muted)] mt-1 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Clock size={14} /> 
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                                {report.description && (
                                  <span className="hidden md:inline text-[var(--border)]">|</span>
                                )}
                                <span className="hidden md:inline truncate max-w-md">{report.description}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <a 
                               href={getMediaUrl(report.fileUrl)} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="block"
                             >
                              <Button className="rounded-xl font-bold gap-2 px-6">
                                <Download size={18} />
                                {t('reports.download')}
                              </Button>
                             </a>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-20 text-center border-[var(--border)] border-dashed rounded-[40px] bg-[var(--primary)]/5">
                  <div className="h-20 w-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--primary)]">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('reports.noReports')}</h3>
                  <p className="text-[var(--muted)] max-w-sm mx-auto">
                    You haven&apos;t uploaded any reports yet, or no reports have been assigned to you.
                  </p>
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
