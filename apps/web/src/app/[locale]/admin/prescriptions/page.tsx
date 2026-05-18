'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { 
  FileText, Plus, Search, Filter, 
  Download, Eye, Printer, Calendar,
  User as UserIcon, Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-10 pb-20 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <FileText size={24} />
            </div>
            الروشتات الرقمية
          </h1>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-[0.2em] mt-2 opacity-70">
            إدارة وطباعة الوصفات الطبية للمرضى
          </p>
        </div>
        
        <Link href="/admin/appointments">
          <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-3 group transition-all duration-500 hover:-translate-y-1">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-black uppercase tracking-widest text-xs">إضافة روشتة جديدة</span>
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 rounded-[2rem] shadow-2xl shadow-black/5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم المريض أو التشخيص..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 outline-none transition-all font-bold text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md gap-2">
            <Filter size={18} />
            <span className="font-bold">تصفية</span>
          </Button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-[var(--muted)] bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/20">
          <div className="relative w-16 h-16 mb-6">
             <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-black text-lg tracking-tight text-[var(--foreground)]">جاري جلب البيانات...</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/20">
           <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-400 mb-6">
              <FileText size={40} opacity={0.3} />
           </div>
           <p className="font-black text-xl text-[var(--foreground)]">لا توجد روشتات حالياً</p>
           <p className="text-sm font-bold text-[var(--muted)] mt-2 uppercase tracking-widest">ابدأ بإضافة أول روشتة رقمية الآن</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredPrescriptions.map((prescription, idx) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group relative overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/20 hover:border-primary/30 p-8 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-black/5">
                  {/* Status Indicator */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-8">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-primary border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <UserIcon size={24} />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">التاريخ</p>
                          <p className="text-xs font-black text-[var(--foreground)] mt-1">
                            {new Date(prescription.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                       </div>
                    </div>

                    <h3 className="text-xl font-black text-[var(--foreground)] mb-2 group-hover:text-primary transition-colors">
                      {prescription.patient?.name || 'مريض غير معروف'}
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                       <Activity size={14} className="text-emerald-500" />
                       <p className="text-xs font-bold text-[var(--muted)] truncate">
                          {prescription.diagnosisAr || 'لا يوجد تشخيص مسجل'}
                       </p>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                       <div className="flex gap-2">
                          <Link href={`/admin/prescriptions/${prescription.id}`}>
                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                               <Eye size={18} />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                            onClick={() => window.print()}
                          >
                             <Printer size={18} />
                          </Button>
                       </div>
                       <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
                          ID: <span className="text-primary/50">{prescription.id.slice(-6)}</span>
                       </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
