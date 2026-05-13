'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';
import type { BlogPost } from '@dr-ahmed/shared';
import { 
  Plus, Edit2, Trash2, FileText, Globe, 
  Search, Eye, Settings, Image as ImageIcon,
  ChevronLeft, Save, X, Sparkles, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { MediaPickerModal } from '@/components/media-picker';

export default function AdminBlogPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeLang, setActiveLang] = useState<'ar' | 'en'>('ar');
  const [showSEO, setShowSEO] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    titleAr: '', titleEn: '',
    slugAr: '', slugEn: '',
    contentAr: '', contentEn: '',
    excerptAr: '', excerptEn: '',
    metaTitleAr: '', metaTitleEn: '',
    metaDescriptionAr: '', metaDescriptionEn: '',
    keywords: '',
    status: 'draft' as 'draft' | 'published',
    featuredImage: ''
  });

  const fetchPosts = () => {
    if (token) api.get<BlogPost[]>('/blog', token).then(setPosts).catch(() => {});
  };

  useEffect(() => { fetchPosts(); }, [token]);

  const handleSave = async (statusOverride?: 'draft' | 'published') => {
    if (!token) return;
    setIsSaving(true);
    try {
      const payload = { ...form, status: statusOverride || form.status };
      if (editing) {
        await api.patch(`/blog/${editing.id}`, payload, token);
      } else {
        await api.post('/blog', payload, token);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      titleAr: '', titleEn: '',
      slugAr: '', slugEn: '',
      contentAr: '', contentEn: '',
      excerptAr: '', excerptEn: '',
      metaTitleAr: '', metaTitleEn: '',
      metaDescriptionAr: '', metaDescriptionEn: '',
      keywords: '',
      status: 'draft',
      featuredImage: ''
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      titleAr: post.titleAr, titleEn: post.titleEn,
      slugAr: post.slugAr, slugEn: post.slugEn,
      contentAr: post.contentAr, contentEn: post.contentEn,
      excerptAr: post.excerptAr || '', excerptEn: post.excerptEn || '',
      metaTitleAr: post.metaTitleAr || '', metaTitleEn: post.metaTitleEn || '',
      metaDescriptionAr: post.metaDescriptionAr || '', metaDescriptionEn: post.metaDescriptionEn || '',
      keywords: post.keywords || '',
      status: (post.status as any) || 'draft',
      featuredImage: (post as any).featuredImage || ''
    });
    setShowForm(true);
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm('Delete this post permanently?')) {
      await api.delete(`/blog/${id}`, token);
      fetchPosts();
    }
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 z-[50] bg-[var(--background)] flex flex-col animate-in fade-in duration-300">
        {/* Editor Header */}
        <header className="h-20 border-b bg-white dark:bg-[#0f172a] flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setShowForm(false); setEditing(null); }} 
              className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="font-black text-xl tracking-tight uppercase">
                {editing ? 'Edit Article' : 'New Masterpiece'}
              </h2>
              <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={10} className="text-amber-500" /> Professional Editor Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl shadow-inner">
              <button 
                onClick={() => setActiveLang('ar')} 
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all",
                  activeLang === 'ar' ? "bg-white dark:bg-white/10 shadow-md text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >العربية</button>
              <button 
                onClick={() => setActiveLang('en')} 
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all",
                  activeLang === 'en' ? "bg-white dark:bg-white/10 shadow-md text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >ENGLISH</button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setShowSEO(!showSEO)} 
              className={cn("gap-2 rounded-xl px-4 h-11 font-bold", showSEO && "bg-[var(--primary)]/10 text-[var(--primary)]")}
            >
              <Settings size={18} /> SEO
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="h-11 rounded-xl px-6 font-bold border-2"
            >
              Save Draft
            </Button>
            
            <Button 
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white gap-2 px-8 h-11 rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20"
            >
              <Globe size={18} /> {isSaving ? 'Publishing...' : 'Publish Now'}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <main className={cn(
            "flex-1 overflow-y-auto p-12 transition-all duration-500",
            showSEO ? "mr-[450px]" : "mr-0"
          )}>
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
              
              {/* Title Input */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  {activeLang === 'ar' ? 'عنوان المقال' : 'Article Title'}
                </label>
                <input 
                  type="text"
                  placeholder={activeLang === 'ar' ? "أدخل العنوان هنا..." : "Enter a catchy title..."}
                  value={activeLang === 'ar' ? form.titleAr : form.titleEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeLang === 'ar') {
                      setForm({ ...form, titleAr: val, slugAr: generateSlug(val) });
                    } else {
                      setForm({ ...form, titleEn: val, slugEn: generateSlug(val) });
                    }
                  }}
                  className={cn(
                    "w-full bg-transparent border-none focus:ring-0 text-5xl font-black p-0 placeholder:text-gray-200 dark:placeholder:text-white/5",
                    activeLang === 'ar' && "text-right"
                  )}
                  dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Featured Image Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                  <ImageIcon size={14} /> Featured Image
                </label>
                {form.featuredImage ? (
                  <div className="relative group aspect-video rounded-[2rem] overflow-hidden border-4 border-white dark:border-white/10 shadow-2xl">
                    <img src={getMediaUrl(form.featuredImage)} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Button variant="outline" className="bg-white border-none text-black hover:bg-gray-100" onClick={() => setShowMediaModal(true)}>Change Image</Button>
                      <Button variant="danger" onClick={() => setForm({ ...form, featuredImage: '' })}>Remove</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMediaModal(true)}
                    className="w-full aspect-video bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border-4 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Plus size={32} className="text-[var(--primary)]" />
                    </div>
                    <div className="text-center">
                       <p className="font-black text-lg">Click to Add Featured Image</p>
                       <p className="text-xs text-[var(--muted)]">Recommended size: 1200x630px</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Tiptap Editor */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  {activeLang === 'ar' ? 'محتوى المقال' : 'Content Body'}
                </label>
                <div key={activeLang} dir={activeLang === 'ar' ? 'rtl' : 'ltr'}>
                  <TiptapEditor 
                    content={activeLang === 'ar' ? form.contentAr : form.contentEn}
                    onChange={(html) => {
                      if (activeLang === 'ar') setForm({ ...form, contentAr: html });
                      else setForm({ ...form, contentEn: html });
                    }}
                    className={activeLang === 'ar' ? 'text-right' : 'text-left'}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-4 pt-10">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  {activeLang === 'ar' ? 'مقتطف قصير (للمعاينة)' : 'Short Excerpt'}
                </label>
                <Textarea 
                  placeholder="Write a brief summary for the blog list page..."
                  value={activeLang === 'ar' ? form.excerptAr : form.excerptEn}
                  onChange={(e) => {
                    if (activeLang === 'ar') setForm({ ...form, excerptAr: e.target.value });
                    else setForm({ ...form, excerptEn: e.target.value });
                  }}
                  className="rounded-3xl p-6 text-sm"
                  rows={3}
                />
              </div>
            </div>
          </main>

          {/* SEO Sidebar */}
          <aside className={cn(
            "fixed top-20 right-0 bottom-0 w-[450px] bg-white dark:bg-[#0f172a] border-l shadow-2xl transition-transform duration-500 z-20 overflow-y-auto p-8 custom-scrollbar",
            showSEO ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-lg uppercase flex items-center gap-2">
                <Search size={20} className="text-[var(--primary)]" /> SEO Expert Panel
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowSEO(false)}><X size={20} /></Button>
            </div>

            <div className="space-y-10">
              {/* Google Preview */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Search Result Preview</label>
                <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-1">
                  <div className="text-[#1a0dab] dark:text-blue-400 text-xl font-medium truncate">
                    { (activeLang === 'ar' ? form.metaTitleAr : form.metaTitleEn) || (activeLang === 'ar' ? form.titleAr : form.titleEn) || 'Untiltled Post' }
                  </div>
                  <div className="text-[#006621] dark:text-emerald-500 text-sm truncate">
                    drahmedabdellatif.com › blog › { (activeLang === 'ar' ? form.slugAr : form.slugEn) || 'slug' }
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    { (activeLang === 'ar' ? form.metaDescriptionAr : form.metaDescriptionEn) || (activeLang === 'ar' ? form.excerptAr : form.excerptEn) || 'Add a meta description to see how this looks in search.' }
                  </div>
                </div>
              </div>

              {/* URL Slug */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">URL SLUG (PERMALINK)</label>
                <div className="relative">
                  <Input 
                    value={activeLang === 'ar' ? form.slugAr : form.slugEn}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
                      if (activeLang === 'ar') setForm({ ...form, slugAr: val });
                      else setForm({ ...form, slugEn: val });
                    }}
                    className="pl-10 font-mono text-xs rounded-xl h-12"
                  />
                  <Globe className="absolute left-3 top-3.5 text-gray-400" size={16} />
                </div>
              </div>

              {/* Meta Titles */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Meta Title ({activeLang.toUpperCase()})</label>
                <Input 
                  value={activeLang === 'ar' ? form.metaTitleAr : form.metaTitleEn}
                  onChange={(e) => {
                    if (activeLang === 'ar') setForm({ ...form, metaTitleAr: e.target.value });
                    else setForm({ ...form, metaTitleEn: e.target.value });
                  }}
                  className="rounded-xl h-12"
                  maxLength={60}
                />
                <p className="text-[10px] text-right text-[var(--muted)]">Recommended: 50-60 characters</p>
              </div>

              {/* Meta Description */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Meta Description ({activeLang.toUpperCase()})</label>
                <Textarea 
                  value={activeLang === 'ar' ? form.metaDescriptionAr : form.metaDescriptionEn}
                  onChange={(e) => {
                    if (activeLang === 'ar') setForm({ ...form, metaDescriptionAr: e.target.value });
                    else setForm({ ...form, metaDescriptionEn: e.target.value });
                  }}
                  className="rounded-xl p-4 text-sm resize-none"
                  rows={4}
                  maxLength={160}
                />
                <p className="text-[10px] text-right text-[var(--muted)]">Recommended: 150-160 characters</p>
              </div>

              {/* Keywords */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">SEO Keywords (Comma separated)</label>
                <Input 
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="rounded-xl h-12"
                  placeholder="urology, clinic, surgery..."
                />
              </div>
            </div>
          </aside>
        </div>

        <MediaPickerModal 
          isOpen={showMediaModal} 
          onClose={() => setShowMediaModal(false)} 
          onSelect={(url) => setForm({ ...form, featuredImage: url })} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Blog Management</h1>
          <p className="text-sm text-[var(--muted)] flex items-center gap-2">
            <LayoutDashboard size={14} /> Total Articles: <span className="text-[var(--primary)] font-bold">{posts.length}</span>
          </p>
        </div>
        <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="gap-2 bg-[var(--primary)] h-12 px-8 rounded-2xl font-black shadow-xl shadow-[var(--primary)]/20 uppercase tracking-widest text-xs">
          <Plus size={18} /> New Article
        </Button>
      </div>

      {/* List Card */}
      <Card className="overflow-hidden border-none shadow-2xl bg-white/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-6 font-black text-[var(--muted)] uppercase text-[10px] tracking-[0.2em]">Article</th>
                <th className="px-8 py-6 font-black text-[var(--muted)] uppercase text-[10px] tracking-[0.2em]">Slug / Link</th>
                <th className="px-8 py-6 font-black text-[var(--muted)] uppercase text-[10px] tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 font-black text-[var(--muted)] uppercase text-[10px] tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 dark:border-white/10 shadow-sm">
                        { (post as any).featuredImage ? (
                          <img src={getMediaUrl((post as any).featuredImage)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{post.titleAr}</p>
                        <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">{post.titleEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                      <Search size={12} className="text-[var(--primary)]" />
                      {post.slugEn}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block shadow-sm",
                      post.status === 'published' ? "bg-emerald-100 text-emerald-700 shadow-emerald-500/10" : "bg-gray-100 text-gray-500 shadow-gray-500/10"
                    )}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(post)} className="h-10 w-10 p-0 rounded-xl hover:bg-blue-500/10 hover:text-blue-600">
                        <Edit2 size={18} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} className="h-10 w-10 p-0 rounded-xl hover:bg-red-500/10 text-red-500">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                         <FileText size={48} />
                       </div>
                       <div>
                         <p className="font-black text-xl text-[var(--foreground)]">No Articles Found</p>
                         <p className="text-sm text-[var(--muted)]">Start by creating your first medical article today.</p>
                       </div>
                       <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 rounded-xl px-10 h-12 font-bold">Create Article</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
