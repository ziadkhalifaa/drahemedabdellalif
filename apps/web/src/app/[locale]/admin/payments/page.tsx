'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { appointmentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, CheckCircle, XCircle, Loader2,
  Eye, Phone, Calendar, Clock, Building2, AlertCircle, Image
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  PENDING_REVIEW: { ar: 'في الانتظار', en: 'Pending Review', color: 'orange' },
  CONFIRMED:      { ar: 'مؤكد',        en: 'Confirmed',      color: 'emerald' },
  REJECTED:       { ar: 'مرفوض',       en: 'Rejected',       color: 'red' },
  NOT_REQUIRED:   { ar: 'غير مطلوب',   en: 'Not Required',   color: 'gray' },
};

const METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  VODAFONE_CASH: { ar: 'فودافون كاش', en: 'Vodafone Cash' },
  INSTAPAY:      { ar: 'انستا باي',   en: 'InstaPay' },
  PAYMOB:        { ar: 'Paymob',      en: 'Paymob' },
  CASH:          { ar: 'كاش',         en: 'Cash' },
  NONE:          { ar: '—',           en: '—' },
};

function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-lg w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80">
          <XCircle size={16} />
        </button>
        <img src={url} alt="Payment Proof" className="w-full max-h-[80vh] object-contain" />
      </motion.div>
    </div>
  );
}

function AppointmentPaymentCard({ apt, onAction }: { apt: any; onAction: () => void }) {
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
      toast.success(action === 'confirm' ? '✅ تم تأكيد الدفع والحجز' : '❌ تم رفض الدفع');
      onAction();
    } catch {
      toast.error('فشل تنفيذ الإجراء');
    } finally {
      setActing(false);
    }
  };

  const status = STATUS_LABELS[apt.paymentStatus] || STATUS_LABELS.NOT_REQUIRED;
  const method = METHOD_LABELS[apt.paymentMethod] || METHOD_LABELS.NONE;
  const patientName = apt.guestName || apt.patient?.name || '—';
  const patientPhone = apt.guestPhone || apt.patient?.phone;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-bold">{patientName}</p>
          {patientPhone && (
            <a href={`tel:${patientPhone}`} className="flex items-center gap-1 text-xs text-muted-foreground mt-1 hover:text-primary">
              <Phone size={11} /> <span dir="ltr">{patientPhone}</span>
            </a>
          )}
        </div>
        <span className={cn(
          'px-2 py-1 rounded-lg text-xs font-bold',
          status.color === 'orange'  && 'bg-orange-500/20 text-orange-400',
          status.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
          status.color === 'red'     && 'bg-red-500/20 text-red-400',
          status.color === 'gray'    && 'bg-white/10 text-white/50',
        )}>
          {isRTL ? status.ar : status.en}
        </span>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-primary" />
          {new Date(apt.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB')}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-primary" />
          {apt.timeSlot}
        </div>
        {apt.clinic && (
          <div className="flex items-center gap-2 col-span-2">
            <Building2 size={12} className="text-primary" />
            {isRTL ? apt.clinic.nameAr : apt.clinic.nameEn}
          </div>
        )}
        <div className="flex items-center gap-2 col-span-2">
          <CreditCard size={12} className="text-primary" />
          {isRTL ? method.ar : method.en}
          {apt.paymentSenderNum && (
            <span className="font-mono text-white/70 ms-1" dir="ltr">{apt.paymentSenderNum}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {apt.paymentStatus === 'PENDING_REVIEW' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {apt.paymentProofUrl && (
              <button
                onClick={() => setShowProof(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors"
              >
                <Image size={12} />
                {isRTL ? 'عرض الإثبات' : 'View Proof'}
              </button>
            )}
            <button
              onClick={() => setShowNote(s => !s)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
            >
              {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
            </button>
          </div>

          <AnimatePresence>
            {showNote && (
              <motion.textarea
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder={isRTL ? 'ملاحظة على الدفع...' : 'Payment note...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground resize-none"
                rows={2}
              />
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <button
              onClick={() => handleAction('confirm')}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              {acting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {isRTL ? 'تأكيد الدفع والحجز' : 'Confirm Payment'}
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <XCircle size={14} />
              {isRTL ? 'رفض الدفع' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {showProof && apt.paymentProofUrl && (
        <ProofModal url={apt.paymentProofUrl} onClose={() => setShowProof(false)} />
      )}
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
      const data = await appointmentsApi.getAll(
        { paymentStatus: filter, limit: 50 },
        token
      );
      setAppointments(data.data || []);
    } catch {
      toast.error('فشل التحميل');
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const paymentApts = appointments.filter(a => a.paymentMethod && a.paymentMethod !== 'NONE' && a.paymentMethod !== 'CASH');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
          <CreditCard className="text-orange-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            {isRTL ? 'مراجعة المدفوعات' : 'Payment Review'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'InstaPay وفودافون كاش' : 'InstaPay & Vodafone Cash'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
        {[
          { key: 'PENDING_REVIEW', ar: 'في الانتظار', en: 'Pending' },
          { key: 'CONFIRMED',      ar: 'مؤكدة',       en: 'Confirmed' },
          { key: 'REJECTED',       ar: 'مرفوضة',      en: 'Rejected' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
              filter === f.key ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isRTL ? f.ar : f.en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : paymentApts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">{isRTL ? 'لا توجد مدفوعات' : 'No payments found'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paymentApts.map(apt => (
            <AppointmentPaymentCard key={apt.id} apt={apt} onAction={load} />
          ))}
        </div>
      )}
    </div>
  );
}
