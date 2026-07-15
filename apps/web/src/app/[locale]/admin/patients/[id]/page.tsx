'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import {
  User, Calendar, FileText, Pill, Stethoscope, ArrowRight, Download, Plus, Trash2, Clock, Upload, FileUp, X
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export default function PatientProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token } = useAuth();
  const tCommon = useTranslations('common');
  const tAdmin = useTranslations('admin.reports');

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'reports' | 'notes'>('appointments');

  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

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
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile) return;

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
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while creating the prescription');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  const tabs = [
    { id: 'appointments' as const, label: 'الحجوزات', icon: Calendar },
    { id: 'prescriptions' as const, label: 'الروشتات', icon: Pill },
    { id: 'reports' as const, label: 'التقارير والأشعة', icon: FileText },
    { id: 'notes' as const, label: 'تقييم الحالة', icon: Stethoscope },
  ];

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 animate-pulse" />
        <div className="h-14 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 animate-pulse" />
        <div className="h-96 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 dark:from-indigo-500/5 dark:via-transparent dark:to-purple-500/5" />
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/25 shrink-0">
              {profile.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{profile.name}</h1>
              <div className="flex flex-wrap gap-3 text-[13px] text-slate-500 dark:text-white/35 font-medium">
                <span>{profile.email}</span>
                {profile.phone && (
                  <>
                    <span className="text-slate-300 dark:text-white/10">|</span>
                    <span>{profile.phone}</span>
                  </>
                )}
                {profile.gender && (
                  <>
                    <span className="text-slate-300 dark:text-white/10">|</span>
                    <span className="capitalize">{profile.gender}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => {
                setIsPrescriptionModalOpen(true);
                setPrescriptionData({
                  diagnosisAr: '', diagnosisEn: '', instructionsAr: '', instructionsEn: '',
                  medications: [{ name: '', dosage: '', duration: '', notes: '' }]
                });
              }}
              variant="outline"
              className="rounded-xl font-bold text-[13px] gap-2 px-4 border-blue-500/30 text-blue-500 hover:bg-blue-500/5 hover:border-blue-500/50"
            >
              <Stethoscope size={15} /> عمل روشتة
            </Button>

            <Button
              onClick={() => {
                setIsUploadModalOpen(true);
                setUploadData({ title: '', description: '' });
                setFile(null);
              }}
              className="rounded-xl font-bold text-[13px] bg-indigo-500 hover:bg-indigo-600 text-white gap-2 shadow-lg shadow-indigo-500/20 px-4"
            >
              <FileUp size={15} /> رفع تقرير
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="rounded-xl font-bold text-[13px] text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <ArrowRight size={15} className="ml-1.5" /> رجوع
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-1.5">
        <div className="flex overflow-x-auto gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-[13px] transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 dark:text-white/35 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white/60"
              )}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 min-h-[500px] p-6">

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Calendar size={18} className="text-indigo-500" />
              </div>
              سجل الحجوزات
            </h2>
            {profile.appointments?.length > 0 ? (
              <div className="grid gap-3">
                {profile.appointments.map((apt: any) => (
                  <div key={apt.id} className="p-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col sm:flex-row justify-between gap-3 hover:border-indigo-500/20 dark:hover:border-indigo-500/10 transition-colors">
                    <div>
                      <div className="font-bold text-[13px] text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        {new Date(apt.date).toLocaleDateString()}
                        <span className="text-slate-300 dark:text-white/10">•</span>
                        <span className="text-slate-500 dark:text-white/35">{apt.timeSlot}</span>
                      </div>
                      <div className="text-[12px] text-slate-500 dark:text-white/35 font-medium">
                        النوع: {apt.type} | الحالة:{' '}
                        <span className={cn(
                          "font-bold uppercase",
                          apt.status === 'completed' ? "text-emerald-500" : apt.status === 'cancelled' ? "text-red-500" : "text-indigo-500"
                        )}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    <Calendar size={24} className="text-slate-400 dark:text-white/25" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">لا توجد حجوزات سابقة لهذا المريض.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Pill size={18} className="text-blue-500" />
              </div>
              سجل الروشتات
            </h2>
            {profile.prescriptions?.length > 0 ? (
              <div className="grid gap-4">
                {profile.prescriptions.map((px: any) => (
                  <div key={px.id} className="p-5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-200/60 dark:border-white/5 pb-4">
                      <div>
                        <div className="font-bold text-[13px] text-blue-500 flex items-center gap-2">
                          <Clock size={14} /> {new Date(px.createdAt).toLocaleDateString()}
                        </div>
                        {(px.diagnosisAr || px.diagnosisEn) && (
                          <div className="text-[13px] font-bold mt-2 text-slate-900 dark:text-white">
                            التشخيص: {px.diagnosisAr} {px.diagnosisEn && <span className="text-slate-500 dark:text-white/35">({px.diagnosisEn})</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 mb-3">الأدوية الموصوفة</h4>
                      <ul className="space-y-2">
                        {px.medications?.map((med: any, i: number) => (
                          <li key={i} className="flex items-center gap-3 text-[13px] bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200/60 dark:border-white/5">
                            <span className="font-bold text-slate-900 dark:text-white min-w-[120px]">{med.name}</span>
                            <span className="text-slate-500 dark:text-white/35">{med.dosage}</span>
                            {med.duration && (
                              <span className="text-indigo-500 text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold">
                                {med.duration}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    <Pill size={24} className="text-slate-400 dark:text-white/25" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">لا توجد روشتات مسجلة لهذا المريض.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <FileText size={18} className="text-emerald-500" />
              </div>
              التقارير والأشعة
            </h2>
            {profile.medicalReports?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.medicalReports.map((report: any) => (
                  <div key={report.id} className="p-5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col justify-between hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-colors">
                    <div>
                      <div className="font-bold text-[13px] text-slate-900 dark:text-white mb-2">{report.title}</div>
                      {report.description && (
                        <div className="text-[12px] text-slate-500 dark:text-white/35 font-medium mb-3">{report.description}</div>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-white/35 mb-4 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {report.fileUrl && (
                      <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full gap-2 rounded-xl font-bold text-[13px] border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                          <Download size={15} /> عرض الملف
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    <FileText size={24} className="text-slate-400 dark:text-white/25" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">لا توجد تقارير أو أشعة مرفوعة.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Stethoscope size={18} className="text-purple-500" />
              </div>
              تقييم الحالة (ملاحظات الطبيب السرية)
            </h2>

            <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-5 rounded-xl border border-slate-200/60 dark:border-white/5">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="أضف ملاحظة جديدة حول حالة المريض هنا..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-y text-[13px] font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-white/20"
                dir="rtl"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingNote}
                  className="rounded-xl font-bold text-[13px] gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 px-5"
                >
                  <Plus size={15} /> {submittingNote ? 'جاري الإضافة...' : 'إضافة التقييم'}
                </Button>
              </div>
            </form>

            <div className="space-y-3 mt-6">
              {profile.patientNotes?.length > 0 ? (
                profile.patientNotes.map((note: any) => (
                  <div key={note.id} className="p-5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] relative group hover:border-purple-500/20 dark:hover:border-purple-500/10 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-slate-500 dark:text-white/35">
                      <Clock size={13} /> {new Date(note.createdAt).toLocaleString('ar-EG')}
                    </div>
                    <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-white/80">{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-4 right-4 md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-14 border-2 border-dashed border-slate-200/60 dark:border-white/5 rounded-xl">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                      <Stethoscope size={24} className="text-slate-400 dark:text-white/25" />
                    </div>
                    <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">لا توجد ملاحظات سابقة، يمكنك كتابة تقييمك الخاص بالحالة هنا.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full sm:max-w-[500px] bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <FileUp size={18} className="text-indigo-500" />
                  </div>
                  {tAdmin('uploadMedicalReport', { fallback: 'Upload Report' })}
                </h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 ml-1">Report Title</label>
                  <Input
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g. Blood Test Results"
                    className="py-5 rounded-xl text-[13px] font-medium bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 ml-1">Description (Optional)</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Add any notes..."
                    className="w-full min-h-[80px] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y text-[13px] font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 ml-1">Select File</label>

                  <div className="relative border-2 border-dashed border-slate-200/60 dark:border-white/5 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-all bg-slate-50 dark:bg-white/[0.02] group cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                          <FileText size={22} />
                        </div>
                        <div className="font-bold text-[13px] text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</div>
                        <div className="text-[12px] text-slate-500 dark:text-white/35">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:scale-110 transition-transform">
                          <Upload size={22} />
                        </div>
                        <div className="font-bold text-[13px] text-slate-900 dark:text-white">Click to upload or drag and drop</div>
                        <div className="text-[12px] text-slate-500 dark:text-white/35">PDF, PNG, JPG (max. 10MB)</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-5 border-t border-slate-200/60 dark:border-white/5 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl font-bold text-[13px] h-10 px-5 text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5">
                    {tCommon('cancel', { fallback: 'Cancel' })}
                  </Button>
                  <Button type="submit" disabled={uploading || !uploadData.title || !file} className="rounded-xl font-bold text-[13px] px-6 h-10 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full sm:max-w-3xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden relative shadow-2xl my-8">
            <div className="p-6 md:p-8">
              <div className="mb-6 pb-5 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <Stethoscope size={20} className="text-blue-500" />
                    </div>
                    عمل روشتة طبية (Prescription)
                  </h2>
                  <button onClick={() => setIsPrescriptionModalOpen(false)} className="p-2 text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
                {/* Diagnosis Section */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[12px] uppercase tracking-widest text-slate-500 dark:text-white/35 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    التشخيص (Diagnosis)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-white/35">التشخيص (عربي)</label>
                      <Input
                        value={prescriptionData.diagnosisAr}
                        onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosisAr: e.target.value })}
                        placeholder="أدخل التشخيص..."
                        className="py-4 rounded-xl text-[13px] font-medium bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-white/35">Diagnosis (English)</label>
                      <Input
                        value={prescriptionData.diagnosisEn}
                        onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosisEn: e.target.value })}
                        placeholder="Enter diagnosis..."
                        className="py-4 rounded-xl text-[13px] font-medium bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[12px] uppercase tracking-widest text-slate-500 dark:text-white/35 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
                      className="gap-1.5 rounded-xl text-[12px] font-bold border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <Plus size={13} /> إضافة دواء
                    </Button>
                  </div>

                  <div className="space-y-2.5 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 max-h-[300px] overflow-y-auto">
                    {prescriptionData.medications.map((med, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-xl relative group">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-white/35 uppercase">اسم الدواء (Medication Name)</label>
                          <Input
                            required
                            value={med.name}
                            onChange={(e) => {
                              const newMeds = [...prescriptionData.medications];
                              newMeds[index].name = e.target.value;
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            placeholder="e.g. Panadol 500mg"
                            className="h-9 text-[13px] rounded-xl border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                          />
                        </div>
                        <div className="w-full md:w-1/4 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-white/35 uppercase">الجرعة (Dosage)</label>
                          <Input
                            required
                            value={med.dosage}
                            onChange={(e) => {
                              const newMeds = [...prescriptionData.medications];
                              newMeds[index].dosage = e.target.value;
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            placeholder="e.g. 1 pill every 8 hours"
                            className="h-9 text-[13px] rounded-xl border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                          />
                        </div>
                        <div className="w-full md:w-1/5 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-white/35 uppercase">المدة (Duration)</label>
                          <Input
                            value={med.duration}
                            onChange={(e) => {
                              const newMeds = [...prescriptionData.medications];
                              newMeds[index].duration = e.target.value;
                              setPrescriptionData({ ...prescriptionData, medications: newMeds });
                            }}
                            placeholder="e.g. 5 days"
                            className="h-9 text-[13px] rounded-xl border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
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
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-5 border-t border-slate-200/60 dark:border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setIsPrescriptionModalOpen(false)} className="rounded-xl font-bold text-[13px] h-10 px-5 text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5">
                    {tCommon('cancel', { fallback: 'Cancel' })}
                  </Button>
                  <Button type="submit" disabled={submittingPrescription} className="rounded-xl font-bold text-[13px] px-6 h-10 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
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
