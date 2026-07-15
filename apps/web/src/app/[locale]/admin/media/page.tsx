'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus, Edit2, Trash2, Image as ImageIcon,
  Play, UploadCloud, Globe, Film
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminMediaPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    type: 'image',
    url: '',
    titleAr: '', titleEn: '',
    categoryAr: '', categoryEn: '',
    order: 0
  });

  const fetchItems = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<any[]>('/media/all', token)
      .then(res => {
        setItems(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch media items (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchItems(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob || file), 'image/webp', 0.90);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      let uploadFile: Blob | File = file;
      if (file.type.startsWith('image/')) {
        uploadFile = await compressImage(file);
      }

      const formData = new FormData();
      formData.append('file', uploadFile, file.name.split('.')[0] + '.webp');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      const data = await res.json();
      setForm({ ...form, url: data.url });
    } catch (error) {
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      if (editing) {
        await api.patch(`/media/${editing.id}`, form, token);
      } else {
        await api.post('/media', form, token);
      }
      toast.success(editing ? 'Media updated' : 'Media created');
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchItems();
    } catch { toast.error('Failed to save media'); }
  };

  const resetForm = () => {
    setForm({
      type: 'image',
      url: '',
      titleAr: '', titleEn: '',
      categoryAr: '', categoryEn: '',
      order: 0
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this media item?')) {
      try {
        await api.delete(`/media/${id}`, token);
        toast.success('Media deleted');
        fetchItems();
      } catch { toast.error('Failed to delete media'); }
    }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({
      type: item.type,
      url: item.url,
      titleAr: item.titleAr || '',
      titleEn: item.titleEn || '',
      categoryAr: item.categoryAr || '',
      categoryEn: item.categoryEn || '',
      order: item.order
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Media & Assets</h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35">Manage images and videos for the website gallery.</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={16} /> Add Media
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <ImageIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">{editing ? 'Edit Media Item' : 'New Media Asset'}</h3>
                <p className="text-[12px] text-slate-500 dark:text-white/35">Upload files or link external content.</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Asset Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setForm({ ...form, type: 'image' })}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all",
                        form.type === 'image'
                          ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-white/50 hover:border-indigo-500/30"
                      )}
                    >
                      <ImageIcon size={16} /> Image
                    </button>
                    <button
                      onClick={() => setForm({ ...form, type: 'video' })}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all",
                        form.type === 'video'
                          ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-white/50 hover:border-indigo-500/30"
                      )}
                    >
                      <Film size={16} /> Video
                    </button>
                  </div>
                </div>

                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    uploading
                      ? "bg-indigo-500 animate-pulse"
                      : "bg-indigo-500/10 text-indigo-500"
                  )}>
                    {uploading ? <UploadCloud size={24} className="text-white animate-bounce" /> : <UploadCloud size={24} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{uploading ? 'Uploading...' : 'Upload File'}</p>
                    <p className="text-[11px] text-slate-400 dark:text-white/25">Max 10MB. WEBP, JPG, MP4</p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept={form.type === 'image' ? 'image/*' : 'video/*'}
                  />
                  <button
                    disabled={uploading}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-700 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Select File
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Source URL</label>
                  <input
                    type="text"
                    placeholder="Automatic or manual link..."
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">
                      <Globe size={12} /> Arabic
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Title</label>
                      <input
                        type="text"
                        value={form.titleAr}
                        onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Category</label>
                      <input
                        type="text"
                        value={form.categoryAr}
                        onChange={(e) => setForm({ ...form, categoryAr: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">
                      <Globe size={12} /> English
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Title</label>
                      <input
                        type="text"
                        value={form.titleEn}
                        onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Category</label>
                      <input
                        type="text"
                        value={form.categoryEn}
                        onChange={(e) => setForm({ ...form, categoryEn: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full max-w-[120px] px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-slate-200/60 dark:border-white/5">
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 dark:text-white/35 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
              >
                {editing ? 'Update Item' : 'Add to Gallery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4" />
          <p className="text-[13px] font-bold text-slate-500 dark:text-white/35">Loading media items...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] border border-red-200/60 dark:border-red-500/10 rounded-2xl">
          <p className="text-[13px] font-bold text-red-500 mb-3">Failed to load data</p>
          <button onClick={fetchItems} className="px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Retry Now
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-white/5">
                {item.type === 'image' ? (
                  <img src={getMediaUrl(item.url)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                      <Play size={28} fill="white" className="text-white ml-0.5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Video</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[12px] font-bold hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[12px] font-bold hover:bg-red-500 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                <div className={cn("absolute top-3 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[11px] font-bold border border-white/10", isRTL ? "right-3" : "left-3")}>
                  {item.categoryEn || 'Uncategorized'}
                </div>

                <div className={cn("absolute top-3 px-2.5 py-1 rounded-lg bg-indigo-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase", isRTL ? "left-3" : "right-3")}>
                  {item.type}
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate mb-1">{item.titleAr}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-slate-500 dark:text-white/35">Order: {item.order}</span>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <ImageIcon size={36} className="text-slate-300 dark:text-white/15" />
              </div>
              <p className="text-[13px] font-bold text-slate-500 dark:text-white/35 mb-1">No media assets found</p>
              <p className="text-[12px] text-slate-400 dark:text-white/25">Start by uploading your first image or video.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
