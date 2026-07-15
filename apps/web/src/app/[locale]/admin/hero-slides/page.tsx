'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';

import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from '@/components/media-picker';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface HeroSlide {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  isPortrait: boolean;
  order: number;
  isActive: boolean;
}

export default function AdminHeroSlidesPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [form, setForm] = useState({
    titleAr: '', titleEn: '',
    subtitleAr: '', subtitleEn: '',
    image: '', isPortrait: false, order: 0, isActive: true
  });

  const fetchSlides = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<HeroSlide[]>('/hero-slides/admin', token)
      .then(res => {
        setSlides(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch admin hero slides (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchSlides(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await api.patch(`/hero-slides/${editing.id}`, form, token);
    } else {
      await api.post('/hero-slides', form, token);
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    fetchSlides();
  };

  const resetForm = () => {
    setForm({
      titleAr: '', titleEn: '',
      subtitleAr: '', subtitleEn: '',
      image: '', isPortrait: false, order: 0, isActive: true
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this slide?')) {
      await api.delete(`/hero-slides/${id}`, token);
      fetchSlides();
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setForm({
      titleAr: slide.titleAr,
      titleEn: slide.titleEn,
      subtitleAr: slide.subtitleAr,
      subtitleEn: slide.subtitleEn,
      image: slide.image,
      isPortrait: slide.isPortrait,
      order: slide.order,
      isActive: slide.isActive
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hero Slides</h1>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">Manage the homepage slider content.</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="h-9 px-4 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={15} /> New Slide
        </button>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Arabic Content
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Title (AR)</label>
                  <Input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} placeholder="العنوان الرئيسي" className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Subtitle (AR)</label>
                  <Textarea value={form.subtitleAr} onChange={e => setForm({...form, subtitleAr: e.target.value})} placeholder="العنوان الفرعي" rows={3} className="rounded-xl text-[13px]" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> English Content
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Title (EN)</label>
                  <Input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} placeholder="Main Title" dir="ltr" className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Subtitle (EN)</label>
                  <Textarea value={form.subtitleEn} onChange={e => setForm({...form, subtitleEn: e.target.value})} placeholder="Subtitle" rows={3} dir="ltr" className="rounded-xl text-[13px]" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/60 dark:border-white/5">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Image URL</label>
                  <div className="flex gap-2">
                    <Input className="flex-1 rounded-xl text-[13px]" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="/images/..." dir="ltr" />
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="shrink-0 h-10 px-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-[12px] font-semibold text-slate-500 dark:text-white/35 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      {locale === 'ar' ? 'المكتبة' : 'Gallery'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Display Order</label>
                    <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} dir="ltr" className="rounded-xl text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Portrait Mode</label>
                    <button
                      type="button"
                      onClick={() => setForm({...form, isPortrait: !form.isPortrait})}
                      className={cn(
                        "w-full h-10 rounded-xl text-[12px] font-semibold border transition-all flex items-center justify-center gap-1.5",
                        form.isPortrait
                          ? "border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5"
                          : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/35 bg-slate-50 dark:bg-white/[0.02]"
                      )}
                    >
                      {form.isPortrait ? "Portrait" : "Landscape"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Status</label>
                <button
                  type="button"
                  onClick={() => setForm({...form, isActive: !form.isActive})}
                  className={cn(
                    "w-full h-10 rounded-xl text-[12px] font-semibold border transition-all flex items-center justify-center gap-2",
                    form.isActive
                      ? "border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5"
                      : "border-red-200 dark:border-red-500/20 text-red-500 bg-red-50 dark:bg-red-500/5"
                  )}
                >
                  {form.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {form.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
                </button>
                {form.image && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/5 aspect-video">
                    <img src={getMediaUrl(form.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/60 dark:border-white/5">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="h-9 px-4 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-white/35 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="h-9 px-6 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20">
                {editing ? 'Update Slide' : 'Create Slide'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url) => {
          setForm({ ...form, image: url });
          setShowPicker(false);
        }}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4" />
          <p className="text-[13px] font-semibold text-slate-500 dark:text-white/35">Loading slides...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200/60 dark:border-red-500/10">
          <p className="text-[13px] font-semibold text-red-500">Failed to load data</p>
          <button onClick={() => fetchSlides()} className="mt-3 h-8 px-4 rounded-xl text-[12px] font-semibold border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide, index) => (
            <motion.div key={slide.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: index * 0.05 }}>
              <div className={cn(
                "bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-indigo-500/20 dark:hover:border-indigo-500/10 transition-all",
                !slide.isActive && "opacity-60"
              )}>
                <div className="h-44 relative bg-slate-100 dark:bg-white/5 overflow-hidden">
                  {slide.image ? (
                    <img src={getMediaUrl(slide.image)} alt={slide.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-300 dark:text-white/10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {slide.isActive ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={11} /> Active
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <XCircle size={11} /> Inactive
                      </span>
                    )}
                    {slide.isPortrait && (
                      <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg">Portrait</span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-white/25 mb-1">Order: {slide.order}</div>
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{slide.titleAr}</h3>
                      <p className="text-[12px] text-slate-500 dark:text-white/35 font-medium mt-0.5" dir="ltr">{slide.titleEn}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(slide)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(slide.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-white/35 line-clamp-2">{slide.subtitleAr}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
