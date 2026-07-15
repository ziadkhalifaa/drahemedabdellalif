'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Button, Input } from '@/components/ui';
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
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');
  const openUploadParam = searchParams.get('openUpload');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-96 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10">
              <FileText size={22} className="text-indigo-500" />
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">
              {t('title', { fallback: 'Medical Reports Upload' })}
            </h1>
          </div>
          <p className={cn("text-[13px] text-slate-500 dark:text-white/35", isRTL ? "mr-[46px]" : "ml-[46px]")}>
            {t('subtitle', { fallback: 'Upload lab results, prescriptions, or medical reports for your patients.' })}
          </p>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <User size={16} className="text-slate-400 dark:text-white/25" />
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">
              {t('patientsList')}
            </h2>
            <span className="text-[11px] font-bold text-slate-400 dark:text-white/25 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
              {patients.length}
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25", isRTL ? "right-3" : "left-3")} size={15} />
            <Input 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn("h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-[13px] placeholder:text-slate-400 dark:placeholder:text-white/25 focus:border-indigo-500/50 focus:ring-indigo-500/20", isRTL ? "pr-9" : "pl-9")}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className={cn("w-full whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/5">
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
                  {t('patientName')}
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
                  {t('contactInfo')}
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 text-center">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-[13px]">
                          {patient.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                          {patient.name || t('unnamedPatient')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] text-slate-700 dark:text-white/70">{patient.email}</span>
                        <span className="text-[12px] text-slate-400 dark:text-white/25">{patient.phone || t('noPhone')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          onClick={() => handlePrescriptionClick(patient)}
                          variant="outline"
                          className={cn(
                            "rounded-xl h-9 px-3.5 text-[12px] font-bold gap-1.5",
                            "border-indigo-500/20 text-indigo-500 hover:bg-indigo-500 hover:text-white",
                            "dark:border-indigo-400/20 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white",
                            "transition-all duration-200"
                          )}
                        >
                          <Stethoscope size={14} />
                          عمل روشتة
                        </Button>
                        <Button 
                          onClick={() => handleUploadClick(patient)}
                          className={cn(
                            "rounded-xl h-9 px-3.5 text-[12px] font-bold gap-1.5",
                            "bg-indigo-500 hover:bg-indigo-600 text-white",
                            "shadow-sm shadow-indigo-500/20",
                            "transition-all duration-200"
                          )}
                        >
                          <FileUp size={14} />
                          {t('uploadReport')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                        <User size={20} className="text-slate-300 dark:text-white/15" />
                      </div>
                      <p className="text-[13px] text-slate-400 dark:text-white/25">
                        {t('noPatientsFound')} &quot;{searchTerm}&quot;
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full sm:max-w-[480px] bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <FileUp size={18} className="text-indigo-500" />
                  </div>
                  <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">
                    {t('uploadMedicalReport')}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(false)} 
                  className="p-1.5 rounded-lg text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 mb-6">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-[12px]">
                  {selectedPatient?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">{t('patient')}</div>
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{selectedPatient?.name}</div>
                </div>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">{t('reportTitle')}</label>
                  <Input 
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder={t('reportTitlePlaceholder')}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-[13px] focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">{t('descriptionOptional')}</label>
                  <textarea 
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder={t('descriptionPlaceholder')}
                    className={cn(
                      "w-full min-h-[90px] p-3 rounded-xl border text-[13px]",
                      "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5",
                      "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25",
                      "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50",
                      "transition-all resize-y outline-none"
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">{t('selectFile')}</label>
                  <div className="relative border-2 border-dashed border-slate-200/60 dark:border-white/10 hover:border-indigo-500/40 rounded-2xl p-8 text-center transition-all cursor-pointer group">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10">
                          <FileText size={20} className="text-emerald-500" />
                        </div>
                        <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</div>
                        <div className="text-[12px] text-slate-400 dark:text-white/25">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-200">
                          <Upload size={20} className="text-indigo-500" />
                        </div>
                        <div className="text-[13px] font-bold text-slate-700 dark:text-white/60">{t('clickOrDrag')}</div>
                        <div className="text-[12px] text-slate-400 dark:text-white/25">{t('fileTypesLimit')}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-slate-200/60 dark:border-white/5">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsUploadModalOpen(false)} 
                    className="rounded-xl h-10 px-5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    {tCommon('cancel', { fallback: 'Cancel' })}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploading || !uploadData.title || !file} 
                    className="rounded-xl h-10 px-6 text-[13px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {uploading ? tCommon('loading', { fallback: 'Uploading...' }) : t('uploadReport')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full sm:max-w-3xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Stethoscope size={18} className="text-indigo-500" />
                  </div>
                  <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">
                    عمل روشتة طبية (Prescription)
                  </h2>
                </div>
                <button 
                  onClick={() => setIsPrescriptionModalOpen(false)} 
                  className="p-1.5 rounded-lg text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 mb-7">
                <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-[13px]">
                  {selectedPatient?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">{t('patient')}</div>
                  <div className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{selectedPatient?.name}</div>
                </div>
              </div>
              
              <form onSubmit={handlePrescriptionSubmit} className="space-y-7">
                {/* Diagnosis Section */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-bold text-slate-500 dark:text-white/35 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    التشخيص (Diagnosis)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">التشخيص (عربي)</label>
                      <Input 
                        value={prescriptionData.diagnosisAr}
                        onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosisAr: e.target.value })}
                        placeholder="أدخل التشخيص..."
                        className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-[13px] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">Diagnosis (English)</label>
                      <Input 
                        value={prescriptionData.diagnosisEn}
                        onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosisEn: e.target.value })}
                        placeholder="Enter diagnosis..."
                        className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-[13px] focus:border-indigo-500/50 focus:ring-indigo-500/20"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-slate-500 dark:text-white/35 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
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
                      className="gap-1.5 rounded-xl h-8 px-3 text-[12px] font-bold border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <Plus size={13} /> إضافة دواء
                    </Button>
                  </div>
                  
                  <div className="space-y-2 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 max-h-[280px] overflow-y-auto">
                    {prescriptionData.medications.map((med, index) => (
                      <div key={index} className="relative p-3.5 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-xl group">
                        <div className="flex flex-col md:flex-row gap-2.5">
                          <div className="flex-1 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">اسم الدواء (Medication Name)</label>
                            <Input 
                              required
                              value={med.name}
                              onChange={(e) => {
                                const newMeds = [...prescriptionData.medications];
                                newMeds[index].name = e.target.value;
                                setPrescriptionData({ ...prescriptionData, medications: newMeds });
                              }}
                              placeholder="e.g. Panadol 500mg"
                              className="h-9 text-[13px] rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                          </div>
                          <div className="w-full md:w-1/4 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">الجرعة (Dosage)</label>
                            <Input 
                              required
                              value={med.dosage}
                              onChange={(e) => {
                                const newMeds = [...prescriptionData.medications];
                                newMeds[index].dosage = e.target.value;
                                setPrescriptionData({ ...prescriptionData, medications: newMeds });
                              }}
                              placeholder="e.g. 1 pill every 8 hours"
                              className="h-9 text-[13px] rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                          </div>
                          <div className="w-full md:w-[18%] space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">المدة (Duration)</label>
                            <Input 
                              value={med.duration}
                              onChange={(e) => {
                                const newMeds = [...prescriptionData.medications];
                                newMeds[index].duration = e.target.value;
                                setPrescriptionData({ ...prescriptionData, medications: newMeds });
                              }}
                              placeholder="e.g. 5 days"
                              className="h-9 text-[13px] rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>
                        
                        {prescriptionData.medications.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newMeds = prescriptionData.medications.filter((_, i) => i !== index);
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            className={cn("absolute -top-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100", isRTL ? "-left-2 md:top-3 md:left-3" : "-right-2 md:top-3 md:right-3")}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instructions Section */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-bold text-slate-500 dark:text-white/35 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    تعليمات إضافية (Instructions)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea 
                      value={prescriptionData.instructionsAr}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, instructionsAr: e.target.value })}
                      placeholder="تعليمات إضافية للمريض..."
                      className={cn(
                        "w-full min-h-[90px] p-3 rounded-xl border text-[13px]",
                        "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5",
                        "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25",
                        "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50",
                        "transition-all resize-y outline-none text-right"
                      )}
                      dir="rtl"
                    />
                    <textarea 
                      value={prescriptionData.instructionsEn}
                      onChange={(e) => setPrescriptionData({ ...prescriptionData, instructionsEn: e.target.value })}
                      placeholder="Additional instructions..."
                      className={cn(
                        "w-full min-h-[90px] p-3 rounded-xl border text-[13px]",
                        "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5",
                        "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25",
                        "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50",
                        "transition-all resize-y outline-none"
                      )}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-slate-200/60 dark:border-white/5">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsPrescriptionModalOpen(false)} 
                    className="rounded-xl h-10 px-5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    إلغاء (Cancel)
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submittingPrescription} 
                    className="rounded-xl h-10 px-6 text-[13px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
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
