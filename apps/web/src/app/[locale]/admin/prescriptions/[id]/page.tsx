'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { Printer, Download, ArrowLeft, Pill, Activity, Calendar, User as UserIcon, Phone, MapPin } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  if (loading) return (
    <div className="flex items-center justify-center py-40">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!prescription) return <div className="text-center py-20">Prescription not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      
      {/* Actions (Non-printable) */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => window.history.back()} className="gap-2 rounded-xl">
           <ArrowLeft size={18} /> العودة
        </Button>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => window.print()} className="gap-2 rounded-xl border-primary text-primary hover:bg-primary/5">
              <Printer size={18} /> طباعة الروشتة
           </Button>
           <Button className="gap-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Download size={18} /> تحميل PDF
           </Button>
        </div>
      </div>

      {/* Prescription Paper */}
      <Card className="relative p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[2.5rem] print:shadow-none print:rounded-none">
         
         {/* Medical Header */}
         <div className="p-10 bg-[#f8fafc] border-b-2 border-primary/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="text-center md:text-right relative z-10">
               <h1 className="text-2xl font-black text-primary mb-1">الأستاذ الدكتور أحمد عبد اللطيف</h1>
               <p className="text-sm font-bold text-gray-600">أستاذ واستشاري جراحة المسالك البولية والكلى</p>
               <p className="text-xs font-bold text-gray-500 mt-1">دكتوراه جراحة المسالك البولية والمناظير والذكورة</p>
            </div>

            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-gray-100 p-2">
               <img src="/logo-medical.png" alt="Medical Logo" className="w-full h-full object-contain grayscale opacity-50" onError={(e) => (e.currentTarget.style.display = 'none')} />
               <Activity size={40} className="text-primary/20" />
            </div>

            <div className="text-center md:text-left relative z-10" dir="ltr">
               <h1 className="text-xl font-black text-primary mb-1">Dr. Ahmed Abdellatif</h1>
               <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Professor of Urology Surgery</p>
               <p className="text-[10px] font-bold text-gray-500 mt-1">MD, Urology & Andrology Specialist</p>
            </div>
         </div>

         {/* Patient Info Strip */}
         <div className="px-10 py-6 bg-primary/5 border-b border-primary/10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">اسم المريض / Patient</p>
               <p className="text-sm font-black text-gray-800">{prescription.patient?.name}</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">التاريخ / Date</p>
               <p className="text-sm font-black text-gray-800">{new Date(prescription.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">السن / Age</p>
               <p className="text-sm font-black text-gray-800">--</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">كود الروشتة</p>
               <p className="text-sm font-black text-primary">#{prescription.id.slice(-6).toUpperCase()}</p>
            </div>
         </div>

         {/* Main Content (Rx) */}
         <div className="p-10 min-h-[500px] relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
               <Activity size={300} />
            </div>

            <div className="relative z-10 space-y-12">
               
               {/* Diagnosis */}
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" /> Diagnosis
                     </h4>
                     <p className="text-lg font-bold text-gray-800 leading-relaxed italic">{prescription.diagnosisEn || 'N/A'}</p>
                  </div>
                  <div className="space-y-3 text-right" dir="rtl">
                     <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 justify-end">
                        التشخيص الطبي <div className="w-1 h-1 rounded-full bg-primary" />
                     </h4>
                     <p className="text-lg font-black text-gray-800 leading-relaxed">{prescription.diagnosisAr || 'غير محدد'}</p>
                  </div>
               </div>

               {/* Rx Mark */}
               <div className="text-5xl font-serif text-primary/40 select-none">Rx</div>

               {/* Medications List */}
               <div className="space-y-6">
                  {prescription.medications?.map((med: any, i: number) => (
                     <div key={i} className="flex items-start gap-4 pb-4 border-b border-dashed border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-primary/20 mt-2 shrink-0" />
                        <div className="flex-1">
                           <p className="text-xl font-black text-gray-900">{med.name}</p>
                           <div className="flex gap-6 mt-2">
                              <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">Dosage: {med.dosage}</span>
                              <span className="text-sm font-bold text-gray-500">Duration: {med.duration}</span>
                           </div>
                           {med.notes && <p className="text-xs text-gray-400 mt-2 font-medium italic">Note: {med.notes}</p>}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Instructions */}
               {(prescription.instructionsAr || prescription.instructionsEn) && (
                  <div className="pt-10 space-y-6">
                     <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">تعليمات إضافية / Extra Instructions</h4>
                     <div className="grid md:grid-cols-2 gap-10">
                        <p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">{prescription.instructionsEn}</p>
                        <p className="text-sm font-black text-gray-800 leading-relaxed text-right bg-primary/5 p-6 rounded-2xl border border-primary/10" dir="rtl">{prescription.instructionsAr}</p>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Footer / Contact */}
         <div className="p-10 border-t-2 border-primary/20 flex flex-col md:flex-row justify-between items-end gap-6 bg-[#f8fafc]">
            <div className="space-y-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-primary" /> القاهرة: التجمع الخامس، ميديكال بارك
               </div>
               <div className="flex items-center gap-2">
                  <Phone size={12} className="text-primary" /> +20 100 151 6882
               </div>
            </div>

            <div className="text-center">
               <div className="w-24 h-24 bg-white border border-gray-100 p-2 rounded-xl shadow-inner mb-2 mx-auto">
                  {/* Mock QR Code */}
                  <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=prescription-verified')] bg-cover opacity-30" />
               </div>
               <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Verified Digital Prescription</p>
            </div>

            <div className="text-right border-t border-gray-200 pt-4 min-w-[200px]">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">توقيع الطبيب / Signature</p>
               <div className="h-12 w-32 border-b border-gray-300 ml-auto" />
            </div>
         </div>

      </Card>

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
