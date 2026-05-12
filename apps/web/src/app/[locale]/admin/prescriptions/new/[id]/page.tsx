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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/appointments">
            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black">New Prescription</h1>
            <p className="text-sm text-[var(--muted)] font-medium">For: {appointment?.patient?.name || appointment?.guestName}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} className="rounded-2xl gap-2 px-8 font-bold">
          <Save size={18} />
          Issue Prescription
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Pill size={18} className="text-[var(--primary)]" />
            Diagnosis (English)
          </h3>
          <Textarea 
            placeholder="Enter diagnosis in English..." 
            value={diagnosisEn}
            onChange={(e) => setDiagnosisEn(e.target.value)}
            className="min-h-[100px] rounded-2xl"
          />
        </Card>
        <Card className="p-6 space-y-4" dir="rtl">
          <h3 className="font-bold flex items-center gap-2">
            <Pill size={18} className="text-[var(--primary)]" />
            التشخيص (بالعربية)
          </h3>
          <Textarea 
            placeholder="أدخل التشخيص بالعربية..." 
            value={diagnosisAr}
            onChange={(e) => setDiagnosisAr(e.target.value)}
            className="min-h-[100px] rounded-2xl text-right"
          />
        </Card>
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Pill size={20} className="text-[var(--primary)]" />
            Medications & Treatment
          </h3>
          <Button variant="outline" size="sm" onClick={addMedication} className="rounded-xl gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5">
            <Plus size={16} /> Add Medication
          </Button>
        </div>

        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] relative group">
              <Input 
                placeholder="Medication Name" 
                value={med.name} 
                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                className="rounded-xl"
              />
              <Input 
                placeholder="Dosage (e.g. 1x3)" 
                value={med.dosage} 
                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                className="rounded-xl"
              />
              <Input 
                placeholder="Duration (e.g. 7 days)" 
                value={med.duration} 
                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                className="rounded-xl"
              />
              <div className="flex gap-2">
                <Input 
                  placeholder="Notes" 
                  value={med.notes} 
                  onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                  className="rounded-xl flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeMedication(index)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold">Instructions (English)</h3>
          <Textarea 
            placeholder="Patient instructions..." 
            value={instructionsEn}
            onChange={(e) => setInstructionsEn(e.target.value)}
            className="rounded-2xl"
          />
        </Card>
        <Card className="p-6 space-y-4" dir="rtl">
          <h3 className="font-bold text-right">تعليمات للمريض (بالعربية)</h3>
          <Textarea 
            placeholder="تعليمات للمريض..." 
            value={instructionsAr}
            onChange={(e) => setInstructionsAr(e.target.value)}
            className="rounded-2xl text-right"
          />
        </Card>
      </div>
    </div>
  );
}
