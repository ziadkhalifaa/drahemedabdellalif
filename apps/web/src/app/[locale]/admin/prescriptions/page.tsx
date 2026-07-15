'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { FileText, Plus, Search, Eye, Calendar, User as UserIcon, Activity, Pill, Printer } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function PrescriptionsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchPrescriptions = useCallback(async (attempt = 1) => {
    if (!token) return;
    try {
      setLoading(attempt === 1);
      const data = await api.get<any[]>('/prescriptions', token);
      setPrescriptions(data);
      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch prescriptions (attempt ${attempt}):`, error);
      if (attempt < 2) {
        setTimeout(() => fetchPrescriptions(attempt + 1), 1500);
      } else {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosisAr?.includes(search) ||
    p.diagnosisEn?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: prescriptions.length,
    thisMonth: prescriptions.filter(p => {
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {isRTL ? 'الوصفات الطبية' : 'Prescriptions'}
            <span className="text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg">
              {counts.total}
            </span>
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">
            {isRTL ? 'إدارة وطباعة الوصفات الطبية للمرضى' : 'Manage and print patient prescriptions'}
          </p>
        </div>
        <Link href="/admin/appointments">
          <button className="h-10 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30">
            <Plus size={16} />
            {isRTL ? 'وصفة جديدة' : 'New Prescription'}
          </button>
        </Link>
      </motion.div>

      {/* Search + Stats */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25", isRTL ? "right-3" : "left-3")} size={15} />
          <input type="text" placeholder={isRTL ? 'بحث باسم المريض، التشخيص، أو الإيميل...' : 'Search by patient name, diagnosis, or email...'}
            className={cn("w-full py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all", isRTL ? "pr-9 pl-4" : "pl-9 pr-4")}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-white/35">
          <span className="flex items-center gap-1.5"><Pill size={12} className="text-indigo-500" /> {counts.thisMonth} {isRTL ? 'هذا الشهر' : 'this month'}</span>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5">
          <div className="relative w-10 h-10 mb-3">
            <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/10 rounded-xl" />
            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-xl animate-spin" />
          </div>
          <p className="text-[13px] text-slate-400 dark:text-white/30">{isRTL ? 'جاري جلب البيانات...' : 'Loading...'}</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/25 mb-4">
            <FileText size={28} />
          </div>
          <p className="text-[14px] font-bold text-slate-700 dark:text-white/60">
            {search ? (isRTL ? 'لا توجد نتائج' : 'No results') : (isRTL ? 'لا توجد روشتات' : 'No prescriptions yet')}
          </p>
          <p className="text-[12px] text-slate-400 dark:text-white/30 mt-1">
            {search ? (isRTL ? 'جرب البحث بكلمات مختلفة' : 'Try different search terms') : (isRTL ? 'ابدأ بإضافة أول روشتة رقمية' : 'Start by creating your first prescription')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredPrescriptions.map((prescription, idx) => (
              <motion.div key={prescription.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: idx * 0.03 }}>
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 group">
                  {/* Top */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/15 transition-colors">
                      <UserIcon size={18} />
                    </div>
                    <div className={cn(isRTL ? "text-left" : "text-right")}>
                      <p className="text-[10px] text-slate-400 dark:text-white/25 uppercase font-bold">{isRTL ? 'التاريخ' : 'Date'}</p>
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white mt-0.5">
                        {new Date(prescription.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1 truncate">
                    {prescription.patient?.name || (isRTL ? 'مريض غير معروف' : 'Unknown patient')}
                  </h3>
                  {prescription.patient?.email && (
                    <p className="text-[11px] text-slate-400 dark:text-white/25 mb-2 truncate">{prescription.patient.email}</p>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={12} className="text-emerald-500 shrink-0" />
                    <p className="text-[12px] text-slate-500 dark:text-white/35 truncate">
                      {isRTL ? (prescription.diagnosisAr || 'لا يوجد تشخيص') : (prescription.diagnosisEn || prescription.diagnosisAr || 'No diagnosis')}
                    </p>
                  </div>

                  {/* Medications count */}
                  {prescription.medications && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-white/25 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        {Array.isArray(prescription.medications) ? prescription.medications.length : 0} {isRTL ? 'دواء' : 'meds'}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <Link href={`/admin/prescriptions/${prescription.id}`}
                        className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-500 dark:text-white/35 hover:text-indigo-500 text-[12px] font-semibold flex items-center gap-1.5 transition-all">
                        <Eye size={13} /> {isRTL ? 'عرض' : 'View'}
                      </Link>
                      <Link href={`/admin/prescriptions/${prescription.id}?print=true`}
                        className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-500 dark:text-white/35 hover:text-indigo-500 text-[12px] font-semibold flex items-center gap-1.5 transition-all">
                        <Printer size={13} /> {isRTL ? 'طباعة' : 'Print'}
                      </Link>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-white/20 font-mono">
                      #{prescription.id.slice(-6)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
