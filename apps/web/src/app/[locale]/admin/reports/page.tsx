'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { FileText, Upload, Search, User, FileUp, X, Stethoscope, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');
  const openUploadParam = searchParams.get('openUpload');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Upload Report State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Prescription State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [submittingPrescription, setSubmittingPrescription] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosisAr: '',
    diagnosisEn: '',
    instructionsAr: '',
    instructionsEn: '',
    medications: [{ name: '', dosage: '', duration: '', notes: '' }]
  });

  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    if (openUploadParam === 'true' && patients.length > 0 && searchParam) {
      const match = patients.find(p => p.name?.toLowerCase().includes(searchParam.toLowerCase()));
      if (match) {
        setSelectedPatient(match);
        setIsUploadModalOpen(true);
        setUploadData({ title: '', description: '' });
        setFile(null);
      }
    }
  }, [patients, searchParam, openUploadParam]);

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

  const handlePrescriptionClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPrescriptionModalOpen(true);
    setPrescriptionData({
      diagnosisAr: '',
      diagnosisEn: '',
      instructionsAr: '',
      instructionsEn: '',
      medications: [{ name: '', dosage: '', duration: '', notes: '' }]
    });
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

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPatient) return;
    
    // Validate medications
    const validMedications = prescriptionData.medications.filter(m => m.name && m.dosage);
    if (validMedications.length === 0) {
      toast.error('Please add at least one medication with name and dosage.');
      return;
    }

    setSubmittingPrescription(true);
    try {
      await api.post('/prescriptions', {
        patientId: selectedPatient.id,
        diagnosisAr: prescriptionData.diagnosisAr || undefined,
        diagnosisEn: prescriptionData.diagnosisEn || undefined,
        instructionsAr: prescriptionData.instructionsAr || undefined,
        instructionsEn: prescriptionData.instructionsEn || undefined,
        medications: validMedications
      }, token);

      toast.success('Prescription created successfully!');
      setIsPrescriptionModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while creating the prescription');
    } finally {
      setSubmittingPrescription(false);
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
            {t('patientsList')} ({patients.length})
          </h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <Input 
              placeholder={t('searchPlaceholder')} 
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
                <th className="px-6 py-4">{t('patientName')}</th>
                <th className="px-6 py-4">{t('contactInfo')}</th>
                <th className="px-6 py-4 text-center">{t('actions')}</th>
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
                        <span className="font-bold text-base">{patient.name || t('unnamedPatient')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{patient.email}</span>
                        <span className="text-xs text-[var(--muted)]">{patient.phone || t('noPhone')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Button 
                          onClick={() => handlePrescriptionClick(patient)}
                          variant="outline"
                          className="rounded-xl font-bold gap-2 px-4 py-2 text-xs border-blue-500/30 hover:bg-blue-500 hover:text-white text-blue-500 transition-colors"
                        >
                          <Stethoscope size={16} />
                          عمل روشتة
                        </Button>
                        <Button 
                          onClick={() => handleUploadClick(patient)}
                          className="rounded-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-lg shadow-[var(--primary)]/20 px-4 py-2 text-xs h-auto"
                        >
                          <FileUp size={16} />
                          {t('uploadReport')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-[var(--muted)] text-base font-medium">
                    {t('noPatientsFound')} &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Dialog */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full sm:max-w-[500px] bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <FileUp className="text-[var(--primary)]" />
                    {t('uploadMedicalReport')}
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
                    <div className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">{t('patient')}</div>
                    <div className="font-bold text-sm leading-tight">{selectedPatient?.name}</div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">{t('reportTitle')}</label>
                  <Input 
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder={t('reportTitlePlaceholder')}
                    className="py-6 rounded-xl font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">{t('descriptionOptional')}</label>
                  <textarea 
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full min-h-[100px] p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y text-sm font-medium outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">{t('selectFile')}</label>
                  
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
                        <div className="font-bold text-sm">{t('clickOrDrag')}</div>
                        <div className="text-xs text-[var(--muted)]">{t('fileTypesLimit')}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
                  <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl font-bold h-12 px-6">
                    {tCommon('cancel', { fallback: 'Cancel' })}
                  </Button>
                  <Button type="submit" disabled={uploading || !uploadData.title || !file} className="rounded-xl font-bold px-8 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-lg shadow-[var(--primary)]/20">
                    {uploading ? tCommon('loading', { fallback: 'Uploading...' }) : t('uploadReport')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Prescription Dialog */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full sm:max-w-3xl bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden relative shadow-2xl my-8">
            <div className="p-8">
              <div className="mb-8 border-b border-[var(--border)] pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                      <Stethoscope size={24} />
                    </div>
                    عمل روشتة طبية (Prescription)
                  </h2>
                  <button onClick={() => setIsPrescriptionModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-black flex items-center justify-center text-sm">
                    {selectedPatient?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-black">{t('patient')}</div>
                    <div className="font-black text-lg leading-tight">{selectedPatient?.name}</div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handlePrescriptionSubmit} className="space-y-8">
                {/* Diagnosis Section */}
                <div className="space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    التشخيص (Diagnosis)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--muted)]">التشخيص (عربي)</label>
                      <Input 
                        value={prescriptionData.diagnosisAr}
                        onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosisAr: e.target.value })}
                        placeholder="أدخل التشخيص..."
                        className="py-5 rounded-xl font-medium text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--muted)]">Diagnosis (English)</label>
                      <Input 
                        value={prescriptionData.diagnosisEn}
                        onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosisEn: e.target.value })}
                        placeholder="Enter diagnosis..."
                        className="py-5 rounded-xl font-medium"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      الأدوية (Medications)
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPrescriptionData({
                        ...prescriptionData, 
                        medications: [...prescriptionData.medications, { name: '', dosage: '', duration: '', notes: '' }]
                      })}
                      className="gap-2 rounded-xl text-xs font-bold"
                    >
                      <Plus size={14} /> إضافة دواء
                    </Button>
                  </div>
                  
                  <div className="space-y-3 bg-[var(--background)]/50 p-4 rounded-2xl border border-[var(--border)] max-h-[300px] overflow-y-auto">
                    {prescriptionData.medications.map((med, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl relative group">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold text-[var(--muted)] uppercase">اسم الدواء (Medication Name)</label>
                          <Input 
                            required
                            value={med.name}
                            onChange={(e) => {
                              const newMeds = [...prescriptionData.medications];
                              newMeds[index].name = e.target.value;
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            placeholder="e.g. Panadol 500mg"
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="w-full md:w-1/4 space-y-2">
                          <label className="text-[10px] font-bold text-[var(--muted)] uppercase">الجرعة (Dosage)</label>
                          <Input 
                            required
                            value={med.dosage}
                            onChange={(e) => {
                              const newMeds = [...prescriptionData.medications];
                              newMeds[index].dosage = e.target.value;
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            placeholder="e.g. 1 pill every 8 hours"
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="w-full md:w-1/5 space-y-2">
                          <label className="text-[10px] font-bold text-[var(--muted)] uppercase">المدة (Duration)</label>
                          <Input 
                            value={med.duration}
                            onChange={(e) => {
                              const newMeds = [...prescriptionData.medications];
                              newMeds[index].duration = e.target.value;
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            placeholder="e.g. 5 days"
                            className="h-10 text-sm"
                          />
                        </div>
                        
                        {prescriptionData.medications.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newMeds = prescriptionData.medications.filter((_, i) => i !== index);
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            className="absolute -top-2 -right-2 md:top-auto md:bottom-2 md:right-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instructions Section */}
                <div className="space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    تعليمات إضافية (Instructions)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea 
                      value={prescriptionData.instructionsAr}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, instructionsAr: e.target.value })}
                      placeholder="تعليمات إضافية للمريض..."
                      className="w-full min-h-[100px] p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y text-sm font-medium outline-none text-right"
                      dir="rtl"
                    />
                    <textarea 
                      value={prescriptionData.instructionsEn}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, instructionsEn: e.target.value })}
                      placeholder="Additional instructions..."
                      className="w-full min-h-[100px] p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y text-sm font-medium outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-8 border-t border-[var(--border)]">
                  <Button type="button" variant="ghost" onClick={() => setIsPrescriptionModalOpen(false)} className="rounded-xl font-bold h-12 px-8 bg-[var(--background)] border border-[var(--border)]">
                    إلغاء (Cancel)
                  </Button>
                  <Button type="submit" disabled={submittingPrescription} className="rounded-xl font-bold px-10 h-12 bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30">
                    {submittingPrescription ? 'جاري الحفظ...' : 'حفظ الروشتة (Save)'}
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
