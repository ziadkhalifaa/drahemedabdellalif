'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Mail, Download, Send, Plus, Users, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function NewsletterPage() {
  const t = useTranslations('admin.newsletter');
  const tCommon = useTranslations('common');
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Campaign state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignData, setCampaignData] = useState({ subject: '', content: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;

    api.get<Subscriber[]>('/newsletter', token)
      .then(res => setSubscribers(res))
      .catch(err => {
        toast.error('Failed to load subscribers');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }

    const headers = ['Email', 'Subscribed At'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(s => `"${s.email}","${new Date(s.createdAt).toISOString()}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !campaignData.subject || !campaignData.content) return;

    setSending(true);
    try {
      await api.post('/newsletter/send', campaignData, token);
      toast.success('Campaign sent successfully to all subscribers!');
      setIsCampaignModalOpen(false);
      setCampaignData({ subject: '', content: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-black">{t('title', { fallback: 'Newsletter Management' })}</h1>
        <div className="h-96 animate-pulse bg-[var(--card)] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Mail size={28} />
            </div>
            {t('title', { fallback: 'Newsletter Management' })}
          </h1>
          <p className="text-[var(--muted)]">{t('subtitle', { fallback: 'Manage your subscribers and send email campaigns.' })}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="rounded-xl font-bold gap-2"
          >
            <Download size={18} />
            {t('exportCSV', { fallback: 'Export to CSV' })}
          </Button>

          <Button onClick={() => setIsCampaignModalOpen(true)} className="rounded-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] gap-2 shadow-lg shadow-[var(--primary)]/20">
            <Send size={18} />
            {t('sendCampaign', { fallback: 'Send Campaign' })}
          </Button>

          {isCampaignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full sm:max-w-[600px] bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden relative shadow-2xl">
                <div className="p-8">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-black flex items-center gap-2">
                      <Send className="text-[var(--primary)]" />
                      {t('newCampaign', { fallback: 'New Email Campaign' })}
                    </h2>
                    <button onClick={() => setIsCampaignModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSendCampaign} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{t('subject', { fallback: 'Subject Line' })}</label>
                      <Input
                        required
                        value={campaignData.subject}
                        onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                        placeholder="e.g. New Urology Treatments Available"
                        className="py-6 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--muted)] ml-1">{t('content', { fallback: 'Email Content (HTML allowed)' })}</label>
                      <textarea
                        required
                        value={campaignData.content}
                        onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                        placeholder="<p>Dear subscriber...</p>"
                        className="w-full min-h-[200px] p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none transition-all resize-y"
                      />
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--primary)]/5 p-4 rounded-xl border border-[var(--primary)]/10 text-sm">
                      <Users size={20} className="text-[var(--primary)] shrink-0" />
                      <p>
                        This campaign will be sent to <strong>{subscribers.length}</strong> active subscribers.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                      <Button type="button" variant="ghost" onClick={() => setIsCampaignModalOpen(false)} className="rounded-xl font-bold">
                        {tCommon('cancel', { fallback: 'Cancel' })}
                      </Button>
                      <Button type="submit" disabled={sending || !campaignData.subject || !campaignData.content} className="rounded-xl font-bold px-8">
                        {sending ? tCommon('loading', { fallback: 'Sending...' }) : t('sendNow', { fallback: 'Send Now' })}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="border-[var(--border)] rounded-3xl shadow-sm overflow-hidden bg-[var(--card)]">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--background)]/50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users size={20} className="text-[var(--muted)]" />
            {t('subscribersList', { fallback: 'Subscribers List' })} ({subscribers.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-[var(--background)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] uppercase text-[10px] font-black tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Subscribed Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{sub.email}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[var(--muted)]">
                    No subscribers found matching "{searchTerm}"
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
