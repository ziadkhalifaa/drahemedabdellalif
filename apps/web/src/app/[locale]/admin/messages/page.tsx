'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { ContactMessage } from '@dr-ahmed/shared';
import { Trash2, MailOpen, Download, FileDown, MessageCircle } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const fetchMessages = () => {
    if (token) api.get<ContactMessage[]>('/contact', token).then(setMessages).catch(() => {});
  };

  useEffect(() => { fetchMessages(); }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    await api.patch(`/contact/${id}/read`, {}, token);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this message?')) {
      await api.delete(`/contact/${id}`, token);
      fetchMessages();
    }
  };

  const handleExportExcel = () => {
    const data = messages.map(m => ({
      Name: m.name,
      Email: m.email,
      Phone: m.phone,
      Message: m.message,
      Date: new Date(m.createdAt).toLocaleString(),
      Status: m.isRead ? 'Read' : 'Unread'
    }));
    exportToExcel(data, 'Messages_Report');
  };

  const handleExportPDF = () => {
    const headers = ['Name', 'Email', 'Phone', 'Date', 'Status'];
    const data = messages.map(m => [
      m.name,
      m.email,
      m.phone,
      new Date(m.createdAt).toLocaleDateString(),
      m.isRead ? 'Read' : 'Unread'
    ]);
    exportToPDF(headers, data, 'Messages_Report', 'Contact Messages List');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Messages</h1>
          <p className="text-sm text-[var(--muted)]">Handle inquiries and messages from the contact form.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
            <Download size={16} /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
            <FileDown size={16} /> PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((msg) => (
          <Card key={msg.id} className={cn(
            "p-0 overflow-hidden transition-all duration-300",
            !msg.isRead ? "border-l-4 border-l-[var(--primary)] shadow-md" : "opacity-80"
          )}>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    !msg.isRead ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-gray-100 text-gray-400"
                  )}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[var(--foreground)]">{msg.name}</h3>
                      {!msg.isRead && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white text-[8px] font-bold uppercase">New</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] font-medium">{msg.email} &middot; {msg.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!msg.isRead && (
                    <Button size="sm" variant="ghost" onClick={() => markAsRead(msg.id)} className="h-8 w-8 p-0 text-[var(--primary)] hover:bg-[var(--primary)]/10">
                      <MailOpen size={16} />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(msg.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 p-4 bg-[var(--card-hover)] rounded-xl">
                <p className="text-sm text-[var(--foreground)] leading-relaxed italic">&quot;{msg.message}&quot;</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                {msg.isRead && <span className="uppercase tracking-widest opacity-50">Read</span>}
              </div>
            </div>
          </Card>
        ))}
        {messages.length === 0 && (
          <Card className="py-20 flex flex-col items-center justify-center text-[var(--muted)]">
            <MessageCircle size={48} className="opacity-10 mb-4" />
            <p className="font-medium">No messages found in your inbox</p>
          </Card>
        )}
      </div>
    </div>
  );
}
