'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';
import type { Service } from '@dr-ahmed/shared';

import { Plus, Edit2, Trash2, Package, Globe, Layout, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from '@/components/media-picker';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminServicesPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [form, setForm] = useState({
    titleAr: '', titleEn: '',
    descriptionAr: '', descriptionEn: '',
    icon: 'Stethoscope', image: '', order: 0, isActive: true,
    metaTitleAr: '', metaTitleEn: '',
    metaDescriptionAr: '', metaDescriptionEn: ''
  });


  const fetchServices = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<Service[]>('/services/all', token)
      .then(res => {
        setServices(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch admin services (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchServices(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await api.patch(`/services/${editing.id}`, form, token);
    } else {
      await api.post('/services', form, token);
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    fetchServices();
  };

  const resetForm = () => {
    setForm({
      titleAr: '', titleEn: '',
      descriptionAr: '', descriptionEn: '',
      icon: 'Stethoscope', image: '', order: 0, isActive: true,
      metaTitleAr: '', metaTitleEn: '',
      metaDescriptionAr: '', metaDescriptionEn: ''
    });
  };


  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this service?')) {
      await api.delete(`/services/${id}`, token);
      fetchServices();
    }
  };

  const handleEdit = (service: Service) => {
    setEditing(service);
    setForm({
      titleAr: service.titleAr,
      titleEn: service.titleEn,
      descriptionAr: service.descriptionAr,
      descriptionEn: service.descriptionEn,
      icon: service.icon,
      image: service.image || '',
      order: service.order,
      isActive: service.isActive,
      metaTitleAr: service.metaTitleAr || '',
      metaTitleEn: service.metaTitleEn || '',
      metaDescriptionAr: service.metaDescriptionAr || '',
      metaDescriptionEn: service.metaDescriptionEn || ''
    });
    setShowForm(true);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Medical Services</h1>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">Manage clinical departments and services offered.</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="h-9 px-4 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={15} /> New Service
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
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">{editing ? 'Edit Service' : 'Add New Service'}</h3>
                <p className="text-[11px] text-slate-400 dark:text-white/25">Fill in the details for the medical service.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/25">
                  <Globe size={13} /> Arabic Content
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Title (AR)</label>
                  <Input placeholder="اسم الخدمة باللغة العربية" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Description (AR)</label>
                  <Textarea placeholder="وصف الخدمة باللغة العربية..." rows={3} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} className="rounded-xl text-[13px]" />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">SEO (AR)</p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Title</label>
                    <Input placeholder="عنوان البحث" value={form.metaTitleAr} onChange={(e) => setForm({ ...form, metaTitleAr: e.target.value })} className="rounded-xl text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Description</label>
                    <Textarea placeholder="وصف البحث المختصر" rows={2} value={form.metaDescriptionAr} onChange={(e) => setForm({ ...form, metaDescriptionAr: e.target.value })} className="rounded-xl text-[13px]" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/25">
                  <Globe size={13} /> English Content
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Title (EN)</label>
                  <Input placeholder="Service name in English" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="rounded-xl text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Description (EN)</label>
                  <Textarea placeholder="Service description in English..." rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="rounded-xl text-[13px]" />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">SEO (EN)</p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Title</label>
                    <Input placeholder="Search Title" value={form.metaTitleEn} onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })} className="rounded-xl text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Meta Description</label>
                    <Textarea placeholder="Short search description" rows={2} value={form.metaDescriptionEn} onChange={(e) => setForm({ ...form, metaDescriptionEn: e.target.value })} className="rounded-xl text-[13px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4 pt-4 border-t border-slate-200/60 dark:border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Icon Name</label>
                <Input placeholder="e.g., Stethoscope" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="rounded-xl text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Image URL</label>
                <div className="flex gap-2">
                  <Input placeholder="/images/..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-xl text-[13px] flex-1" />
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
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Display Order</label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="rounded-xl text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 block">Status</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={cn(
                    "w-full h-10 rounded-xl text-[12px] font-semibold border transition-all flex items-center justify-center gap-2",
                    form.isActive
                      ? "border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5"
                      : "border-red-200 dark:border-red-500/20 text-red-500 bg-red-50 dark:bg-red-500/5"
                  )}
                >
                  {form.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {form.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-200/60 dark:border-white/5">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="h-9 px-4 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-white/35 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="h-9 px-6 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20">
                {editing ? 'Save Changes' : 'Create Service'}
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
          <p className="text-[13px] font-semibold text-slate-500 dark:text-white/35">Loading services...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200/60 dark:border-red-500/10">
          <p className="text-[13px] font-semibold text-red-500">Failed to load data</p>
          <button onClick={() => fetchServices()} className="mt-3 h-8 px-4 rounded-xl text-[12px] font-semibold border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div key={service.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: index * 0.05 }}>
              <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-indigo-500/20 dark:hover:border-indigo-500/10 transition-all">
                {service.image && (
                  <div className="aspect-video w-full overflow-hidden border-b border-slate-200/60 dark:border-white/5">
                    <img src={getMediaUrl(service.image)} alt={service.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <Package size={18} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(service)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{service.titleAr}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-white/25 font-medium mt-0.5">{service.titleEn}</p>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-white/35 line-clamp-2 leading-relaxed mb-4">
                    {service.descriptionEn}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full", service.isActive ? "bg-emerald-500" : "bg-red-500")} />
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider">
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-white/25 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      #{service.order}
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
