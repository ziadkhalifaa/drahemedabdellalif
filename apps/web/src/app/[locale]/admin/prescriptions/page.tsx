'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { FileText, Plus, Search, Eye, Printer, Calendar, User as UserIcon, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function PrescriptionsPage() {
  const t = useTranslations('admin');
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosisAr?.includes(search) ||
    p.diagnosisEn?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <FileText size={20} />
            </div>
            الروشتات الرقمية
          </h1>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1.5 mr-[52px]">
            إدارة وطباعة الوصفات الطبية للمرضى
          </p>
        </div>

        <Link href="/admin/appointments">
          <button className="h-10 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30">
            <Plus size={16} />
            إضافة روشتة جديدة
          </button>
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" size={16} />
          <input
            type="text"
            placeholder="البحث باسم المريض أو التشخيص..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5"
        >
          <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-[13px] font-semibold text-slate-900 dark:text-white">جاري جلب البيانات...</p>
        </motion.div>
      ) : filteredPrescriptions.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/25 mb-4">
            <FileText size={28} />
          </div>
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">لا توجد روشتات حالياً</p>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">ابدأ بإضافة أول روشتة رقمية الآن</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredPrescriptions.map((prescription, idx) => (
              <motion.div
                key={prescription.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: idx * 0.04 }}
              >
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-200 group">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/15 transition-colors">
                      <UserIcon size={18} />
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 dark:text-white/25">التاريخ</p>
                      <p className="text-[12px] font-semibold text-slate-900 dark:text-white mt-0.5">
                        {new Date(prescription.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">
                    {prescription.patient?.name || 'مريض غير معروف'}
                  </h3>
                  <div className="flex items-center gap-2 mb-5">
                    <Activity size={12} className="text-emerald-500 shrink-0" />
                    <p className="text-[12px] text-slate-500 dark:text-white/35 truncate">
                      {prescription.diagnosisAr || 'لا يوجد تشخيص مسجل'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <Link
                        href={`/admin/prescriptions/${prescription.id}`}
                        className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-500/10 text-slate-500 dark:text-white/35 hover:text-indigo-500 text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Eye size={14} />
                        عرض
                      </Link>
                      <button
                        className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-500/10 text-slate-500 dark:text-white/35 hover:text-indigo-500 text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                        onClick={() => window.print()}
                      >
                        <Printer size={14} />
                        طباعة
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-white/25">
                      #{prescription.id.slice(-6)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
