'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { appointmentsApi } from '@/lib/api';
import { cn, formatTime12Hour } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Loader2, Eye, Phone, Calendar, Clock, Building2, AlertCircle, Image } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  PENDING_REVIEW: { ar: 'في الانتظار', en: 'Pending Review', color: 'amber' },
  CONFIRMED: { ar: 'مؤكد', en: 'Confirmed', color: 'emerald' },
  REJECTED: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  NOT_REQUIRED: { ar: 'غير مطلوب', en: 'Not Required', color: 'slate' },
};

const METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  VODAFONE_CASH: { ar: 'فودافون كاش', en: 'Vodafone Cash' },
  INSTAPAY: { ar: 'انستا باي', en: 'InstaPay' },
  PAYMOB: { ar: 'Paymob', en: 'Paymob' },
  CASH: { ar: 'كاش', en: 'Cash' },
  NONE: { ar: '—', en: '—' },
};

function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-lg w-full rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"><XCircle size={16} /></button>
        <img src={url} alt="Payment Proof" className="w-full max-h-[80vh] object-contain" />
      </motion.div>
    </div>
  );
}

function AppointmentPaymentCard({ apt, onAction }: { apt: any; onAction: (id: string, newStatus: string) => void }) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [acting, setActing] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [showProof, setShowProof] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const handleAction = async (action: 'confirm' | 'reject') => {
    setActing(true);
    try {
      await appointmentsApi.confirmPayment(apt.id, action, adminNote || undefined, token!);
      toast.success(action === 'confirm' ? (isRTL ? 'تم تأكيد الدفع والحجز' : 'Payment & booking confirmed') : (isRTL ? 'تم رفض الدفع' : 'Payment rejected'));
      onAction(apt.id, action === 'confirm' ? 'CONFIRMED' : 'REJECTED');
    } catch { toast.error(isRTL ? 'فشل تنفيذ الإجراء' : 'Action failed'); } finally { setActing(false); }
  };

  const status = STATUS_LABELS[apt.paymentStatus] || STATUS_LABELS.NOT_REQUIRED;
  const method = METHOD_LABELS[apt.paymentMethod] || METHOD_LABELS.NONE;
  const patientName = apt.guestName || apt.patient?.name || '—';
  const patientPhone = apt.guestPhone || apt.patient?.phone;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] p-5 space-y-4 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-900 dark:text-white font-bold text-[13px]">{patientName}</p>
          {patientPhone && <a href={`tel:${patientPhone}`} className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 hover:text-indigo-500 transition-colors"><Phone size={11} /> <span dir="ltr">{patientPhone}</span></a>}
        </div>
        <span className={cn(
          'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
          status.color === 'amber' && 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
          status.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          status.color === 'red' && 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
          status.color === 'slate' && 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40',
        )}>{isRTL ? status.ar : status.en}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 dark:text-white/40">
        <div className="flex items-center gap-2"><Calendar size={12} className="text-indigo-500" />{new Date(apt.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB')}</div>
        <div className="flex items-center gap-2"><Clock size={12} className="text-indigo-500" />{formatTime12Hour(apt.timeSlot, isRTL)}</div>
        {apt.clinic && <div className="flex items-center gap-2 col-span-2"><Building2 size={12} className="text-indigo-500" />{isRTL ? apt.clinic.nameAr : apt.clinic.nameEn}</div>}
        <div className="flex items-center gap-2 col-span-2"><CreditCard size={12} className="text-indigo-500" />{isRTL ? method.ar : method.en}{apt.paymentSenderNum && <span className="font-mono text-slate-700 dark:text-white/70 ms-1" dir="ltr">{apt.paymentSenderNum}</span>}</div>
        {apt.type === 'IN_CLINIC' && apt.depositAmount && (
          <div className="col-span-2 flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3 py-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[12px]">{isRTL ? 'العربون المدفوع' : 'Deposit Paid'}</span>
            <div className="text-right"><span className="text-emerald-600 dark:text-emerald-400 font-bold">{apt.depositAmount} {isRTL ? 'ج' : 'EGP'}</span><span className="text-slate-400 mx-1">/</span><span className="text-slate-500 dark:text-white/50">{isRTL ? '400 ج' : '400 EGP'}</span></div>
          </div>
        )}
      </div>

      {apt.paymentStatus === 'PENDING_REVIEW' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {apt.paymentProofUrl && <button onClick={() => setShowProof(true)} className="flex items-center gap-2 px-3 py-2 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl text-[11px] font-bold hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"><Image size={12} />{isRTL ? 'عرض الإثبات' : 'View Proof'}</button>}
            <button onClick={() => setShowNote(s => !s)} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 rounded-xl text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">{isRTL ? 'ملاحظة' : 'Note'}</button>
          </div>
          <AnimatePresence>
            {showNote && <motion.textarea initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder={isRTL ? 'ملاحظة على الدفع...' : 'Payment note...'} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" rows={2} />}
          </AnimatePresence>
          <div className="flex gap-2">
            <button onClick={() => handleAction('confirm')} disabled={acting} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50">
              {acting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}{isRTL ? 'تأكيد الدفع' : 'Confirm'}
            </button>
            <button onClick={() => handleAction('reject')} disabled={acting} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl text-[12px] font-bold hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50">
              <XCircle size={14} />{isRTL ? 'رفض' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {showProof && apt.paymentProofUrl && <ProofModal url={apt.paymentProofUrl} onClose={() => setShowProof(false)} />}
    </motion.div>
  );
}

export default function AdminPaymentsPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await appointmentsApi.getAll({ paymentStatus: filter, limit: 50 }, token);
      setAppointments(data.data || []);
    } catch { toast.error(isRTL ? 'فشل التحميل' : 'Failed to load'); } finally { setLoading(false); }
  }, [token, filter, isRTL]);

  useEffect(() => { load(); }, [load]);

  const paymentApts = appointments.filter(a => a.paymentMethod && a.paymentMethod !== 'NONE' && a.paymentMethod !== 'CASH');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
          <CreditCard className="text-amber-600 dark:text-amber-400" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{isRTL ? 'مراجعة المدفوعات' : 'Payment Review'}</h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">{isRTL ? 'InstaPay وفودافون كاش' : 'InstaPay & Vodafone Cash'}</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-white/5">
        {[
          { key: 'PENDING_REVIEW', ar: 'في الانتظار', en: 'Pending' },
          { key: 'CONFIRMED', ar: 'مؤكدة', en: 'Confirmed' },
          { key: 'REJECTED', ar: 'مرفوضة', en: 'Rejected' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('flex-1 py-2.5 rounded-lg text-[12px] font-bold transition-all',
            filter === f.key ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/50')}>
            {isRTL ? f.ar : f.en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/10 rounded-xl" />
            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-xl animate-spin" />
          </div>
        </div>
      ) : paymentApts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5">
          <AlertCircle size={40} className="mx-auto mb-4 text-slate-300 dark:text-white/15" />
          <p className="font-medium text-slate-400 dark:text-white/30">{isRTL ? 'لا توجد مدفوعات' : 'No payments found'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paymentApts.map(apt => (
            <AppointmentPaymentCard key={apt.id} apt={apt} onAction={(id, newStatus) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, paymentStatus: newStatus } : a))} />
          ))}
        </div>
      )}
    </div>
  );
}
