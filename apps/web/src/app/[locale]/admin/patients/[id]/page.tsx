'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { User, Calendar, FileText, Pill, Stethoscope, ArrowRight, Download, Plus, Trash2, Clock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function PatientProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token } = useAuth();
  const tCommon = useTranslations('common');
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'reports' | 'notes'>('appointments');
  
  // Note State
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

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
      <Card className="p-8 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--background)] to-[var(--primary)]/5 shadow-lg relative overflow-hidden">
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
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-10 px-4 font-bold border-[var(--border)]">
            <ArrowRight size={16} className="ml-2" /> العودة للقائمة
          </Button>
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
    </div>
  );
}
