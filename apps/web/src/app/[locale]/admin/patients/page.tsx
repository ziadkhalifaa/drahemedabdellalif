'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Users, Search, Mail, Phone, Calendar, FileText, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-utils';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        <h1 className="text-2xl font-black">Patients Management</h1>
        <div className="h-96 animate-pulse bg-[var(--card)] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Users className="text-[var(--primary)]" />
            Patients Management
          </h1>
          <p className="text-sm text-[var(--muted)]">{patients.length} registered patients</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2 rounded-xl font-bold">
          <Download size={16} /> Export to Excel
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Patient</th>
                <th className="px-4 py-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Info</th>
                <th className="px-4 py-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Contact</th>
                <th className="px-4 py-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Registered</th>
                <th className="px-4 py-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-[var(--card-hover)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold flex items-center justify-center shrink-0">
                        {patient.name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-bold">{patient.name || 'Unnamed'}</p>
                        <p className="text-[10px] text-[var(--muted)]">{patient.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[var(--foreground)] capitalize">
                        {patient.gender || 'N/A'}
                      </span>
                      {patient.dateOfBirth && (
                        <span className="text-[10px] text-[var(--muted)]">
                          {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (31557600000))} Years old
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Mail size={12} className="text-[var(--muted)]" /> {patient.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <Phone size={12} /> {patient.phone || 'No phone'}
                      </span>
                      {patient.address && (
                        <span className="text-[10px] text-[var(--muted)] truncate max-w-[150px]">
                          {patient.address}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--muted)] text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg h-8 px-3 text-xs font-bold gap-1"
                        onClick={() => {
                          window.location.href = `/${(window as any).__NEXT_DATA__?.locale || 'ar'}/admin/reports`;
                        }}
                      >
                        <FileText size={14} /> Reports
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/5 hover:text-red-600 rounded-lg h-8 px-3 text-xs font-bold gap-1"
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
                  <td colSpan={5} className="py-16 text-center text-[var(--muted)] font-medium">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
