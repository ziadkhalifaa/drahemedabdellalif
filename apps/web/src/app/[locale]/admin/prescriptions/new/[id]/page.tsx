'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { Pill, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';

export default function NewPrescriptionPage() {
  const { id, locale } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [diagnosisAr, setDiagnosisAr] = useState('');
  const [diagnosisEn, setDiagnosisEn] = useState('');
  const [instructionsAr, setInstructionsAr] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', notes: '' }]);

  useEffect(() => {
    if (token && id) {
      api.get<any>(`/appointments/${id}`, token)
        .then(setAppointment)
        .catch(() => toast.error('Failed to load appointment'))
        .finally(() => setLoading(false));
    }
  }, [token, id]);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', duration: '', notes: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    (newMeds[index] as any)[field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async () => {
    if (!token || !appointment) return;
    
    try {
      await api.post('/prescriptions', {
        appointmentId: id,
        patientId: appointment.patientId,
        diagnosisAr,
        diagnosisEn,
        instructionsAr,
        instructionsEn,
        medications,
      }, token);
      
      toast.success('Prescription issued successfully');
      router.push(`/${locale}/admin/appointments`);
    } catch (err) {
      toast.error('Failed to issue prescription');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link href="/admin/appointments">
            <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border-white/20 hover:bg-primary hover:text-white transition-all duration-300">
              <ArrowLeft size={24} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">إصدار روشتة جديدة</h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest opacity-70">
                 للمريض: <span className="text-[var(--foreground)]">{appointment?.patient?.name || appointment?.guestName}</span>
               </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-3 group transition-all duration-500 hover:-translate-y-1"
        >
          <Save size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-black uppercase tracking-widest text-xs">إصدار وحفظ الروشتة</span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Diagnosis Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5">
              <h3 className="text-sm font-black flex items-center gap-3 mb-6 uppercase tracking-widest">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Activity size={16} />
                </div>
                Diagnosis (EN)
              </h3>
              <Textarea 
                placeholder="Enter clinical diagnosis..." 
                value={diagnosisEn}
                onChange={(e) => setDiagnosisEn(e.target.value)}
                className="min-h-[120px] rounded-2xl bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-sm"
              />
            </Card>
            <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5" dir="rtl">
              <h3 className="text-sm font-black flex items-center gap-3 mb-6 uppercase tracking-widest">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Activity size={16} />
                </div>
                التشخيص (عربي)
              </h3>
              <Textarea 
                placeholder="أدخل التشخيص الطبي..." 
                value={diagnosisAr}
                onChange={(e) => setDiagnosisAr(e.target.value)}
                className="min-h-[120px] rounded-2xl bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-sm text-right"
              />
            </Card>
          </div>

          {/* Medications Section */}
          <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-black flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Pill size={20} />
                </div>
                الأدوية والعلاج
              </h3>
              <Button variant="outline" size="sm" onClick={addMedication} className="h-10 px-5 rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-white transition-all gap-2">
                <Plus size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">إضافة دواء</span>
              </Button>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all group relative">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">اسم الدواء</label>
                    <Input 
                      placeholder="Medication" 
                      value={med.name} 
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="rounded-xl border-transparent focus:bg-white dark:focus:bg-white/10 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">الجرعة</label>
                    <Input 
                      placeholder="Dosage" 
                      value={med.dosage} 
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="rounded-xl border-transparent focus:bg-white dark:focus:bg-white/10 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">المدة</label>
                    <Input 
                      placeholder="Duration" 
                      value={med.duration} 
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="rounded-xl border-transparent focus:bg-white dark:focus:bg-white/10 font-bold"
                    />
                  </div>
                  <div className="space-y-2 flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">ملاحظات</label>
                      <Input 
                        placeholder="Notes" 
                        value={med.notes} 
                        onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                        className="rounded-xl border-transparent focus:bg-white dark:focus:bg-white/10 font-bold"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeMedication(index)}
                      className="w-10 h-10 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Instructions Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5">
              <h3 className="text-sm font-black flex items-center gap-3 mb-6 uppercase tracking-widest">
                 Patient Instructions
              </h3>
              <Textarea 
                placeholder="English instructions..." 
                value={instructionsEn}
                onChange={(e) => setInstructionsEn(e.target.value)}
                className="min-h-[150px] rounded-2xl bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-sm"
              />
           </Card>

           <Card className="p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl shadow-black/5" dir="rtl">
              <h3 className="text-sm font-black flex items-center gap-3 mb-6 uppercase tracking-widest">
                 تعليمات المريض
              </h3>
              <Textarea 
                placeholder="أدخل التعليمات بالعربية..." 
                value={instructionsAr}
                onChange={(e) => setInstructionsAr(e.target.value)}
                className="min-h-[150px] rounded-2xl bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-sm text-right"
              />
           </Card>

           {/* Preview Card */}
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/20">
              <h4 className="font-black text-lg mb-2">Prescription Ready?</h4>
              <p className="text-xs font-bold opacity-80 leading-relaxed mb-6">
                Double check the medications and dosages before issuing. Once saved, it can be printed or sent to the patient.
              </p>
              <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <FileText size={16} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Draft System v1.2</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
