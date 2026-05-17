'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { FileText, Upload, Search, User, FileUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function AdminReportsPage() {
  const t = useTranslations('admin.reports');
  const tCommon = useTranslations('common');
  const { token } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    // Fetch users with role 'patient'
    api.get<Patient[]>('/auth/users?role=patient', token)
      .then(res => setPatients(res))
      .catch(err => {
        toast.error('Failed to load patients');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const handleUploadClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsUploadModalOpen(true);
    setUploadData({ title: '', description: '' });
    setFile(null);
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
    if (!token || !selectedPatient || !file || !uploadData.title) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      if (uploadData.description) formData.append('description', uploadData.description);
      formData.append('patientId', selectedPatient.id);
      formData.append('file', file);

      await api.postFormData('/reports', formData, token);

      toast.success('Medical report uploaded successfully!');
      setIsUploadModalOpen(false);
      setFile(null);
      setUploadData({ title: '', description: '' });
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-black">{t('title', { fallback: 'Medical Reports Upload' })}</h1>
        <div className="h-96 animate-pulse bg-[var(--card)] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <FileText size={28} />
          </div>
          {t('title', { fallback: 'Medical Reports Upload' })}
        </h1>
        <p className="text-[var(--muted)]">{t('subtitle', { fallback: 'Upload lab results, prescriptions, or medical reports for your patients.' })}</p>
      </div>

      <Card className="border-[var(--border)] rounded-3xl shadow-sm overflow-hidden bg-[var(--card)]">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--background)]/50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User size={20} className="text-[var(--muted)]" />
            {t('patientsList', { fallback: 'Patients List' })} ({patients.length})
          </h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <Input 
              placeholder="Search by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-[var(--background)]"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] uppercase text-[10px] font-black tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold flex items-center justify-center">
                          {patient.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <span className="font-bold text-base">{patient.name || 'Unnamed Patient'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{patient.email}</span>
                        <span className="text-xs text-[var(--muted)]">{patient.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        onClick={() => handleUploadClick(patient)}
                        className="rounded-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-lg shadow-[var(--primary)]/20 px-6 py-5 text-xs h-auto"
                      >
                        <FileUp size={16} />
                        Upload Report
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-[var(--muted)] text-base font-medium">
                    No patients found matching &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Dialog */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full sm:max-w-[500px] bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <FileUp className="text-[var(--primary)]" />
                    Upload Medical Report
                  </h2>
                  <button onClick={() => setIsUploadModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-xl flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-bold flex items-center justify-center text-xs">
                    {selectedPatient?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">Patient</div>
                    <div className="font-bold text-sm leading-tight">{selectedPatient?.name}</div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Report Title</label>
                  <Input 
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g. Prostate Biopsy Results"
                    className="py-6 rounded-xl font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Description (Optional)</label>
                  <textarea 
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Additional notes about this report..."
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
                        <div className="font-bold text-sm">Click or drag file to upload</div>
                        <div className="text-xs text-[var(--muted)]">PDF, JPG, PNG up to 10MB</div>
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
    </div>
  );
}
