'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link } from '@/i18n/routing';
import {
  FileText, Download, Calendar, Search,
  LayoutDashboard, User as UserIcon, LogOut,
  Clock, Upload, X, FileUp, HeartPulse, Pill,
  ChevronRight, Activity, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ReportsPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { token, logout, user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token === null) return;
    if (!token) { router.push('/auth/login'); return; }
    fetchReports();
  }, [token]);

  const fetchReports = () => {
    setLoading(true);
    api.get<any[]>('/reports/my', token!)
      .then(setReports)
      .catch(err => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => logout();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selected.type)) {
        toast.error(isRTL ? 'نوع الملف غير مدعوم. يرجى اختيار PDF أو صورة.' : 'Invalid file type. Please select a PDF or an image.');
        e.target.value = '';
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast.error(isRTL ? 'حجم الملف يجب أن يكون أقل من 10 ميجابايت.' : 'File size must be less than 10MB.');
        e.target.value = '';
        return;
      }
      setFile(selected);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user || !file || !uploadData.title) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      if (uploadData.description) formData.append('description', uploadData.description);
      formData.append('file', file);
      await api.postFormData('/reports', formData, token);
      toast.success(isRTL ? 'تم رفع التقرير بنجاح! سيكون مرئياً للطبيب.' : 'Report uploaded successfully! It will be visible to your doctor.');
      setIsUploadModalOpen(false);
      setFile(null);
      setUploadData({ title: '', description: '' });
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'حدث خطأ أثناء الرفع' : 'An error occurred during upload'));
    } finally {
      setUploading(false);
    }
  };

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('menu.overview'), href: '/dashboard' },
    { id: 'appointments', icon: Calendar, label: t('menu.appointments'), href: '/dashboard/appointments' },
    { id: 'reports', icon: FileText, label: t('menu.reports'), href: '/dashboard/reports', active: true },
    { id: 'prescriptions', icon: Pill, label: t('menu.prescriptions'), href: '/dashboard/prescriptions' },
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
          <p className="text-sm font-bold text-slate-500 dark:text-white/40">{isRTL ? 'جاري تحميل التقارير...' : 'Loading reports...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative pt-28 pb-20 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-[#0b1120] dark:to-indigo-950/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-violet-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-5%] w-[35vw] h-[35vw] bg-purple-500/5 rounded-full blur-[100px]" />
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
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white/80">{reports.length} {isRTL ? 'تقرير' : 'reports'}</span>
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
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports.title')}</h1>
                    <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{isRTL ? 'رفع واستعراض تقاريرك الطبية' : 'Upload and view your medical reports'}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-56">
                    <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={16} />
                    <input
                      type="text"
                      placeholder={isRTL ? 'ابحث عن تقرير...' : 'Search reports...'}
                      className={cn("w-full py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-white/40 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-[13px] transition-all placeholder:text-slate-400", isRTL ? "pr-10 pl-4" : "pl-10 pr-4")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setIsUploadModalOpen(true)}
                    className="h-[42px] px-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all gap-2"
                  >
                    <Upload size={16} />
                    {isRTL ? 'رفع تقرير' : 'Upload'}
                  </Button>
                </div>
              </motion.div>

              {/* Reports List */}
              {filteredReports.length > 0 ? (
                <div className="grid gap-3">
                  {filteredReports.map((report, i) => (
                    <motion.div
                      key={report.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/10 flex items-center justify-center shrink-0">
                              <Activity size={22} className="text-violet-500" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-base font-black text-slate-900 dark:text-white truncate">{report.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 dark:text-white/35">
                                  <Clock size={13} />
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                                {report.description && (
                                  <span className="text-[12px] text-slate-400 dark:text-white/25 hidden sm:inline truncate max-w-xs">— {report.description}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <a
                            href={getMediaUrl(report.fileUrl)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50 hover:bg-violet-100 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all text-[12px] font-bold shrink-0"
                          >
                            <Download size={15} />
                            {t('reports.download')}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-white/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <FileText size={28} className="text-slate-300 dark:text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white/60 mb-1">{t('reports.noReports')}</h3>
                  <p className="text-[13px] text-slate-400 dark:text-white/30 mb-6 text-center max-w-sm">
                    {isRTL ? 'لم تقم برفع أي تقارير بعد.' : 'You haven\'t uploaded any reports yet.'}
                  </p>
                  <Button onClick={() => setIsUploadModalOpen(true)}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold shadow-lg shadow-violet-500/20 gap-2"
                  >
                    <Upload size={16} />
                    {isRTL ? 'رفع أول تقرير' : 'Upload First Report'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <FileUp size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{isRTL ? 'رفع تقرير طبي' : 'Upload Medical Report'}</h2>
                  <p className="text-[11px] text-slate-500 dark:text-white/40">{isRTL ? 'شارك نتائج الفحوصات مع طبيبك' : 'Share lab results securely with your doctor'}</p>
                </div>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{isRTL ? 'عنوان التقرير' : 'Report Title'}</label>
                <Input
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: تحليل دم' : 'e.g. Blood Test Results'}
                  className="py-3 rounded-xl text-[13px] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{isRTL ? 'وصف (اختياري)' : 'Description (Optional)'}</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder={isRTL ? 'أضف ملاحظات...' : 'Add any notes...'}
                  className={cn("w-full min-h-[90px] p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y text-[13px] font-medium outline-none", isRTL ? "text-right" : "text-left")}
                />
              </div>

              <div className="space-y-1.5">
                <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40", isRTL ? "block text-right" : "block")}>{isRTL ? 'اختر ملف' : 'Select File'}</label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-violet-500/50 rounded-2xl p-6 text-center transition-all bg-white/30 dark:bg-white/[0.01] group cursor-pointer">
                  <input type="file" onChange={handleFileChange} accept=".pdf,image/jpeg,image/png,image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                        <FileText size={20} />
                      </div>
                      <div className="font-bold text-[13px] text-slate-700 dark:text-white/70 truncate max-w-[220px]">{file.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-white/30">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="p-3 bg-violet-50 dark:bg-violet-500/10 text-violet-500 rounded-full group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <div className="font-bold text-[13px] text-slate-600 dark:text-white/60">{isRTL ? 'اضغط للرفع أو اسحب الملف' : 'Click to upload or drag & drop'}</div>
                      <div className="text-[11px] text-slate-400 dark:text-white/30">PDF, PNG, JPG — {isRTL ? 'حد أقصى 10 ميجابايت' : 'max 10MB'}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className={cn("flex gap-3 pt-5 border-t border-slate-100 dark:border-white/5", isRTL ? "flex-row-reverse" : "")}>
                <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-xl font-bold h-11 px-5 text-[12px]"
                >
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={uploading || !uploadData.title || !file}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold shadow-lg shadow-violet-500/20 text-[12px] gap-2"
                >
                  {uploading ? (
                    <>{tCommon('loading')}</>
                  ) : (
                    <><Upload size={15} /> {isRTL ? 'رفع التقرير' : 'Upload Report'}</>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  );
}
