'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { Appointment } from '@dr-ahmed/shared';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';
import { Check, X, FileDown, Download, Pill, Video } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';

export default function AdminAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAppointments = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    api.get<{data: Appointment[], total: number}>('/appointments', token)
      .then((res) => setAppointments(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [token]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    if (!token) return;
    await api.patch(`/appointments/${id}/status`, { status }, token);
    fetchAppointments();
  };

  const handleExportExcel = () => {
    const data = appointments.map(a => {
      const name = a.guestName || a.patient?.name || '—';
      const phone = a.guestPhone || a.patient?.phone || '—';
      const email = a.guestEmail || a.patient?.email || '—';
      return {
        Patient: name,
        Phone: phone,
        Email: email,
        Date: new Date(a.date).toLocaleDateString(),
        Time: a.timeSlot,
        Status: a.status,
        Notes: a.notes || ''
      };
    });
    exportToExcel(data, 'Appointments_Report');
  };

  const handleExportPDF = () => {
    const headers = ['Patient', 'Phone', 'Date', 'Time', 'Status'];
    const data = appointments.map(a => {
      const name = a.guestName || a.patient?.name || '—';
      const phone = a.guestPhone || a.patient?.phone || '—';
      return [
        name,
        phone,
        new Date(a.date).toLocaleDateString(),
        a.timeSlot,
        a.status
      ];
    });
    exportToPDF(headers, data, 'Appointments_Report', 'Appointments List');
  };

  const filteredAppointments = appointments.filter(a => {
    if (!dateFilter) return true;
    const aDate = new Date(a.date).toISOString().split('T')[0];
    return aDate === dateFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Appointments</h1>
          <p className="text-sm text-[var(--muted)]">Manage patient bookings and schedules.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
              <Download size={16} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
              <FileDown size={16} /> PDF
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <p className="font-bold">Failed to load data</p>
          <Button variant="outline" onClick={fetchAppointments} className="mt-4">Retry Now</Button>
        </div>
      ) : (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 pb-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Patient</th>
                <th className="px-4 pb-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Phone</th>
                <th className="px-4 pb-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Date</th>
                <th className="px-4 pb-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Time</th>
                <th className="px-4 pb-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Status</th>
                <th className="px-4 pb-3 font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAppointments.map((apt) => {
                const name = apt.guestName || apt.patient?.name || '—';
                const email = apt.guestEmail || apt.patient?.email || '—';
                const phone = apt.guestPhone || apt.patient?.phone || '—';
                return (
                  <tr key={apt.id} className="hover:bg-[var(--card-hover)] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[var(--foreground)]">{name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{email}</p>
                    </td>
                    <td className="p-4 text-[var(--muted)] font-medium">{phone}</td>
                  <td className="p-4 text-[var(--muted)]">{new Date(apt.date).toLocaleDateString()}</td>
                  <td className="p-4 text-[var(--muted)]">{apt.timeSlot}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      apt.status === AppointmentStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                      apt.status === AppointmentStatus.REJECTED ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{apt.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {apt.status === AppointmentStatus.PENDING && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(apt.id, AppointmentStatus.APPROVED)} className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50">
                            <Check size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                      {apt.status === AppointmentStatus.APPROVED && (
                        <>
                          {apt.type === AppointmentType.ONLINE && (
                            <Link href={`/dashboard/video/${apt.meetingId || apt.id}`}>
                              <Button size="sm" variant="ghost" title="Join Video Call" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                                <Video size={16} />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/admin/prescriptions/new/${apt.id}`}>
                            <Button size="sm" variant="ghost" title="New Prescription" className="h-8 w-8 p-0 text-[var(--primary)] hover:bg-[var(--primary)]/5">
                              <Pill size={16} />
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ); })}
              {filteredAppointments.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-[var(--muted)] font-medium">No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}
