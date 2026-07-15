'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { Pill, Plus, Trash2, Save, ArrowLeft, Activity, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function NewPrescriptionPage() {
  const { id, locale } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAr = locale === 'ar';

  const [diagnosisAr, setDiagnosisAr] = useState('');
  const [diagnosisEn, setDiagnosisEn] = useState('');
  const [instructionsAr, setInstructionsAr] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', notes: '' }]);

  useEffect(() => {
    if (token && id) {
      api.get<any>(`/appointments/${id}`, token)
        .then(setAppointment)
        .catch(() => toast.error(isAr ? 'فشل في تحميل الموعد' : 'Failed to load appointment'))
        .finally(() => setLoading(false));
    }
  }, [token, id, isAr]);

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

      toast.success(isAr ? 'تم إصدار الروشتة بنجاح' : 'Prescription issued successfully');
      router.push(`/${locale}/admin/appointments`);
    } catch (err) {
      toast.error(isAr ? 'فشل في إصدار الروشتة' : 'Failed to issue prescription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link href="/admin/appointments">
            <button className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/35 hover:text-indigo-500 transition-all">
              <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAr ? 'إصدار روشتة جديدة' : 'Issue New Prescription'}
            </h1>
            <p className="text-[12px] text-slate-500 dark:text-white/35 mt-0.5">
              {isAr ? 'للمريض: ' : 'For Patient: '}
              <span className="text-slate-900 dark:text-white font-semibold">{appointment?.patient?.name || appointment?.guestName}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="h-10 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30"
        >
          <Save size={16} />
          {isAr ? 'إصدار وحفظ الروشتة' : 'Issue & Save'}
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Diagnosis Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5"
              dir="ltr"
            >
              <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Activity size={12} className="text-indigo-500" />
                Diagnosis (EN)
              </label>
              <textarea
                placeholder="Enter clinical diagnosis..."
                value={diagnosisEn}
                onChange={(e) => setDiagnosisEn(e.target.value)}
                className="w-full min-h-[100px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.08 }}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5"
              dir="rtl"
            >
              <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Activity size={12} className="text-indigo-500" />
                {isAr ? 'التشخيص (عربي)' : 'Diagnosis (AR)'}
              </label>
              <textarea
                placeholder={isAr ? 'أدخل التشخيص الطبي...' : 'Enter clinical diagnosis in Arabic...'}
                value={diagnosisAr}
                onChange={(e) => setDiagnosisAr(e.target.value)}
                className="w-full min-h-[100px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none text-right"
              />
            </motion.div>
          </div>

          {/* Medications Section */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Pill size={16} />
                </div>
                {isAr ? 'الأدوية والعلاج' : 'Medications & Treatments'}
              </h3>
              <button
                onClick={addMedication}
                className="h-8 px-3.5 rounded-xl border border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10 text-[12px] font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                {isAr ? 'إضافة دواء' : 'Add'}
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25">
                      {isAr ? 'اسم الدواء' : 'Name'}
                    </label>
                    <input
                      placeholder={isAr ? 'اسم الدواء' : 'Medication'}
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25">
                      {isAr ? 'الجرعة' : 'Dosage'}
                    </label>
                    <input
                      placeholder={isAr ? 'الجرعة' : 'Dosage'}
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25">
                      {isAr ? 'المدة' : 'Duration'}
                    </label>
                    <input
                      placeholder={isAr ? 'المدة' : 'Duration'}
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25">
                        {isAr ? 'ملاحظات' : 'Notes'}
                      </label>
                      <input
                        placeholder={isAr ? 'ملاحظات' : 'Notes'}
                        value={med.notes}
                        onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => removeMedication(index)}
                      className="w-9 h-9 rounded-xl border border-slate-200/60 dark:border-white/5 text-slate-400 dark:text-white/25 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 flex items-center justify-center transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Instructions Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.12 }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5"
            dir="ltr"
          >
            <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">
              Patient Instructions (EN)
            </label>
            <textarea
              placeholder="English instructions..."
              value={instructionsEn}
              onChange={(e) => setInstructionsEn(e.target.value)}
              className="w-full min-h-[130px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5"
            dir="rtl"
          >
            <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">
              {isAr ? 'تعليمات المريض' : 'Patient Instructions (AR)'}
            </label>
            <textarea
              placeholder={isAr ? 'أدخل التعليمات بالعربية...' : 'Enter instructions in Arabic...'}
              value={instructionsAr}
              onChange={(e) => setInstructionsAr(e.target.value)}
              className="w-full min-h-[130px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none text-right"
            />
          </motion.div>

          {/* Tip Card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.18 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 text-white"
          >
            <h4 className="text-[13px] font-bold mb-1.5">
              {isAr ? 'الروشتة جاهزة؟' : 'Prescription Ready?'}
            </h4>
            <p className="text-[12px] text-white/75 leading-relaxed">
              {isAr
                ? 'تأكد من الأدوية والجرعات قبل الإصدار. بمجرد الحفظ، يمكن طباعتها أو إرسالها للمريض.'
                : 'Double check the medications and dosages before issuing. Once saved, it can be printed or sent to the patient.'}
            </p>
            <div className="mt-4 flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-white/10 border border-white/10">
              <FileText size={14} />
              <span className="text-[11px] font-semibold">
                {isAr ? 'نظام المسودة v1.2' : 'Draft System v1.2'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
