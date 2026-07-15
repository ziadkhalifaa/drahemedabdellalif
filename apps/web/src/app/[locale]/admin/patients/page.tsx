'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { toast } from 'sonner';
import { Users, Search, Mail, Phone, Calendar, FileText, Download, Trash2, Plus, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
}

export default function PatientsManagementPage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');
  const appointmentIdParam = searchParams.get('appointmentId');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'email'>('date');

  useEffect(() => {
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParam]);

  const handleDeleteClick = async (patientId: string, patientName: string) => {
    const msg = `Are you absolutely sure you want to delete patient "${patientName}"? This will permanently delete ALL of their appointments, prescriptions, medical reports, payments, and account data. This action is irreversible!`;
    if (!window.confirm(msg)) return;
    setDeletingId(patientId);
    try {
      await api.delete(`/auth/users/${patientId}`, token);
      toast.success('Patient and all associated records deleted successfully!');
      setPatients(prev => prev.filter(p => p.id !== patientId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete patient');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!token) return;
    api.get<Patient[]>('/auth/users?role=patient', token)
      .then(setPatients)
      .catch(err => { toast.error('Failed to load patients'); console.error(err); })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    const result = patients.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm)
    );
    result.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [patients, searchTerm, sortBy]);

  const handleExport = () => {
    exportToExcel(filtered.map(p => ({
      Name: p.name,
      Email: p.email,
      Phone: p.phone || 'N/A',
      Gender: p.gender || 'N/A',
      Age: p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / 31557600000) : 'N/A',
      Address: p.address || 'N/A',
      'Registered At': new Date(p.createdAt).toLocaleDateString(),
    })), 'Patients_List');
    toast.success('Exported successfully');
  };

  const getAge = (dob?: string) => {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="relative w-10 h-10 mb-3">
          <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/10 rounded-xl" />
          <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-xl animate-spin" />
        </div>
        <p className="text-[13px] text-slate-400 dark:text-white/30">Loading patients...</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {patients.length} {isRTL ? 'مريض مسجل' : 'Registered Patients'}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-0.5">
            {isRTL ? 'إدارة حسابات المرضى والملفات الطبية' : 'Manage patient accounts and medical profiles'}
          </p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all shadow-sm">
          <Download size={14} /> {isRTL ? 'تصدير' : 'Export'}
        </button>
      </motion.div>

      {/* Search + Sort */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder={isRTL ? 'بحث بالاسم، الإيميل، أو الهاتف...' : 'Search by name, email, or phone...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all" />
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-white/5 p-1">
          {([['date', isRTL ? 'الأحدث' : 'Newest'], ['name', isRTL ? 'الاسم' : 'Name'], ['email', isRTL ? 'البريد' : 'Email']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)} className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
              sortBy === key ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 dark:text-white/30 hover:bg-slate-50 dark:hover:bg-white/5"
            )}>{label}</button>
          ))}
        </div>
      </motion.div>

      {/* Patient Grid */}
      <motion.div variants={fadeUp} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(patient => {
          const age = getAge(patient.dateOfBirth);
          return (
            <div key={patient.id} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 group">
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/10 flex items-center justify-center text-[14px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {patient.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{patient.name || 'Unnamed'}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {patient.gender && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-white/35 uppercase">{patient.gender}</span>
                      )}
                      {age && (
                        <span className="text-[10px] text-slate-400 dark:text-white/25">{age} {isRTL ? 'سنة' : 'yrs'}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => router.push(`/admin/patients/${patient.id}`)}
                  className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-white/50">
                  <Mail size={13} className="text-slate-400 dark:text-white/25 shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-white/50">
                    <Phone size={13} className="text-slate-400 dark:text-white/25 shrink-0" />
                    <span dir="ltr">{patient.phone}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-white/25">
                    <MapPin size={12} className="text-slate-400 dark:text-white/20 shrink-0" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/20">
                  <Calendar size={11} />
                  {new Date(patient.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => router.push(`/admin/patients/${patient.id}`)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1">
                    <FileText size={12} /> {isRTL ? 'الملف' : 'Profile'}
                  </button>
                  {appointmentIdParam && (
                    <button onClick={() => router.push(`/admin/prescriptions/new/${appointmentIdParam}`)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-center gap-1 animate-pulse">
                      <Plus size={12} /> {isRTL ? 'روشتة' : 'Rx'}
                    </button>
                  )}
                  <button onClick={() => handleDeleteClick(patient.id, patient.name)} disabled={deletingId === patient.id}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    {deletingId === patient.id ? <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <Users size={24} className="text-slate-400 dark:text-white/25" />
          </div>
          <p className="text-[13px] font-bold text-slate-700 dark:text-white/60">
            {searchTerm ? (isRTL ? 'لا توجد نتائج' : 'No results') : (isRTL ? 'لا يوجد مرضى' : 'No patients yet')}
          </p>
          <p className="text-[12px] text-slate-400 dark:text-white/30 mt-1">
            {searchTerm ? (isRTL ? 'جرب البحث بكلمات مختلفة' : 'Try different search terms') : (isRTL ? 'سيظهر المرضى هنا عند التسجيل' : 'Patients will appear here once registered')}
          </p>
        </div>
      )}
    </motion.div>
  );
}
