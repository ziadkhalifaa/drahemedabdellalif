'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';
import { 
  Plus, Edit2, Trash2, Image as ImageIcon, 
  Play, UploadCloud, Globe, Layout, 
  Film, Filter, MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminMediaPage() {
  const { token } = useAuth();
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/media/upload`, {
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
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await api.patch(`/media/${editing.id}`, form, token);
    } else {
      await api.post('/media', form, token);
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    fetchItems();
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
      await api.delete(`/media/${id}`, token);
      fetchItems();
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Media & Assets</h1>
          <p className="text-sm text-[var(--muted)]">Manage images and videos for the website gallery.</p>
        </div>
        <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="gap-2 bg-[var(--primary)]">
          <Plus size={16} /> Add Media
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 border-2 border-[var(--primary)]/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <ImageIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{editing ? 'Edit Media Item' : 'New Media Asset'}</h3>
                <p className="text-xs text-[var(--muted)]">Upload files or link external content.</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Asset Type</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setForm({...form, type: 'image'})}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
                        form.type === 'image' ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20" : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/5"
                      )}
                    >
                      <ImageIcon size={16} /> Image
                    </button>
                    <button 
                      onClick={() => setForm({...form, type: 'video'})}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
                        form.type === 'video' ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20" : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/5"
                      )}
                    >
                      <Film size={16} /> Video
                    </button>
                  </div>
                </div>

                <div className="p-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-center gap-4 bg-gray-50/50 dark:bg-white/5">
                   <div className={cn(
                     "w-12 h-12 rounded-full flex items-center justify-center",
                     uploading ? "bg-blue-500 animate-spin" : "bg-[var(--primary)]/10 text-[var(--primary)]"
                   )}>
                     {uploading ? <UploadCloud size={24} className="text-white" /> : <UploadCloud size={24} />}
                   </div>
                   <div className="space-y-1">
                     <p className="text-sm font-bold">{uploading ? 'Uploading...' : 'Upload File'}</p>
                     <p className="text-[10px] text-[var(--muted)]">Max size: 10MB. Formats: WEBP, JPG, MP4</p>
                   </div>
                   <input 
                     type="file" 
                     id="file-upload" 
                     className="hidden" 
                     onChange={handleFileUpload}
                     accept={form.type === 'image' ? 'image/*' : 'video/*'}
                   />
                   <Button 
                     variant="outline" 
                     size="sm" 
                     disabled={uploading}
                     onClick={() => document.getElementById('file-upload')?.click()}
                   >
                     Select File
                   </Button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Input label="Source URL" placeholder="Automatic or manual link..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--muted)]"><Globe size={12}/> Arabic</div>
                    <Input label="Title" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
                    <Input label="Category" value={form.categoryAr} onChange={(e) => setForm({ ...form, categoryAr: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--muted)]"><Globe size={12}/> English</div>
                    <Input label="Title" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
                    <Input label="Category" value={form.categoryEn} onChange={(e) => setForm({ ...form, categoryEn: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-6 border-t">
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={handleSave} className="px-10">{editing ? 'Update Item' : 'Add to Gallery'}</Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold">Loading media items...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <p className="font-bold">Failed to load data</p>
          <Button variant="outline" onClick={fetchItems} className="mt-4">Retry Now</Button>
        </div>
      ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="p-0 group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-[#0f172a]">
             <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-white/5">
                {item.type === 'image' ? (
                  <img src={getMediaUrl(item.url)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#072a44] text-white">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <Play size={32} fill="white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Video Content</span>
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                   <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-[var(--primary)]" onClick={() => handleEdit(item)}>
                     <Edit2 size={16} />
                   </Button>
                   <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-red-500" onClick={() => handleDelete(item.id)}>
                     <Trash2 size={16} />
                   </Button>
                </div>

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-tighter border border-white/10">
                   {item.categoryEn || 'Uncategorized'}
                </div>
             </div>
             
             <div className="p-4">
                <h4 className="text-sm font-bold text-[var(--foreground)] truncate mb-1">{item.titleAr}</h4>
                <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
                  <span className="capitalize">{item.type}</span>
                  <span>Order: {item.order}</span>
                </div>
             </div>
          </Card>
        ))}
        {items.length === 0 && (
           <div className="col-span-full py-32 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300">
                <ImageIcon size={40} />
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--muted)]">No media assets found</p>
                <p className="text-sm text-[var(--muted)] opacity-60">Start by uploading your first image or video.</p>
              </div>
            </div>
         )}
      </div>
      )}
    </div>
  );
}
