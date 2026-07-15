'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Check, X, Trash2, Star, Trophy, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'pending' | 'success-stories';

export default function AdminTestimonialsPage() {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const fetchTestimonials = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<any>('/testimonials/all', token)
      .then(res => {
        setTestimonials(Array.isArray(res) ? res : (res?.data || []));
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch testimonials (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchTestimonials(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const approve = async (id: string) => {
    if (!token) return;
    try {
      await api.patch(`/testimonials/${id}/approve`, {}, token);
      toast.success('Approved');
      fetchTestimonials();
    } catch { toast.error('Failed to approve'); }
  };

  const toggleVisibility = async (item: any) => {
    if (!token) return;
    try {
      await api.patch(`/testimonials/${item.id}`, { isVisible: !item.isVisible }, token);
      fetchTestimonials();
    } catch { toast.error('Failed to update visibility'); }
  };

  const toggleSuccessStory = async (item: any) => {
    if (!token) return;
    try {
      await api.patch(`/testimonials/${item.id}/toggle-success-story`, { isSuccessStory: !item.isSuccessStory }, token);
      fetchTestimonials();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this testimonial permanently?')) {
      try {
        await api.delete(`/testimonials/${id}`, token);
        toast.success('Deleted');
        fetchTestimonials();
      } catch { toast.error('Failed to delete'); }
    }
  };

  const filtered = testimonials.filter(t => {
    if (activeTab === 'pending') return !t.isApproved;
    if (activeTab === 'success-stories') return t.isSuccessStory;
    return true;
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: 'الكل', count: testimonials.length },
    { id: 'pending', label: 'بانتظار الموافقة', count: testimonials.filter(t => !t.isApproved).length },
    { id: 'success-stories', label: 'قصص النجاح', count: testimonials.filter(t => t.isSuccessStory).length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">التعليقات والتقييمات</h1>
        <p className="text-[13px] text-slate-500 dark:text-white/35">إدارة تعليقات المرضى وقصص النجاح.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4" />
          <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">Loading testimonials...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] border border-red-200/60 dark:border-red-500/10 rounded-2xl">
          <p className="text-[13px] font-bold text-red-500 mb-3">Failed to load data</p>
          <button onClick={fetchTestimonials} className="px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Retry Now
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-white/35 hover:text-slate-700 dark:hover:text-white/50"
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-black",
                    activeTab === tab.id
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-white/35"
                  )}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "bg-white dark:bg-[#111827] border rounded-2xl p-5 transition-all duration-300",
                  item.isSuccessStory
                    ? "border-amber-200/60 dark:border-amber-500/10"
                    : "border-slate-200/60 dark:border-white/5"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold flex-shrink-0",
                    item.isSuccessStory
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-indigo-500/10 text-indigo-500"
                  )}>
                    {item.patientName?.charAt(0) || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">{item.patientName}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 mb-2">
                      {item.isSuccessStory && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          <Trophy size={11} /> قصة نجاح
                        </span>
                      )}
                      <span className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-lg",
                        item.isApproved
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        {item.isApproved ? 'معتمد' : 'بانتظار الموافقة'}
                      </span>
                      {!item.isVisible && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/25">
                          مخفي
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-slate-500 dark:text-white/35 line-clamp-2 leading-relaxed">{item.content}</p>
                    {item.storyTitle && (
                      <p className="text-[12px] text-indigo-500 font-bold mt-1.5">{item.storyTitle}</p>
                    )}
                    {item.treatmentType && (
                      <p className="text-[12px] text-slate-400 dark:text-white/25 mt-0.5">النوع: {item.treatmentType}</p>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0">
                    {!item.isApproved && (
                      <button
                        onClick={() => approve(item.id)}
                        className="h-9 w-9 p-0 rounded-xl text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex items-center justify-center"
                        title="اعتماد"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => toggleSuccessStory(item)}
                      className={cn(
                        "h-9 w-9 p-0 rounded-xl transition-colors flex items-center justify-center",
                        item.isSuccessStory
                          ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                          : "text-slate-400 dark:text-white/25 hover:text-amber-500 hover:bg-amber-500/10"
                      )}
                      title={item.isSuccessStory ? "إلغاء قصة النجاح" : "تعيين كقصة نجاح"}
                    >
                      <Trophy size={16} />
                    </button>
                    <button
                      onClick={() => toggleVisibility(item)}
                      className="h-9 w-9 p-0 rounded-xl text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center justify-center"
                      title={item.isVisible ? "إخفاء" : "إظهار"}
                    >
                      {item.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="h-9 w-9 p-0 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">لا توجد تعليقات في هذا القسم</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
