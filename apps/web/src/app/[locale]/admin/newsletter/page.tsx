'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { useAuth } from '@/components/layout/admin-layout';
import { toast } from 'sonner';
import { Mail, Download, Send, Users, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function NewsletterPage() {
  const t = useTranslations('admin.newsletter');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignData, setCampaignData] = useState({ subject: '', content: '' });
  const [sending, setSending] = useState(false);

  const [error, setError] = useState(false);

  const fetchSubscribers = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<any>('/newsletter', token)
      .then(res => {
        setSubscribers(Array.isArray(res) ? res : (res?.data || []));
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch subscribers (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchSubscribers(attempt + 1), 1500);
        } else {
          toast.error(isRTL ? 'فشل في تحميل المشتركين' : 'Failed to load subscribers');
          setError(true);
          setLoading(false);
        }
      });
  }, [token, isRTL]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error(isRTL ? 'لا يوجد مشتركين لتصديرهم' : 'No subscribers to export');
      return;
    }

    const headers = [isRTL ? 'البريد الإلكتروني' : 'Email', isRTL ? 'تاريخ الاشتراك' : 'Subscribed At'];
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
      toast.success(isRTL ? 'تم إرسال الحملة بنجاح إلى جميع المشتركين!' : 'Campaign sent successfully to all subscribers!');
      setIsCampaignModalOpen(false);
      setCampaignData({ subject: '', content: '' });
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'فشل في إرسال الحملة' : 'Failed to send campaign'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4" />
          <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">{t('loadingSubscribers')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] border border-red-200/60 dark:border-red-500/10 rounded-2xl">
          <p className="text-[13px] font-bold text-red-500 mb-3">{t('failedToLoad')}</p>
          <button onClick={fetchSubscribers} className="px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            {t('retryNow')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Mail size={20} />
            </div>
            {t('title')}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <Download size={15} />
            {t('exportCSV')}
          </button>

          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Send size={15} />
            {t('sendCampaign')}
          </button>
        </div>
      </div>

      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[560px] bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Send size={16} />
                  </div>
                  {t('newCampaign')}
                </h2>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-white/25 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendCampaign} className="space-y-5">
                <div className="space-y-1.5">
                  <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 block", isRTL ? "mr-1" : "ml-1")}>{t('subject')}</label>
                  <input
                    required
                    value={campaignData.subject}
                    onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                    placeholder={t('subjectPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 block", isRTL ? "mr-1" : "ml-1")}>{t('content')}</label>
                  <textarea
                    required
                    value={campaignData.content}
                    onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                    placeholder={isRTL ? '<p>عزيزي subscriber...</p>' : '<p>Dear subscriber...</p>'}
                    className="w-full min-h-[180px] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
                  />
                </div>

                <div className="flex items-center gap-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                  <Users size={18} className="text-indigo-500 shrink-0" />
                  <p className="text-[13px] text-slate-600 dark:text-white/50">
                    {t.rich('recipientsCount', {
                      count: subscribers.length,
                      strong: (chunks) => <strong className="text-slate-900 dark:text-white">{chunks}</strong>
                    })}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 dark:text-white/35 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !campaignData.subject || !campaignData.content}
                    className="px-8 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? tCommon('loading') : t('sendNow')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-slate-400 dark:text-white/25" />
            {t('subscribersList')} ({subscribers.length})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25", isRTL ? "right-3" : "left-3")} size={15} />
            <input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full py-2 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
              )}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={cn("w-full text-[13px] whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
            <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">{t('emailAddress')}</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">{t('subscribedDate')}</th>
                <th className={cn("px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25", isRTL ? "text-left" : "text-right")}>{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{sub.email}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-white/35">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className={cn("px-5 py-3.5", isRTL ? "text-left" : "text-right")}>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {t('active')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                        <Mail size={28} className="text-slate-300 dark:text-white/15" />
                      </div>
                      <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">
                        {t('noSubscribersFound')} &quot;{searchTerm}&quot;
                      </p>
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
