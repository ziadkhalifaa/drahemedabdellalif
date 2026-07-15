'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Users, Search, Mail, Phone, Calendar, FileText, Download, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-utils';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';

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

  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  const handleDeleteClick = async (patientId: string, patientName: string) => {
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete patient "${patientName}"? This will permanently delete ALL of their appointments, prescriptions, medical reports, payments, and account data. This action is irreversible!`);
    if (!confirmDelete) return;

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
      .catch(err => {
        toast.error('Failed to load patients');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const handleExport = () => {
    const data = patients.map(p => ({
      Name: p.name,
      Email: p.email,
      Phone: p.phone || 'N/A',
      'Registered At': new Date(p.createdAt).toLocaleDateString(),
    }));
    exportToExcel(data, 'Patients_List');
    toast.success('Exported successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
        <div className="h-[480px] bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <Users className="text-indigo-500" size={22} />
            </div>
            Patients Management
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-1 ml-[46px]">{patients.length} registered patients</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="gap-2 rounded-xl font-bold text-[13px] text-slate-700 dark:text-white/70 border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <Download size={15} /> Export to Excel
        </Button>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 dark:border-white/5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" size={16} />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl text-[13px] bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/5 text-left">
                <th className="px-5 py-3 font-bold text-slate-500 dark:text-white/35 uppercase text-[11px] tracking-wider">Patient</th>
                <th className="px-5 py-3 font-bold text-slate-500 dark:text-white/35 uppercase text-[11px] tracking-wider">Info</th>
                <th className="px-5 py-3 font-bold text-slate-500 dark:text-white/35 uppercase text-[11px] tracking-wider">Contact</th>
                <th className="px-5 py-3 font-bold text-slate-500 dark:text-white/35 uppercase text-[11px] tracking-wider">Registered</th>
                <th className="px-5 py-3 font-bold text-slate-500 dark:text-white/35 uppercase text-[11px] tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-[13px] shrink-0">
                        {patient.name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-[13px] text-slate-900 dark:text-white">{patient.name || 'Unnamed'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-white/35 font-medium">{patient.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-slate-700 dark:text-white/80 capitalize">
                        {patient.gender || 'N/A'}
                      </span>
                      {patient.dateOfBirth && (
                        <span className="text-[12px] text-slate-500 dark:text-white/35">
                          {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (31557600000))} Years old
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-2 text-[13px] text-slate-700 dark:text-white/80">
                        <Mail size={13} className="text-slate-400 dark:text-white/25" /> {patient.email}
                      </span>
                      <span className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-white/35">
                        <Phone size={13} className="text-slate-400 dark:text-white/25" /> {patient.phone || 'No phone'}
                      </span>
                      {patient.address && (
                        <span className="text-[11px] text-slate-500 dark:text-white/35 truncate max-w-[150px]">
                          {patient.address}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-slate-500 dark:text-white/35 text-[13px]">
                    <span className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400 dark:text-white/25" />
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-500 hover:bg-indigo-500/5 rounded-xl h-8 px-3 text-[12px] font-bold gap-1.5"
                        onClick={() => {
                          router.push(`/admin/patients/${patient.id}`);
                        }}
                      >
                        <FileText size={14} /> الملف الطبي
                      </Button>
                      {appointmentIdParam && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-500 hover:bg-emerald-500/5 rounded-xl h-8 px-3 text-[12px] font-bold gap-1.5 animate-pulse border border-emerald-500/20"
                          onClick={() => {
                            router.push(`/admin/prescriptions/new/${appointmentIdParam}`);
                          }}
                        >
                          <Plus size={14} /> Write Prescription
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/5 hover:text-red-600 rounded-xl h-8 px-3 text-[12px] font-bold gap-1.5"
                        onClick={() => handleDeleteClick(patient.id, patient.name)}
                        disabled={deletingId === patient.id}
                      >
                        {deletingId === patient.id ? (
                          <div className="h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
                        <Users size={24} className="text-slate-400 dark:text-white/25" />
                      </div>
                      <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">No patients found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
