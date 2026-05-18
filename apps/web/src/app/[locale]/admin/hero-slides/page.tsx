'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';

import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Image as ImageIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from '@/components/media-picker';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Hero Slides</h1>
          <p className="text-sm text-[var(--muted)]">Manage the homepage slider content.</p>
        </div>
        <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="gap-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
          <Plus size={16} /> New Slide
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 border-2 border-[var(--primary)]/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="font-bold border-b pb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Arabic Content</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Title (AR)</label>
                    <Input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} placeholder="العنوان الرئيسي" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Subtitle (AR)</label>
                    <Textarea value={form.subtitleAr} onChange={e => setForm({...form, subtitleAr: e.target.value})} placeholder="العنوان الفرعي" rows={3} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold border-b pb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> English Content</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Title (EN)</label>
                    <Input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} placeholder="Main Title" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Subtitle (EN)</label>
                    <Textarea value={form.subtitleEn} onChange={e => setForm({...form, subtitleEn: e.target.value})} placeholder="Subtitle" rows={3} dir="ltr" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Image URL</label>
                  <div className="flex gap-2">
                    <Input className="flex-1" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="/images/..." dir="ltr" />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPicker(true)}
                      className="shrink-0 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <ImageIcon size={18} className="mr-2" />
                      {locale === 'ar' ? 'المكتبة' : 'Gallery'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Display Order</label>
                    <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} dir="ltr" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Portrait Mode</label>
                    <Button 
                      type="button"
                      variant={form.isPortrait ? "default" : "outline"} 
                      onClick={() => setForm({...form, isPortrait: !form.isPortrait})}
                      className={form.isPortrait ? "bg-amber-500 hover:bg-amber-600 border-none w-full" : "w-full"}
                    >
                      {form.isPortrait ? "Portrait" : "Landscape"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Status</label>
                <Button 
                  type="button"
                  variant={form.isActive ? "default" : "outline"} 
                  onClick={() => setForm({...form, isActive: !form.isActive})}
                  className={form.isActive ? "bg-green-500 hover:bg-green-600 border-none w-full" : "w-full text-red-500 border-red-200 hover:bg-red-50"}
                >
                  {form.isActive ? "Active (Visible)" : "Inactive (Hidden)"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-8">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] px-8">
                {editing ? 'Update Slide' : 'Create Slide'}
              </Button>
            </div>
          </div>
        </Card>
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
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold">Loading slides...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <p className="font-bold">Failed to load data</p>
          <Button variant="outline" onClick={fetchSlides} className="mt-4">Retry Now</Button>
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((slide) => (
          <Card key={slide.id} className={cn("overflow-hidden border-2 transition-all group", slide.isActive ? "border-transparent" : "border-red-100 opacity-75")}>
            <div className="h-48 relative bg-slate-100 overflow-hidden">
               {slide.image ? (
                  <img src={getMediaUrl(slide.image)} alt={slide.titleEn} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                     <ImageIcon size={48} />
                  </div>
               )}
               <div className="absolute top-3 left-3 flex gap-2">
                 {slide.isActive ? (
                   <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>
                 ) : (
                   <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1"><XCircle size={12}/> Inactive</span>
                 )}
                 {slide.isPortrait && (
                   <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1">Portrait</span>
                 )}
               </div>
            </div>
            
            <div className="p-5 relative">
              <div className="absolute -top-10 right-4 bg-white dark:bg-black rounded-lg shadow-lg border p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)} className="h-8 w-8 text-blue-500 bg-blue-50 hover:bg-blue-100"><Edit2 size={14}/></Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)} className="h-8 w-8 text-red-500 bg-red-50 hover:bg-red-100"><Trash2 size={14}/></Button>
              </div>

              <div className="text-xs font-bold text-[var(--muted)] mb-1">Order: {slide.order}</div>
              <h3 className="font-bold text-lg leading-tight mb-1">{slide.titleAr}</h3>
              <h4 className="text-sm font-medium text-[var(--muted)] line-clamp-1 mb-2" dir="ltr">{slide.titleEn}</h4>
              <p className="text-xs text-[var(--muted)] line-clamp-2">{slide.subtitleAr}</p>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
