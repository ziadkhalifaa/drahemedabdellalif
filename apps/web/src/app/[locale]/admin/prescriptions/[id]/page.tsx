'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { Printer, ArrowLeft, Activity, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && id) {
      api.get<any>(`/prescriptions/${id}`, token)
        .then(setPrescription)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-20 text-[13px] font-semibold text-slate-500 dark:text-white/35">
        Prescription not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* Actions (Non-printable) */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex items-center justify-between print:hidden"
      >
        <button
          onClick={() => window.history.back()}
          className="h-10 px-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-white/35 hover:text-indigo-500 text-[13px] font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          العودة
        </button>
        <button
          onClick={() => window.print()}
          className="h-10 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200"
        >
          <Printer size={16} />
          طباعة الروشتة
        </button>
      </motion.div>

      {/* Prescription Paper */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.05 }}
        className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-lg print:shadow-none print:rounded-none print:border-none"
      >
        {/* Medical Header */}
        <div className="px-8 py-6 border-b-2 border-indigo-500/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/80">
          <div className="text-center md:text-right">
            <h1 className="text-xl font-bold text-indigo-500 mb-0.5">الأستاذ الدكتور أحمد عبد اللطيف</h1>
            <p className="text-[13px] font-semibold text-slate-600">أستاذ واستشاري جراحة المسالك البولية والكلى</p>
            <p className="text-[12px] text-slate-400 mt-0.5">دكتوراه جراحة المسالك البولية والمناظير والذكورة</p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200/60 p-2">
            <img src="/logo-medical.png" alt="Medical Logo" className="w-full h-full object-contain grayscale opacity-40" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <Activity size={28} className="text-indigo-500/20" />
          </div>

          <div className="text-center md:text-left" dir="ltr">
            <h1 className="text-lg font-bold text-indigo-500 mb-0.5">Dr. Ahmed Abdellatif</h1>
            <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider">Professor of Urology Surgery</p>
            <p className="text-[11px] text-slate-400 mt-0.5">MD, Urology & Andrology Specialist</p>
          </div>
        </div>

        {/* Patient Info Strip */}
        <div className="px-8 py-4 bg-indigo-500/[0.03] border-b border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-0.5">اسم المريض / Patient</p>
            <p className="text-[13px] font-bold text-slate-900">{prescription.patient?.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-0.5">التاريخ / Date</p>
            <p className="text-[13px] font-bold text-slate-900">{new Date(prescription.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-0.5">السن / Age</p>
            <p className="text-[13px] font-bold text-slate-900">--</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-0.5">كود الروشتة</p>
            <p className="text-[13px] font-bold text-indigo-500">#{prescription.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* Main Content (Rx) */}
        <div className="px-8 py-8 min-h-[400px] relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <Activity size={280} />
          </div>

          <div className="relative z-10 space-y-8">

            {/* Diagnosis */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Diagnosis</h4>
                <p className="text-[15px] font-bold text-slate-900 leading-relaxed">{prescription.diagnosisEn || 'N/A'}</p>
              </div>
              <div className="space-y-2 text-right" dir="rtl">
                <h4 className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">التشخيص الطبي</h4>
                <p className="text-[15px] font-bold text-slate-900 leading-relaxed">{prescription.diagnosisAr || 'غير محدد'}</p>
              </div>
            </div>

            {/* Rx Mark */}
            <div className="text-4xl font-serif text-indigo-500/20 select-none">Rx</div>

            {/* Medications List */}
            <div className="space-y-4">
              {prescription.medications?.map((med: any, i: number) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-dashed border-slate-200/60 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500/20 mt-2 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-slate-900">{med.name}</p>
                    <div className="flex gap-4 mt-1.5">
                      <span className="text-[12px] font-semibold text-indigo-500 bg-indigo-500/5 px-2.5 py-0.5 rounded-lg">Dosage: {med.dosage}</span>
                      <span className="text-[12px] font-semibold text-slate-500">Duration: {med.duration}</span>
                    </div>
                    {med.notes && <p className="text-[12px] text-slate-400 mt-1.5 italic">Note: {med.notes}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            {(prescription.instructionsAr || prescription.instructionsEn) && (
              <div className="pt-6 space-y-4">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">تعليمات إضافية / Extra Instructions</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">{prescription.instructionsEn}</p>
                  <p className="text-[13px] font-semibold text-slate-900 leading-relaxed text-right bg-indigo-500/[0.03] p-4 rounded-xl border border-indigo-500/10" dir="rtl">{prescription.instructionsAr}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Contact */}
        <div className="px-8 py-5 border-t-2 border-indigo-500/10 flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-50/80">
          <div className="space-y-1.5 text-slate-400 text-[11px] font-semibold">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-indigo-500" /> القاهرة: التجمع الخامس، ميديكال بارك
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-indigo-500" /> +20 100 151 6882
            </div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-white border border-slate-200/60 p-1.5 rounded-xl mb-1.5 mx-auto">
              <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=prescription-verified')] bg-cover opacity-25" />
            </div>
            <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-widest">Verified Digital Prescription</p>
          </div>

          <div className="text-right min-w-[180px]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">توقيع الطبيب / Signature</p>
            <div className="h-10 w-28 border-b border-slate-300 ml-auto" />
          </div>
        </div>
      </motion.div>

      {/* Custom Styles for Printing */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          nav, aside, header, footer, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
