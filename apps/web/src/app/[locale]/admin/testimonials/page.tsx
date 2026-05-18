'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
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
    await api.patch(`/testimonials/${id}/approve`, {}, token);
    fetchTestimonials();
  };

  const toggleVisibility = async (item: any) => {
    if (!token) return;
    await api.patch(`/testimonials/${item.id}`, { isVisible: !item.isVisible }, token);
    fetchTestimonials();
  };

  const toggleSuccessStory = async (item: any) => {
    if (!token) return;
    await api.patch(`/testimonials/${item.id}/toggle-success-story`, { isSuccessStory: !item.isSuccessStory }, token);
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this testimonial permanently?')) {
      await api.delete(`/testimonials/${id}`, token);
      fetchTestimonials();
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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">التعليقات والتقييمات</h1>
        <p className="text-sm text-[var(--muted)]">إدارة تعليقات المرضى وقصص النجاح.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold">Loading testimonials...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <p className="font-bold">Failed to load data</p>
          <Button variant="outline" onClick={fetchTestimonials} className="mt-4">Retry Now</Button>
        </div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 -mb-[2px]",
              activeTab === tab.id
                ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "mr-2 inline-flex items-center justify-center rounded-full w-5 h-5 text-[10px] font-black",
                activeTab === tab.id ? "bg-[var(--primary)] text-white" : "bg-gray-100 dark:bg-gray-800 text-[var(--muted)]"
              )}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} className={cn(
            "p-5 transition-all",
            item.isSuccessStory && "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10"
          )}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg flex-shrink-0">
                {item.patientName?.charAt(0) || '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="font-bold text-[var(--foreground)]">{item.patientName}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {item.isSuccessStory && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Trophy size={10} /> قصة نجاح
                    </span>
                  )}
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    item.isApproved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {item.isApproved ? 'معتمد' : 'بانتظار الموافقة'}
                  </span>
                  {!item.isVisible && (
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">مخفي</span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)] line-clamp-2">{item.content}</p>
                {item.storyTitle && (
                  <p className="text-xs text-[var(--primary)] font-bold mt-1">📖 {item.storyTitle}</p>
                )}
                {item.treatmentType && (
                  <p className="text-xs text-gray-400 mt-0.5">النوع: {item.treatmentType}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                {!item.isApproved && (
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => approve(item.id)}
                    className="h-9 w-9 p-0 rounded-xl text-green-500 bg-green-50 hover:bg-green-100 dark:bg-green-900/20"
                    title="اعتماد"
                  >
                    <Check size={16} />
                  </Button>
                )}
                <Button
                  size="sm" variant="ghost"
                  onClick={() => toggleSuccessStory(item)}
                  className={cn(
                    "h-9 w-9 p-0 rounded-xl",
                    item.isSuccessStory
                      ? "text-amber-500 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20"
                      : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                  )}
                  title={item.isSuccessStory ? "إلغاء قصة النجاح" : "تعيين كقصة نجاح"}
                >
                  <Trophy size={16} />
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => toggleVisibility(item)}
                  className="h-9 w-9 p-0 rounded-xl text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20"
                  title={item.isVisible ? "إخفاء" : "إظهار"}
                >
                  {item.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="h-9 w-9 p-0 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted)]">
            <p className="text-4xl mb-4">💬</p>
            <p className="font-bold">لا توجد تعليقات في هذا القسم</p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
