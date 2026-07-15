'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Skeleton, Input } from '@/components/ui';
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
  Clock,
  Upload,
  X,
  FileUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { useRouter } from '@/i18n/routing';

export default function ReportsPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { token, logout, user } = useAuth();
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    fetchReports();
  }, [token]);

  const fetchReports = () => {
    setLoading(true);
    api.get<any[]>('/reports/my', token!)
      .then(setReports)
      .catch(err => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    logout();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selected.type)) {
        toast.error('Invalid file type. Please select a PDF or an image.');
        e.target.value = '';
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB.');
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

      toast.success('Report uploaded successfully! It will now be visible to your doctor.');
      setIsUploadModalOpen(false);
      setFile(null);
      setUploadData({ title: '', description: '' });
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
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
                  <h1 className="text-3xl font-black tracking-tight">{t('reports.title', { fallback: 'My Reports & Scans' })}</h1>
                  <p className="text-[var(--muted)]">Access your medical reports, or upload new lab results and scans for the doctor.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search reports..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-sm transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="rounded-2xl h-[46px] px-6 font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-lg shadow-[var(--primary)]/20 whitespace-nowrap"
                  >
                    <Upload size={18} /> Upload Result
                  </Button>
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
                  <h3 className="text-xl font-bold mb-2">{t('reports.noReports', { fallback: 'No Reports Found' })}</h3>
                  <p className="text-[var(--muted)] max-w-sm mx-auto">
                    You haven&apos;t uploaded any reports yet, or no reports have been added by the doctor.
                  </p>
                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-6 rounded-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-lg shadow-[var(--primary)]/20 px-8"
                  >
                    <Upload size={18} /> Upload Your First Report
                  </Button>
                </Card>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Upload Dialog */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full sm:max-w-[500px] bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <FileUp className="text-[var(--primary)]" />
                    Upload Result / Scan
                  </h2>
                  <button onClick={() => setIsUploadModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-[var(--muted)] font-medium">Upload your lab results or medical scans here to share them securely with your doctor.</p>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Report Title</label>
                  <Input 
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g. Blood Test Results"
                    className="py-6 rounded-xl font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Description (Optional)</label>
                  <textarea 
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Add any notes..."
                    className="w-full min-h-[100px] p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y text-sm font-medium outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Select File</label>
                  
                  <div className="relative border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)]/50 rounded-2xl p-8 text-center transition-all bg-[var(--background)]/30 group">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                          <FileText size={24} />
                        </div>
                        <div className="font-bold text-sm truncate max-w-[200px]">{file.name}</div>
                        <div className="text-xs text-[var(--muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:scale-110 transition-transform">
                          <Upload size={24} />
                        </div>
                        <div className="font-bold text-sm">Click to upload or drag and drop</div>
                        <div className="text-xs text-[var(--muted)]">PDF, PNG, JPG (max. 10MB)</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
                  <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl font-bold h-12 px-6">
                    {tCommon('cancel', { fallback: 'Cancel' })}
                  </Button>
                  <Button type="submit" disabled={uploading || !uploadData.title || !file} className="rounded-xl font-bold px-8 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-lg shadow-[var(--primary)]/20">
                    {uploading ? tCommon('loading', { fallback: 'Uploading...' }) : 'Upload Report'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
