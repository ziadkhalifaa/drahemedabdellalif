'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Skeleton } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import { 
  FileText, 
  Printer,
  Calendar,
  Search,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Clock,
  Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

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

    if (!token) {
      router.push('/auth/login');
      return;
    }

    api.get<any[]>('/prescriptions/my', token)
      .then(setPrescriptions)
      .catch(err => console.error("Failed to fetch prescriptions:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  const filteredPrescriptions = prescriptions.filter(r => 
    (r.diagnosisAr && r.diagnosisAr.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.diagnosisEn && r.diagnosisEn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: t('menu.overview'), href: '/dashboard' },
    { icon: <Calendar size={20} />, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { icon: <FileText size={20} />, label: t('menu.reports'), href: '/dashboard/reports' },
    { icon: <Pill size={20} />, label: isRTL ? 'الروشتات' : 'Prescriptions', href: '/dashboard/prescriptions', active: true },
    { icon: <UserIcon size={20} />, label: t('menu.profile'), href: '/dashboard/profile' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pt-28 pb-20 print:bg-white print:pt-0 print:pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8 print:block">
            
            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6 print:hidden">
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
            <div className="space-y-8 print:space-y-4">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">{isRTL ? 'الروشتات الطبية' : 'Medical Prescriptions'}</h1>
                  <p className="text-[var(--muted)]">{isRTL ? 'يمكنك استعراض وطباعة جميع روشتاتك السابقة' : 'View and print all your past prescriptions'}</p>
                </div>
                
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                  <input 
                    type="text" 
                    placeholder={isRTL ? 'ابحث عن روشتة...' : 'Search prescriptions...'}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </header>

              {loading ? (
                <div className="space-y-4 print:hidden">
                  {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
                </div>
              ) : filteredPrescriptions.length > 0 ? (
                <div className="grid gap-8 print:gap-12">
                  {filteredPrescriptions.map((rx, i) => (
                    <motion.div
                      key={rx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="print:break-inside-avoid"
                    >
                      <Card className="p-8 border-[var(--border)] rounded-3xl shadow-sm bg-white dark:bg-white/5 print:border-gray-200 print:shadow-none print:bg-white print:text-black">
                        
                        {/* Prescription Header */}
                        <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/10 pb-6 mb-6">
                           <div>
                              <h2 className="text-2xl font-black text-primary print:text-black">Dr. Ahmed Abdellatif</h2>
                              <p className="text-sm text-gray-500 font-medium mt-1">Urology & Andrology Consultant</p>
                              
                              <div className="mt-4 space-y-1">
                                <p className="text-sm"><strong className="text-gray-400">Patient:</strong> {user?.name}</p>
                                <p className="text-sm"><strong className="text-gray-400">Date:</strong> {new Date(rx.createdAt).toLocaleDateString()}</p>
                                <p className="text-sm"><strong className="text-gray-400">Diagnosis:</strong> {rx.diagnosisAr || rx.diagnosisEn || '---'}</p>
                              </div>
                           </div>

                           <div className="flex flex-col items-end gap-4">
                             <Button 
                               onClick={() => window.print()} 
                               className="print:hidden rounded-xl font-bold gap-2"
                               variant="outline"
                             >
                               <Printer size={18} />
                               {isRTL ? 'طباعة الروشتة' : 'Print'}
                             </Button>
                             <div className="text-right mt-auto opacity-20">
                                <FileText size={64} />
                             </div>
                           </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-4 min-h-[200px]">
                          <div className="flex items-center gap-2 text-primary font-black text-xl mb-6">
                             <Pill size={24} />
                             Rx
                          </div>
                          
                          {Array.isArray(rx.medications) && rx.medications.map((med: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-50 dark:border-white/5 last:border-0">
                               <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                                 {idx + 1}
                               </div>
                               <div>
                                 <h4 className="font-bold text-lg leading-none print:text-black">{med.name}</h4>
                                 <p className="text-sm font-medium text-gray-500 mt-2">
                                   {med.dosage} — {med.frequency}
                                 </p>
                                 <p className="text-xs text-gray-400 mt-1">{med.duration}</p>
                               </div>
                            </div>
                          ))}
                        </div>

                        {/* Instructions */}
                        {(rx.instructionsAr || rx.instructionsEn) && (
                          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                            <h5 className="font-bold text-sm text-gray-400 mb-2 uppercase tracking-wider">{isRTL ? 'تعليمات إضافية' : 'Additional Instructions'}</h5>
                            <p className="text-sm font-medium leading-relaxed print:text-black">
                              {isRTL ? (rx.instructionsAr || rx.instructionsEn) : (rx.instructionsEn || rx.instructionsAr)}
                            </p>
                          </div>
                        )}

                        {/* Footer Sign */}
                        <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-100 dark:border-white/10 pt-6">
                           Signature: .......................................
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-20 text-center border-[var(--border)] border-dashed rounded-[40px] bg-[var(--primary)]/5 print:hidden">
                  <div className="h-20 w-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--primary)]">
                    <Pill size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isRTL ? 'لا توجد روشتات' : 'No Prescriptions'}</h3>
                  <p className="text-[var(--muted)] max-w-sm mx-auto">
                    {isRTL ? 'لم يتم العثور على أي روشتات مسجلة في ملفك الطبي حتى الآن.' : 'You haven\'t received any prescriptions yet.'}
                  </p>
                </Card>
              )}
            </div>

          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
