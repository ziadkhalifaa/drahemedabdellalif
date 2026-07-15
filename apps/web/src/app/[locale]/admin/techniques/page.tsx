'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';

import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Layout, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from '@/components/media-picker';
import { toast } from 'sonner';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface Technique {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  order: number;
  isActive: boolean;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
}

export default function AdminTechniquesPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Technique | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [form, setForm] = useState({
    slug: '',
    titleAr: '', titleEn: '',
    descriptionAr: '', descriptionEn: '',
    image: '', order: 0, isActive: true,
    metaTitleAr: '', metaTitleEn: '',
    metaDescriptionAr: '', metaDescriptionEn: ''
  });

  const fetchTechniques = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<Technique[]>('/techniques/admin', token)
      .then(res => {
        setTechniques(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch admin techniques (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchTechniques(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchTechniques(); }, [fetchTechniques]);

  const handleSave = async () => {
    if (!token) return;
    try {
      if (editing) {
        await api.patch(`/techniques/${editing.id}`, form, token);
        toast.success(locale === 'ar' ? 'تم تحديث التقنية بنجاح' : 'Technique updated successfully');
      } else {
        await api.post('/techniques', form, token);
        toast.success(locale === 'ar' ? 'تم إنشاء التقنية بنجاح' : 'Technique created successfully');
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchTechniques();
    } catch (err: any) {
      console.error(err);
      toast.error(locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Failed to save technique');
    }
  };

  const resetForm = () => {
    setForm({
      slug: '',
      titleAr: '', titleEn: '',
      descriptionAr: '', descriptionEn: '',
      image: '', order: 0, isActive: true,
      metaTitleAr: '', metaTitleEn: '',
      metaDescriptionAr: '', metaDescriptionEn: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this technique?')) {
      await api.delete(`/techniques/${id}`, token);
      fetchTechniques();
    }
  };

  const handleEdit = (technique: Technique) => {
    setEditing(technique);
    setForm({
      slug: technique.slug,
      titleAr: technique.titleAr,
      titleEn: technique.titleEn,
      descriptionAr: technique.descriptionAr || '',
      descriptionEn: technique.descriptionEn || '',
      image: technique.image || '',
      order: technique.order,
      isActive: technique.isActive,
      metaTitleAr: technique.metaTitleAr || '',
      metaTitleEn: technique.metaTitleEn || '',
      metaDescriptionAr: technique.metaDescriptionAr || '',
      metaDescriptionEn: technique.metaDescriptionEn || ''
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Medical Techniques</h1>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">Manage advanced medical techniques and equipment.</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="h-9 px-4 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={15} /> New Technique
        </button>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Layout size={16} className="text-indigo-500" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">{editing ? 'Edit Technique' : 'Add New Technique'}</h3>
                <p className="text-[11px] text-slate-400 dark:text-white/25">Fill in the details for the medical technique.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Arabic Content
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Title (AR)</label>
                  <Input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} placeholder="اسم التقنية" className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Description (AR)</label>
                  <Textarea value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})} placeholder="وصف التقنية" rows={3} className="rounded-xl text-[13px]" />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">SEO Settings (AR)</p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Title</label>
                    <Input value={form.metaTitleAr} onChange={e => setForm({...form, metaTitleAr: e.target.value})} placeholder="عنوان البحث" className="rounded-xl text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Description</label>
                    <Textarea value={form.metaDescriptionAr} onChange={e => setForm({...form, metaDescriptionAr: e.target.value})} placeholder="وصف البحث" rows={2} className="rounded-xl text-[13px]" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> English Content
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Title (EN)</label>
                  <Input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} placeholder="Technique Title" dir="ltr" className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Description (EN)</label>
                  <Textarea value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} placeholder="Technique Description" rows={3} dir="ltr" className="rounded-xl text-[13px]" />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">SEO Settings (EN)</p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Title</label>
                    <Input value={form.metaTitleEn} onChange={e => setForm({...form, metaTitleEn: e.target.value})} placeholder="Search Title" dir="ltr" className="rounded-xl text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Description</label>
                    <Textarea value={form.metaDescriptionEn} onChange={e => setForm({...form, metaDescriptionEn: e.target.value})} placeholder="Search Description" rows={2} dir="ltr" className="rounded-xl text-[13px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Slug (URL)</label>
                <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="e.g. holmium-laser" dir="ltr" className="rounded-xl text-[13px]" />
              </div>
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
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Order</label>
                  <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} dir="ltr" className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Status</label>
                  <button
                    type="button"
                    onClick={() => setForm({...form, isActive: !form.isActive})}
                    className={cn(
                      "w-full h-10 rounded-xl text-[12px] font-semibold border transition-all flex items-center justify-center gap-1.5",
                      form.isActive
                        ? "border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5"
                        : "border-red-200 dark:border-red-500/20 text-red-500 bg-red-50 dark:bg-red-500/5"
                    )}
                  >
                    {form.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/60 dark:border-white/5">
              <button onClick={() => setShowForm(false)} className="h-9 px-4 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-white/35 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="h-9 px-6 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20">
                {editing ? 'Update Technique' : 'Create Technique'}
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
          <p className="text-[13px] font-semibold text-slate-500 dark:text-white/35">Loading techniques...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200/60 dark:border-red-500/10">
          <p className="text-[13px] font-semibold text-red-500">Failed to load data</p>
          <button onClick={() => fetchTechniques()} className="mt-3 h-8 px-4 rounded-xl text-[12px] font-semibold border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {techniques.map((technique, index) => (
            <motion.div key={technique.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: index * 0.05 }}>
              <div className={cn(
                "bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 group hover:border-indigo-500/20 dark:hover:border-indigo-500/10 transition-all",
                !technique.isActive && "opacity-60"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <span className="text-[13px] font-bold text-indigo-500">{technique.order}</span>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{technique.titleAr}</h3>
                      <p className="text-[11px] text-slate-400 dark:text-white/25 font-medium" dir="ltr">{technique.titleEn}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(technique)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(technique.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-[12px] text-slate-500 dark:text-white/35 line-clamp-2 mb-4">{technique.descriptionAr}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/5">
                  <span className="text-[12px] font-mono text-slate-400 dark:text-white/25">/{technique.slug}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", technique.isActive ? "bg-emerald-500" : "bg-red-500")} />
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider">
                      {technique.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
