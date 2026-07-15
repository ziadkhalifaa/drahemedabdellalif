'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, Button } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { api, getMediaUrl } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Link, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Video, Shield, PhoneOff, User, Calendar, Clock, FileText,
  Upload, Pill, HeartPulse, FileBarChart, Download, X,
  ChevronRight, ChevronLeft, Activity, AlertCircle, CheckCircle2,
  Plus, Trash2, Stethoscope, Loader2, Paperclip, MessageSquare,
  RefreshCw, ExternalLink, FileImage, File, Eye, LogIn
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

type TabType = 'info' | 'prescription' | 'reports' | 'chat';

interface Medication {
  name: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export default function VideoRoomPage() {
  const { meetingId } = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('dashboard.video');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, token, isLoading } = useAuth();
  const isDoctor = user?.role === 'admin' || user?.role === 'editor';
  const [authError, setAuthError] = useState<string | null>(null);

  const [meetingUrl, setMeetingUrl] = useState<string>(`https://meet.jit.si/${meetingId}`);
  const [appointment, setAppointment] = useState<any>(null);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [endingSession, setEndingSession] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [sessionReports, setSessionReports] = useState<any[]>([]);
  const [sessionPrescription, setSessionPrescription] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const authToken = token ?? undefined;

  // Redirect to login if not authenticated
  useEffect(() => {
    setMounted(true);
    if (!isLoading && !token) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(`/dashboard/video/${meetingId}`)}`;
      router.push(loginUrl);
    }
  }, [isLoading, token, meetingId, router]);

  // Fetch appointment data and verify ownership
  useEffect(() => {
    if (!token) return;
    api.get<any>(`/appointments/by-meeting/${meetingId}`, authToken)
      .then(appt => {
        if (!appt) {
          setAuthError(isRTL ? 'لم يتم العثور على الجلسة' : 'Session not found');
          setAppointmentLoading(false);
          return;
        }
        // Verify ownership: patient must own this appointment, doctors can access any
        const isOwner = appt.patientId === user?.id || appt.guestEmail === user?.email;
        if (!isDoctor && !isOwner) {
          setAuthError(isRTL ? 'هذه الجلسة غير مخصصة لك' : 'This session does not belong to you');
          setAppointmentLoading(false);
          return;
        }
        setAppointment(appt);
        if (appt.meetingUrl) setMeetingUrl(appt.meetingUrl);
        setAppointmentLoading(false);
        loadPrescription(appt.id);
        loadSessionReports(appt.id);
      })
      .catch(err => {
        console.error(err);
        setAppointmentLoading(false);
        setAuthError(isRTL ? 'فشل في تحميل بيانات الجلسة' : 'Failed to load session');
      });
  }, [meetingId, token, user?.id, user?.email, isDoctor]);

  const loadPrescription = async (apptId: string) => {
    try {
      const rx = await api.get<any>(`/prescriptions/by-appointment/${apptId}`, authToken);
      if (rx) setSessionPrescription(rx);
    } catch {}
  };

  const loadSessionReports = async (apptId: string) => {
    try {
      const reports = await api.get<any[]>(`/reports/by-appointment/${apptId}`, authToken);
      setSessionReports(reports || []);
    } catch {}
  };

  // Poll for patient to check if doctor ended the session
  useEffect(() => {
    if (!token || !meetingId || isDoctor) return;
    const interval = setInterval(() => {
      api.get<any>(`/appointments/by-meeting/${meetingId}`, authToken)
        .then(appt => {
          if (appt.status === 'completed') {
            clearInterval(interval);
            router.push(`/dashboard?rateAppointmentId=${appt.id}`);
          }
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [meetingId, token, user, router]);

  // Poll for new data during session (both sides)
  useEffect(() => {
    if (!appointment?.id || !token) return;
    const interval = setInterval(async () => {
      await loadSessionReports(appointment.id);
      await loadPrescription(appointment.id);
    }, 8000);
    return () => clearInterval(interval);
  }, [appointment?.id, token]);

  // Prescription form state
  const [diagnosisAr, setDiagnosisAr] = useState('');
  const [diagnosisEn, setDiagnosisEn] = useState('');
  const [instructionsAr, setInstructionsAr] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', duration: '', notes: '' }]);
  const [submittingRx, setSubmittingRx] = useState(false);

  const addMedication = () => setMedications(prev => [...prev, { name: '', dosage: '', duration: '', notes: '' }]);
  const removeMedication = (idx: number) => setMedications(prev => prev.filter((_, i) => i !== idx));
  const updateMedication = (idx: number, field: keyof Medication, value: string) =>
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));

  const handleCreatePrescription = async () => {
    if (!appointment?.id || !appointment?.patient?.id) return;
    const validMeds = medications.filter(m => m.name.trim());
    if (validMeds.length === 0) { toast.error(isRTL ? 'أضف دواء واحد على الأقل' : 'Add at least one medication'); return; }

    setSubmittingRx(true);
    try {
      const rx = await api.post<any>('/prescriptions', {
        appointmentId: appointment.id,
        patientId: appointment.patient.id,
        diagnosisAr: diagnosisAr.trim() || undefined,
        diagnosisEn: diagnosisEn.trim() || undefined,
        instructionsAr: instructionsAr.trim() || undefined,
        instructionsEn: instructionsEn.trim() || undefined,
        medications: validMeds,
      }, authToken);
      setSessionPrescription(rx);
      toast.success(isRTL ? 'تم إصدار الروشتة بنجاح' : 'Prescription issued successfully');
      setActiveTab('info');
    } catch (err: any) {
      toast.error(err?.message || (isRTL ? 'فشل في إصدار الروشتة' : 'Failed to issue prescription'));
    } finally {
      setSubmittingRx(false);
    }
  };

  // Report upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  const handleUploadReport = async (file: File) => {
    if (!appointment?.id) return;
    const patientId = user?.id;
    if (!patientId) return;

    setUploadingReport(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', reportTitle.trim() || file.name);
      formData.append('patientId', patientId);
      formData.append('appointmentId', appointment.id);

      const report = await api.postFormData<any>('/reports', formData, authToken);
      setSessionReports(prev => [report, ...prev]);
      setReportTitle('');
      toast.success(isRTL ? 'تم رفع الملف بنجاح' : 'File uploaded successfully');
    } catch (err: any) {
      toast.error(err?.message || (isRTL ? 'فشل في رفع الملف' : 'Failed to upload file'));
    } finally {
      setUploadingReport(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadReport(file);
  }, [appointment, reportTitle, token]);

  const handleEndSession = async () => {
    if (!appointment?.id) return;
    setEndingSession(true);
    try {
      await api.patch(`/appointments/${appointment.id}/status`, { status: 'completed' }, authToken);
      const patientName = appointment?.patient?.name || appointment?.guestName || '';
      const appointmentId = appointment?.id || '';
      router.push(`/admin/patients?search=${encodeURIComponent(patientName)}&appointmentId=${appointmentId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(isRTL ? 'فشل في إنهاء الجلسة' : 'Failed to end session');
    } finally {
      setEndingSession(false);
    }
  };

  if (!mounted) return null;

  if (appointmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 flex items-center justify-center bg-[#0a0a0f] overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-red-500/10 rounded-full blur-[120px]" />
          </div>
          <Card className="max-w-md w-full p-10 bg-zinc-900/60 backdrop-blur-2xl border-white/[0.06] rounded-[2.5rem] text-center relative z-10 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">
              {isRTL ? 'غير مصرح بالدخول' : 'Access Denied'}
            </h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">{authError}</p>
            <Link href={isDoctor ? '/admin' : '/dashboard'} className="block w-full">
              <Button className="w-full h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-transform text-white">
                {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </Link>
          </Card>
        </main>
      </>
    );
  }

  if (appointment?.status === 'completed' || appointment?.status === 'cancelled') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 flex items-center justify-center bg-[#0a0a0f] overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px]" />
          </div>
          <Card className="max-w-md w-full p-10 bg-zinc-900/60 backdrop-blur-2xl border-white/[0.06] rounded-[2.5rem] text-center relative z-10 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Shield size={40} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">
              {isRTL ? 'انتهت الجلسة الاستشارية' : 'Session Ended'}
            </h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
              {isRTL
                ? 'شكراً لك على ثقتك بنا. لقد تم إنهاء هذه الاستشارة الطبية بنجاح.'
                : 'Thank you for your trust. This medical consultation has ended successfully.'}
            </p>
            <Link href={isDoctor ? '/admin' : '/dashboard'} className="block w-full">
              <Button className="w-full h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-transform text-white">
                {isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
              </Button>
            </Link>
          </Card>
        </main>
      </>
    );
  }

  const patient = appointment?.patient || null;

  const doctorTabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'info', label: isRTL ? 'المريض' : 'Patient', icon: User },
    { key: 'prescription', label: isRTL ? 'روشتة' : 'Prescription', icon: Pill },
    { key: 'reports', label: isRTL ? 'التقارير' : 'Reports', icon: FileBarChart },
  ];

  const patientTabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'info', label: isRTL ? 'الطبيب' : 'Doctor', icon: Stethoscope },
    { key: 'reports', label: isRTL ? 'رفع تقارير' : 'Upload', icon: Upload },
    { key: 'prescription', label: isRTL ? 'الروشتة' : 'Rx', icon: Pill },
  ];

  const sidebarTabs = isDoctor ? doctorTabs : patientTabs;

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Top Bar */}
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-white/[0.04] px-4 py-2 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Video size={16} />
          </div>
          <div>
            <h1 className="text-white text-[13px] font-bold leading-tight">{t('title')}</h1>
            <p className="text-zinc-500 text-[10px] flex items-center gap-1 font-medium">
              <Shield size={10} className="text-emerald-500" />
              {t('encrypted')}
            </p>
          </div>
          {appointment && (
            <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-medium">
                <Calendar size={11} />
                <span>{new Date(appointment.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-medium">
                <Clock size={11} />
                <span>{appointment.timeSlot}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Sidebar */}
          <button
            onClick={() => setShowSidebar(prev => !prev)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all text-[10px] font-medium"
          >
            <ChevronRight size={14} className={cn("transition-transform", !showSidebar && "rotate-180")} />
          </button>

          {isDoctor && (
            <Button
              onClick={handleEndSession}
              disabled={endingSession}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 font-bold h-9 px-3.5 shadow-lg shadow-red-500/10 active:scale-95 transition-all text-[11px] border-none"
            >
              {endingSession ? <Loader2 size={14} className="animate-spin" /> : <PhoneOff size={14} />}
              {endingSession
                ? (isRTL ? 'جاري الإنهاء...' : 'Ending...')
                : (isRTL ? 'إنهاء الجلسة' : 'End Session')}
            </Button>
          )}

          <Link href={isDoctor ? '/admin' : '/dashboard'}>
            <Button variant="outline" className="border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl gap-2 bg-transparent h-9 px-3.5 text-[11px]">
              <PhoneOff size={14} className="text-red-500" />
              {t('leaveRoom')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Area */}
        <div className={cn("flex-1 relative bg-[#0a0a0f] transition-all duration-300", showSidebar ? "xl:mr-0" : "xl:mr-0")}>
          <iframe
            src={`${meetingUrl}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`}
            allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; speaker"
            className="absolute inset-0 w-full h-full border-none"
            title="Video Consultation"
          />

          {/* Live badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{t('liveRoom')}</span>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={cn(
          "w-[360px] shrink-0 bg-zinc-900/60 backdrop-blur-xl border-l border-white/[0.04] flex flex-col overflow-hidden transition-all duration-300",
          showSidebar ? "max-w-[360px]" : "max-w-0 border-l-0"
        )}>
          {/* Sidebar Tabs */}
          <div className="flex border-b border-white/[0.04] shrink-0">
            {sidebarTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 relative",
                  activeTab === tab.key
                    ? "text-indigo-400"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <tab.icon size={13} />
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB: Info */}
            {activeTab === 'info' && (
              <>
                {isDoctor ? (
                  <>
                    {/* Doctor view - Patient Info */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 mx-auto mb-3 flex items-center justify-center border border-indigo-500/10">
                        <User size={28} className="text-indigo-400" />
                      </div>
                      <h3 className="text-white font-bold text-[15px]">{patient?.name || appointment?.guestName || '---'}</h3>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{patient?.email || appointment?.guestEmail || ''}</p>
                    </div>

                    <div className="space-y-2">
                      {patient?.phone && (
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                          <PhoneOff size={13} className="text-zinc-500" />
                          <span className="text-zinc-300 text-[12px] font-medium">{patient.phone}</span>
                        </div>
                      )}
                      {patient?.gender && (
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                          <User size={13} className="text-zinc-500" />
                          <span className="text-zinc-300 text-[12px] font-medium">
                            {patient.gender === 'male' ? (isRTL ? 'ذكر' : 'Male') : patient.gender === 'female' ? (isRTL ? 'أنثى' : 'Female') : patient.gender}
                          </span>
                        </div>
                      )}
                      {patient?.dateOfBirth && (
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                          <Calendar size={13} className="text-zinc-500" />
                          <span className="text-zinc-300 text-[12px] font-medium">
                            {new Date(patient.dateOfBirth).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <Calendar size={13} className="text-zinc-500" />
                        <span className="text-zinc-300 text-[12px] font-medium">
                          {new Date(appointment?.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')} - {appointment?.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Session Reports Summary */}
                    {sessionReports.length > 0 && (
                      <div>
                        <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <FileBarChart size={11} />
                          {isRTL ? 'التقارير المرفوعة' : 'Session Reports'} ({sessionReports.length})
                        </h4>
                        <div className="space-y-1.5">
                          {sessionReports.map(r => (
                            <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/10">
                              <FileText size={13} className="text-indigo-400 shrink-0" />
                              <span className="text-zinc-300 text-[11px] truncate flex-1">{r.title}</span>
                              {r.fileUrl && (
                                <a href={getMediaUrl(r.fileUrl)} target="_blank" className="text-indigo-400 hover:text-indigo-300">
                                  <Eye size={13} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescription Summary */}
                    {sessionPrescription && (
                      <div>
                        <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Pill size={11} />
                          {isRTL ? 'الروشتة الصادرة' : 'Issued Prescription'}
                        </h4>
                        <div className="px-3 py-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 space-y-1.5">
                          {sessionPrescription.diagnosisAr && (
                            <p className="text-emerald-300 text-[11px] font-medium">
                              {sessionPrescription.diagnosisAr}
                            </p>
                          )}
                          <p className="text-zinc-500 text-[10px]">
                            {sessionPrescription.medications?.length || 0} {isRTL ? 'دوائية' : 'medications'}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Patient view - Doctor Info */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 mx-auto mb-3 flex items-center justify-center border border-indigo-500/10">
                        <Stethoscope size={28} className="text-indigo-400" />
                      </div>
                      <h3 className="text-white font-bold text-[15px]">{isRTL ? 'د. أحمد عبد اللطيف' : 'Dr. Ahmed Abdellatif'}</h3>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{isRTL ? 'استشاري جراحة العظام' : 'Orthopedic Consultant'}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <Calendar size={13} className="text-zinc-500" />
                        <span className="text-zinc-300 text-[12px] font-medium">
                          {new Date(appointment?.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')} - {appointment?.timeSlot}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <Video size={13} className="text-zinc-500" />
                        <span className="text-zinc-300 text-[12px] font-medium">
                          {isRTL ? 'استشارة أونلاين' : 'Online Consultation'}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 text-amber-400 text-[11px] leading-relaxed">
                      {isRTL
                        ? 'يمكنك رفع الأشعة والتحاليل من تبويب "رفع تقارير" ليقوم الطبيب بمراجعتها خلال الجلسة.'
                        : 'You can upload X-rays and analyses from the "Upload" tab for the doctor to review during the session.'}
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB: Prescription (Doctor) */}
            {activeTab === 'prescription' && isDoctor && (
              <>
                {sessionPrescription ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 mx-auto mb-3 flex items-center justify-center">
                        <CheckCircle2 size={28} className="text-emerald-400" />
                      </div>
                      <h3 className="text-white font-bold text-[14px]">{isRTL ? 'تم إصدار الروشتة' : 'Prescription Issued'}</h3>
                      <p className="text-zinc-500 text-[11px] mt-1">{isRTL ? 'الروشتة متاحة للمريض في ملفه' : 'Available in patient profile'}</p>
                    </div>

                    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                      {sessionPrescription.diagnosisAr && (
                        <div>
                          <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1">{isRTL ? 'التشخيص' : 'Diagnosis'}</p>
                          <p className="text-white text-[12px]">{locale === 'ar' ? sessionPrescription.diagnosisAr : sessionPrescription.diagnosisEn || sessionPrescription.diagnosisAr}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5">{isRTL ? 'الأدوية' : 'Medications'}</p>
                        <div className="space-y-1.5">
                          {sessionPrescription.medications?.map((med: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                              <span className="text-indigo-400 font-bold mt-0.5">{i + 1}.</span>
                              <div>
                                <p className="text-white font-medium">{med.name}</p>
                                <p className="text-zinc-500">{med.dosage} - {med.duration}</p>
                                {med.notes && <p className="text-zinc-600 text-[10px]">{med.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {(sessionPrescription.instructionsAr || sessionPrescription.instructionsEn) && (
                        <div>
                          <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1">{isRTL ? 'تعليمات' : 'Instructions'}</p>
                          <p className="text-zinc-300 text-[11px]">{locale === 'ar' ? sessionPrescription.instructionsAr : sessionPrescription.instructionsEn || sessionPrescription.instructionsAr}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                        {isRTL ? 'التشخيص (عربي)' : 'Diagnosis (Arabic)'}
                      </label>
                      <textarea
                        value={diagnosisAr}
                        onChange={e => setDiagnosisAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-[12px] placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none min-h-[60px]"
                        placeholder={isRTL ? 'اكتب التشخيص...' : 'Enter diagnosis...'}
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                        {isRTL ? 'التشخيص (إنجليزي)' : 'Diagnosis (English)'}
                      </label>
                      <textarea
                        value={diagnosisEn}
                        onChange={e => setDiagnosisEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-[12px] placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none min-h-[60px]"
                        placeholder="Enter diagnosis..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          {isRTL ? 'الأدوية' : 'Medications'}
                        </label>
                        <button onClick={addMedication} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold transition-colors">
                          <Plus size={12} />
                          {isRTL ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {medications.map((med, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2 relative">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-600 text-[10px] font-bold w-5">{idx + 1}.</span>
                              <input
                                value={med.name}
                                onChange={e => updateMedication(idx, 'name', e.target.value)}
                                className="flex-1 bg-transparent border-b border-white/[0.06] text-white text-[12px] py-1 focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
                                placeholder={isRTL ? 'اسم الدواء' : 'Medication name'}
                              />
                              {medications.length > 1 && (
                                <button onClick={() => removeMedication(idx)} className="text-red-500/60 hover:text-red-400 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                value={med.dosage}
                                onChange={e => updateMedication(idx, 'dosage', e.target.value)}
                                className="flex-1 bg-transparent border border-white/[0.06] rounded-lg text-white text-[11px] px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
                                placeholder={isRTL ? 'الجرعة' : 'Dosage'}
                              />
                              <input
                                value={med.duration}
                                onChange={e => updateMedication(idx, 'duration', e.target.value)}
                                className="flex-1 bg-transparent border border-white/[0.06] rounded-lg text-white text-[11px] px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
                                placeholder={isRTL ? 'المدة' : 'Duration'}
                              />
                            </div>
                            <input
                              value={med.notes || ''}
                              onChange={e => updateMedication(idx, 'notes', e.target.value)}
                              className="w-full bg-transparent border border-white/[0.06] rounded-lg text-white text-[11px] px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
                              placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                        {isRTL ? 'تعليمات (عربي)' : 'Instructions (Arabic)'}
                      </label>
                      <textarea
                        value={instructionsAr}
                        onChange={e => setInstructionsAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-[12px] placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none min-h-[60px]"
                        placeholder={isRTL ? 'اكتب التعليمات...' : 'Enter instructions...'}
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                        {isRTL ? 'تعليمات (إنجليزي)' : 'Instructions (English)'}
                      </label>
                      <textarea
                        value={instructionsEn}
                        onChange={e => setInstructionsEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-[12px] placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none min-h-[60px]"
                        placeholder="Enter instructions..."
                      />
                    </div>

                    <Button
                      onClick={handleCreatePrescription}
                      disabled={submittingRx}
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl h-11 text-[12px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                    >
                      {submittingRx ? (
                        <Loader2 size={15} className="animate-spin mr-2" />
                      ) : (
                        <Pill size={15} className="mr-2" />
                      )}
                      {submittingRx
                        ? (isRTL ? 'جاري الإصدار...' : 'Issuing...')
                        : (isRTL ? 'إصدار الروشتة' : 'Issue Prescription')}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* TAB: Prescription (Patient) */}
            {activeTab === 'prescription' && !isDoctor && (
              <>
                {sessionPrescription ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 mx-auto mb-3 flex items-center justify-center">
                        <Pill size={28} className="text-emerald-400" />
                      </div>
                      <h3 className="text-white font-bold text-[14px]">{isRTL ? 'الروشتة الطبية' : 'Prescription'}</h3>
                      <p className="text-zinc-500 text-[11px] mt-1">{isRTL ? 'صادرة عن د. أحمد عبد اللطيف' : 'Issued by Dr. Ahmed Abdellatif'}</p>
                    </div>

                    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                      {sessionPrescription.diagnosisAr && (
                        <div>
                          <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1">{isRTL ? 'التشخيص' : 'Diagnosis'}</p>
                          <p className="text-white text-[12px]">{locale === 'ar' ? sessionPrescription.diagnosisAr : sessionPrescription.diagnosisEn || sessionPrescription.diagnosisAr}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1.5">{isRTL ? 'الأدوية' : 'Medications'}</p>
                        <div className="space-y-1.5">
                          {sessionPrescription.medications?.map((med: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                              <span className="text-indigo-400 font-bold mt-0.5">{i + 1}.</span>
                              <div>
                                <p className="text-white font-medium">{med.name}</p>
                                <p className="text-zinc-500">{med.dosage} - {med.duration}</p>
                                {med.notes && <p className="text-zinc-600 text-[10px]">{med.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {(sessionPrescription.instructionsAr || sessionPrescription.instructionsEn) && (
                        <div>
                          <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold mb-1">{isRTL ? 'تعليمات' : 'Instructions'}</p>
                          <p className="text-zinc-300 text-[11px]">{locale === 'ar' ? sessionPrescription.instructionsAr : sessionPrescription.instructionsEn || sessionPrescription.instructionsAr}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 mx-auto mb-4 flex items-center justify-center">
                      <Pill size={28} className="text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-[12px] font-medium">{isRTL ? 'لم يتم إصدار روشتة بعد' : 'No prescription issued yet'}</p>
                    <p className="text-zinc-600 text-[10px] mt-1">{isRTL ? 'سينتظر حتى يقوم الطبيب بوصف العلاج' : 'Waiting for the doctor to prescribe medication'}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-zinc-600 text-[10px]">
                      <RefreshCw size={11} className="animate-spin" />
                      {isRTL ? 'يتم التحديث تلقائياً' : 'Auto-updating'}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB: Reports */}
            {activeTab === 'reports' && (
              <>
                {/* Existing Session Reports */}
                {sessionReports.length > 0 && (
                  <div>
                    <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <FileBarChart size={11} />
                      {isRTL ? 'تقارير الجلسة' : 'Session Reports'} ({sessionReports.length})
                    </h4>
                    <div className="space-y-1.5 mb-4">
                      {sessionReports.map(r => (
                        <div key={r.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-zinc-300 text-[11px] font-medium truncate">{r.title}</p>
                            <p className="text-zinc-600 text-[9px]">{new Date(r.createdAt).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {r.fileUrl && (
                            <a href={getMediaUrl(r.fileUrl)} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Area (Patient) */}
                {!isDoctor && (
                  <div>
                    <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Upload size={11} />
                      {isRTL ? 'رفع تقارير جديدة' : 'Upload New Report'}
                    </h4>

                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
                        dragOver
                          ? "border-indigo-500 bg-indigo-500/[0.06]"
                          : "border-white/[0.08] hover:border-indigo-500/30 bg-white/[0.02]"
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadReport(file);
                          e.target.value = '';
                        }}
                      />
                      <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all", dragOver ? "bg-indigo-500/20" : "bg-zinc-800/50")}>
                        {uploadingReport ? (
                          <Loader2 size={22} className="text-indigo-400 animate-spin" />
                        ) : (
                          <Upload size={22} className={dragOver ? "text-indigo-400" : "text-zinc-600"} />
                        )}
                      </div>
                      <p className={cn("text-[12px] font-medium", dragOver ? "text-indigo-400" : "text-zinc-400")}>
                        {uploadingReport
                          ? (isRTL ? 'جاري الرفع...' : 'Uploading...')
                          : (isRTL ? 'اسحب الملف هنا أو اضغط للاختيار' : 'Drop file here or click to browse')}
                      </p>
                      <p className="text-zinc-600 text-[10px] mt-1">{isRTL ? 'PNG, JPG, PDF - حد أقصى 10MB' : 'PNG, JPG, PDF - Max 10MB'}</p>
                    </div>

                    <div className="mt-3">
                      <input
                        value={reportTitle}
                        onChange={e => setReportTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-[11px] placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30"
                        placeholder={isRTL ? 'عنوان التقرير (اختياري)' : 'Report title (optional)'}
                      />
                    </div>
                  </div>
                )}

                {/* Doctor sees uploads too */}
                {isDoctor && sessionReports.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 mx-auto mb-4 flex items-center justify-center">
                      <FileBarChart size={28} className="text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-[12px] font-medium">{isRTL ? 'لا توجد تقارير بعد' : 'No reports yet'}</p>
                    <p className="text-zinc-600 text-[10px] mt-1">{isRTL ? 'بمجرد أن يرفع المريض الأشعة أو التحاليل ستظهر هنا' : 'Once the patient uploads X-rays or analyses, they will appear here'}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
