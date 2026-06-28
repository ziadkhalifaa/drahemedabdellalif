'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { 
  User, Calendar, FileText, Pill, Stethoscope, ArrowRight, Download, Plus, Trash2, Clock, Upload, FileUp, X
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function PatientProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token } = useAuth();
  const tCommon = useTranslations('common');
  const tAdmin = useTranslations('admin.reports'); // Fallbacks used inline if missing
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'reports' | 'notes'>('appointments');
  
  // Note State
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

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
    if (!token || !id) return;
    fetchProfile();
  }, [token, id]);

  const fetchProfile = async () => {
    try {
      const data = await api.get(`/auth/users/${id}/profile`, token);
      setProfile(data);
    } catch (err) {
      toast.error('Failed to load patient profile');
      router.push('/admin/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newNote.trim()) return;
    
    setSubmittingNote(true);
    try {
      await api.post(`/auth/users/${id}/notes`, { content: newNote }, token);
      toast.success('Note added successfully');
      setNewNote('');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.delete(`/auth/users/notes/${noteId}`, token);
      toast.success('Note deleted successfully');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  // Upload Handlers
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
    if (!token || !profile || !file || !uploadData.title) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      if (uploadData.description) formData.append('description', uploadData.description);
      formData.append('patientId', profile.id);
      formData.append('file', file);

      await api.postFormData('/reports', formData, token);

      toast.success('Medical report uploaded successfully!');
      setIsUploadModalOpen(false);
      setFile(null);
      setUploadData({ title: '', description: '' });
      fetchProfile(); // Refresh profile to see the new report
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  // Prescription Handlers
  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile) return;
    
    // Validate medications
    const validMedications = prescriptionData.medications.filter(m => m.name && m.dosage);
    if (validMedications.length === 0) {
      toast.error('Please add at least one medication with name and dosage.');
      return;
    }

    setSubmittingPrescription(true);
    try {
      await api.post('/prescriptions', {
        patientId: profile.id,
        diagnosisAr: prescriptionData.diagnosisAr || undefined,
        diagnosisEn: prescriptionData.diagnosisEn || undefined,
        instructionsAr: prescriptionData.instructionsAr || undefined,
        instructionsEn: prescriptionData.instructionsEn || undefined,
        medications: validMedications
      }, token);

      toast.success('Prescription created successfully!');
      setIsPrescriptionModalOpen(false);
      fetchProfile(); // Refresh profile to see the new prescription
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while creating the prescription');
    } finally {
      setSubmittingPrescription(false);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-40 animate-pulse bg-[var(--card)] rounded-3xl" />
        <div className="h-96 animate-pulse bg-[var(--card)] rounded-3xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      {/* Header / Patient Info */}
      <Card className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-light)] text-white font-black flex items-center justify-center text-4xl shadow-xl shadow-[var(--primary)]/30">
              {profile.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1">{profile.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] font-medium">
                <span>{profile.email}</span>
                {profile.phone && <span>• {profile.phone}</span>}
                {profile.gender && <span className="capitalize">• {profile.gender}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => {
                setIsPrescriptionModalOpen(true);
                setPrescriptionData({
                  diagnosisAr: '', diagnosisEn: '', instructionsAr: '', instructionsEn: '',
                  medications: [{ name: '', dosage: '', duration: '', notes: '' }]
                });
              }}
              variant="outline"
              className="rounded-xl font-bold gap-2 px-4 border-blue-500/30 text-blue-500 hover:bg-blue-50 hover:border-blue-500"
            >
              <Stethoscope size={16} /> عمل روشتة
            </Button>
            
            <Button 
              onClick={() => {
                setIsUploadModalOpen(true);
                setUploadData({ title: '', description: '' });
                setFile(null);
              }}
              className="rounded-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-lg shadow-[var(--primary)]/20 px-4"
            >
              <FileUp size={16} /> رفع تقرير
            </Button>

            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold">
              <ArrowRight size={16} className="ml-2" /> رجوع
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        {[
          { id: 'appointments', label: 'الحجوزات', icon: Calendar },
          { id: 'prescriptions', label: 'الروشتات', icon: Pill },
          { id: 'reports', label: 'التقارير والأشعة', icon: FileText },
          { id: 'notes', label: 'تقييم الحالة', icon: Stethoscope },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20' 
                : 'text-[var(--muted)] hover:bg-[var(--background)]'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="min-h-[500px] border border-[var(--border)] rounded-3xl p-6 bg-[var(--card)]">
        
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-[var(--foreground)]">
              <Calendar className="text-[var(--primary)]" /> سجل الحجوزات
            </h2>
            {profile.appointments?.length > 0 ? (
              <div className="grid gap-4">
                {profile.appointments.map((apt: any) => (
                  <div key={apt.id} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="font-bold mb-1 flex items-center gap-2">
                        {new Date(apt.date).toLocaleDateString()} <span className="text-[var(--muted)]">•</span> {apt.timeSlot}
                      </div>
                      <div className="text-sm text-[var(--muted)] font-medium">النوع: {apt.type} | الحالة: <span className="uppercase text-[var(--primary)] font-bold">{apt.status}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[var(--muted)] font-medium">لا توجد حجوزات سابقة لهذا المريض.</div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-[var(--foreground)]">
              <Pill className="text-blue-500" /> سجل الروشتات
            </h2>
            {profile.prescriptions?.length > 0 ? (
              <div className="grid gap-4">
                {profile.prescriptions.map((px: any) => (
                  <div key={px.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 space-y-4">
                    <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
                      <div>
                        <div className="font-black text-lg text-blue-500 flex items-center gap-2">
                          <Clock size={16} /> {new Date(px.createdAt).toLocaleDateString()}
                        </div>
                        {(px.diagnosisAr || px.diagnosisEn) && (
                          <div className="text-sm font-bold mt-2 text-[var(--foreground)]">
                            التشخيص: {px.diagnosisAr} {px.diagnosisEn && `(${px.diagnosisEn})`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-3">الأدوية الموصوفة</h4>
                      <ul className="space-y-2">
                        {px.medications?.map((med: any, i: number) => (
                          <li key={i} className="flex gap-2 text-sm bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] font-medium">
                            <span className="font-bold min-w-[120px]">{med.name}</span>
                            <span className="text-[var(--muted)]">{med.dosage}</span>
                            {med.duration && <span className="text-[var(--primary)] text-xs bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">{med.duration}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[var(--muted)] font-medium">لا توجد روشتات مسجلة لهذا المريض.</div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-[var(--foreground)]">
              <FileText className="text-emerald-500" /> التقارير والأشعة
            </h2>
            {profile.medicalReports?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.medicalReports.map((report: any) => (
                  <div key={report.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-lg mb-2">{report.title}</div>
                      {report.description && <div className="text-sm text-[var(--muted)] font-medium mb-4">{report.description}</div>}
                      <div className="text-xs text-[var(--muted)] mb-4">{new Date(report.createdAt).toLocaleDateString()}</div>
                    </div>
                    {report.fileUrl && (
                      <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full gap-2 rounded-xl border-[var(--border)] font-bold">
                          <Download size={16} /> عرض الملف
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[var(--muted)] font-medium">لا توجد تقارير أو أشعة مرفوعة.</div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-[var(--foreground)]">
              <Stethoscope className="text-purple-500" /> تقييم الحالة (ملاحظات الطبيب السرية)
            </h2>
            
            <form onSubmit={handleAddNote} className="space-y-3 bg-[var(--background)]/30 p-4 rounded-2xl border border-[var(--border)]">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="أضف ملاحظة جديدة حول حالة المريض هنا..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-y text-sm font-medium outline-none"
                dir="rtl"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={submittingNote} className="rounded-xl font-bold gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 px-6">
                  <Plus size={16} /> {submittingNote ? 'جاري الإضافة...' : 'إضافة التقييم'}
                </Button>
              </div>
            </form>

            <div className="space-y-4 mt-8">
              {profile.patientNotes?.length > 0 ? (
                profile.patientNotes.map((note: any) => (
                  <div key={note.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 relative group">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[var(--muted)]">
                      <Clock size={14} /> {new Date(note.createdAt).toLocaleString('ar-EG')}
                    </div>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-4 right-4 md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-[var(--muted)] font-medium border border-dashed border-[var(--border)] rounded-2xl">
                  لا توجد ملاحظات سابقة، يمكنك كتابة تقييمك الخاص بالحالة هنا.
                </div>
              )}
            </div>
          </div>
        )}

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
                    {tAdmin('uploadMedicalReport', { fallback: 'Upload Report' })}
                  </h2>
                  <button onClick={() => setIsUploadModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                    <X size={24} />
                  </button>
                </div>
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
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
                  <Button type="button" variant="ghost" onClick={() => setIsPrescriptionModalOpen(false)} className="rounded-xl font-bold h-12 px-6">
                    {tCommon('cancel', { fallback: 'Cancel' })}
                  </Button>
                  <Button type="submit" disabled={submittingPrescription} className="rounded-xl font-bold px-8 h-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    {submittingPrescription ? tCommon('loading', { fallback: 'Saving...' }) : 'حفظ الروشتة'}
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
