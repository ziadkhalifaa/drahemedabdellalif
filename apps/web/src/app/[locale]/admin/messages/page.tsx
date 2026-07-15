'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { ContactMessage } from '@dr-ahmed/shared';
import { Trash2, MailOpen, Download, FileDown, MessageCircle, Mail, Phone, User } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMessages = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<any>('/contact', token)
      .then(res => {
        setMessages(Array.isArray(res) ? res : (res?.data || []));
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch contact messages (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchMessages(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

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

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35">
            Handle inquiries and messages from the contact form.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-indigo-500 text-white text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <Download size={15} /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <FileDown size={15} /> PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4" />
          <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">Loading messages...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] border border-red-200/60 dark:border-red-500/10 rounded-2xl">
          <p className="text-[13px] font-bold text-red-500 mb-3">Failed to load data</p>
          <button onClick={fetchMessages} className="px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Retry Now
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "bg-white dark:bg-[#111827] rounded-2xl overflow-hidden transition-all duration-300 border",
                !msg.isRead
                  ? "border-l-[3px] border-l-indigo-500 border-slate-200/60 dark:border-white/5 shadow-lg shadow-indigo-500/5"
                  : "border-slate-200/60 dark:border-white/5"
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      !msg.isRead
                        ? "bg-indigo-500/10 text-indigo-500"
                        : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/25"
                    )}>
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{msg.name}</h3>
                        {!msg.isRead && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-white text-[9px] font-black uppercase">New</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-slate-500 dark:text-white/35">
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {msg.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {msg.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {!msg.isRead && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="h-8 w-8 p-0 rounded-lg text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors flex items-center justify-center"
                        title="Mark as read"
                      >
                        <MailOpen size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="h-8 w-8 p-0 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[13px] text-slate-700 dark:text-white/50 leading-relaxed">{msg.message}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-white/25">{new Date(msg.createdAt).toLocaleString()}</span>
                  {msg.isRead && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-white/15">Read</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Mail size={36} className="text-slate-300 dark:text-white/15" />
              </div>
              <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">No messages found in your inbox</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
