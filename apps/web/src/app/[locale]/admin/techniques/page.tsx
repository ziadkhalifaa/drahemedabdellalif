'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';

import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Layout } from 'lucide-react';

interface Technique {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
}

export default function AdminTechniquesPage() {
  const { token } = useAuth();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Technique | null>(null);
  
  const [form, setForm] = useState({ 
    slug: '',
    titleAr: '', titleEn: '', 
    descriptionAr: '', descriptionEn: '', 
    icon: 'Stethoscope', image: '', order: 0, isActive: true 
  });

  const fetchTechniques = () => {
    if (token) api.get<Technique[]>('/techniques/admin', token).then(setTechniques).catch(() => {});
  };

  useEffect(() => { fetchTechniques(); }, [token]);

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await api.patch(`/techniques/${editing.id}`, form, token);
    } else {
      await api.post('/techniques', form, token);
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    fetchTechniques();
  };

  const resetForm = () => {
    setForm({ 
      slug: '',
      titleAr: '', titleEn: '', 
      descriptionAr: '', descriptionEn: '', 
      icon: 'Stethoscope', image: '', order: 0, isActive: true 
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
      icon: technique.icon || 'Stethoscope',
      image: technique.image || '',
      order: technique.order,
      isActive: technique.isActive
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Medical Techniques</h1>
          <p className="text-sm text-[var(--muted)]">Manage advanced medical techniques and equipment.</p>
        </div>
        <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="gap-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
          <Plus size={16} /> New Technique
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 border-2 border-[var(--primary)]/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <Layout size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{editing ? 'Edit Technique' : 'Add New Technique'}</h3>
                <p className="text-xs text-[var(--muted)]">Fill in the details for the medical technique.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="font-bold border-b pb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Arabic Content</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Title (AR)</label>
                    <Input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} placeholder="اسم التقنية" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Description (AR)</label>
                    <Textarea value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})} placeholder="وصف التقنية" rows={4} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold border-b pb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> English Content</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Title (EN)</label>
                    <Input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} placeholder="Technique Title" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Description (EN)</label>
                    <Textarea value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} placeholder="Technique Description" rows={4} dir="ltr" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Slug (URL)</label>
                  <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="e.g. holmium-laser" dir="ltr" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Icon Name</label>
                    <Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="Lucide icon name" dir="ltr" />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase mb-1 block">Order</label>
                    <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} dir="ltr" />
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
                {editing ? 'Update Technique' : 'Create Technique'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {techniques.map((technique) => (
          <Card key={technique.id} className={cn("p-5 relative transition-all group", technique.isActive ? "" : "opacity-60 bg-gray-50 dark:bg-gray-900")}>
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(technique)} className="h-8 w-8 text-blue-500 bg-blue-50 hover:bg-blue-100"><Edit2 size={14}/></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(technique.id)} className="h-8 w-8 text-red-500 bg-red-50 hover:bg-red-100"><Trash2 size={14}/></Button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <span className="font-bold">{technique.order}</span>
              </div>
              <div>
                <h3 className="font-bold">{technique.titleAr}</h3>
                <h4 className="text-xs text-[var(--muted)]" dir="ltr">{technique.titleEn}</h4>
              </div>
            </div>
            
            <p className="text-sm text-[var(--muted)] line-clamp-2 mb-4">{technique.descriptionAr}</p>
            
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--primary)] font-mono">/{technique.slug}</span>
              {technique.isActive ? (
                <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> Active</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><XCircle size={14}/> Inactive</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
