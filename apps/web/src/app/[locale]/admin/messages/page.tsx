'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import type { ContactMessage } from '@dr-ahmed/shared';
import { Trash2, MailOpen, Download, FileDown, MessageCircle, Mail, Phone, Search, Filter, X, CheckCheck } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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
    try {
      await api.patch(`/contact/${id}/read`, {}, token);
      toast.success('Marked as read');
      fetchMessages();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    const unread = filteredMessages.filter(m => !m.isRead);
    for (const msg of unread) {
      await api.patch(`/contact/${msg.id}/read`, {}, token);
    }
    toast.success(`Marked ${unread.length} messages as read`);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/contact/${id}`, token);
      toast.success('Message deleted');
      fetchMessages();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExportExcel = () => {
    const data = filteredMessages.map(m => ({
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
    const data = filteredMessages.map(m => [
      m.name,
      m.email,
      m.phone,
      new Date(m.createdAt).toLocaleDateString(),
      m.isRead ? 'Read' : 'Unread'
    ]);
    exportToPDF(headers, data, 'Messages_Report', 'Contact Messages List');
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const totalCount = messages.length;

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread' && m.isRead) return false;
    if (filter === 'read' && !m.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-1">
            Contact form submissions and inquiries.
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-[12px] font-bold hover:bg-indigo-500/15 transition-colors"
            >
              <CheckCheck size={14} />
              Mark all read ({unreadCount})
            </button>
          )}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[12px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <Download size={13} /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[12px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <FileDown size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "bg-white dark:bg-[#111827] rounded-2xl border p-4 transition-all",
            filter === 'all' ? "border-indigo-500/30 dark:border-indigo-500/20 shadow-md shadow-indigo-500/5" : "border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Total</p>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "bg-white dark:bg-[#111827] rounded-2xl border p-4 transition-all",
            filter === 'unread' ? "border-indigo-500/30 dark:border-indigo-500/20 shadow-md shadow-indigo-500/5" : "border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Unread</p>
          <p className="text-[22px] font-bold text-indigo-500 mt-1">{unreadCount}</p>
        </button>
        <button
          onClick={() => setFilter('read')}
          className={cn(
            "bg-white dark:bg-[#111827] rounded-2xl border p-4 transition-all",
            filter === 'read' ? "border-indigo-500/30 dark:border-indigo-500/20 shadow-md shadow-indigo-500/5" : "border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Read</p>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white mt-1">{totalCount - unreadCount}</p>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4">
        <div className="relative">
          <Search size={15} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25", isRTL ? "right-3" : "left-3")} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn("w-full h-9 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all", isRTL ? "pr-9 pl-3" : "pl-9 pr-3")}
            placeholder="Search by name, email, phone, or message..."
          />
          {search && (
            <button onClick={() => setSearch('')} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", isRTL ? "left-3" : "right-3")}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
          <p className="text-[13px] text-slate-500 dark:text-white/35">Loading messages...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] border border-red-200/60 dark:border-red-500/10 rounded-2xl">
          <p className="text-[13px] font-bold text-red-500 mb-3">Failed to load data</p>
          <button onClick={() => fetchMessages()} className="px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Retry Now
          </button>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <Mail size={24} className="text-slate-300 dark:text-white/15" />
          </div>
          <p className="text-[13px] font-bold text-slate-900 dark:text-white">
            {search ? 'No messages match your search' : filter === 'unread' ? 'No unread messages' : filter === 'read' ? 'No read messages' : 'No messages yet'}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">
            {search ? 'Try a different search term' : 'Messages from the contact form will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
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
                        {msg.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> <span dir="ltr">{msg.phone}</span>
                          </span>
                        )}
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
                  <span className="text-[11px] text-slate-400 dark:text-white/25">
                    {new Date(msg.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.isRead && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-white/15">Read</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      {!loading && filteredMessages.length > 0 && (
        <p className="text-center text-[11px] text-slate-400 dark:text-white/25">
          Showing {filteredMessages.length} of {totalCount} messages
        </p>
      )}
    </div>
  );
}
