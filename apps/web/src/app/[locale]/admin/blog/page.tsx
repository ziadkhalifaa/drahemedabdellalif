'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api, getMediaUrl } from '@/lib/api';
import type { BlogPost } from '@dr-ahmed/shared';
import {
  Plus, Edit2, Trash2, FileText, Globe,
  Search, Settings, Image as ImageIcon,
  ChevronLeft, Save, X, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { MediaPickerModal } from '@/components/media-picker';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminBlogPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
    featuredImage: '',
    showOnHomepage: false
  });

  const fetchPosts = useCallback((attempt = 1) => {
    if (!token) return;
    setLoading(attempt === 1);
    setError(false);
    api.get<any>('/blog', token)
      .then(res => {
        setPosts(Array.isArray(res) ? res : (res?.data || []));
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch blog posts (attempt ${attempt}):`, err);
        if (attempt < 2) {
          setTimeout(() => fetchPosts(attempt + 1), 1500);
        } else {
          setError(true);
          setLoading(false);
        }
      });
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

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
      featuredImage: '',
      showOnHomepage: false
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
      status: post.status || 'draft',
      featuredImage: post.featuredImage || '',
      showOnHomepage: post.showOnHomepage || false
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
      <div className="fixed inset-0 z-[50] bg-white dark:bg-[#0a0a0f] flex flex-col">
        {/* Editor Header */}
        <header className="h-16 border-b border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111827] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-white/35"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {editing ? 'Edit Article' : 'New Article'}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-white/25 font-medium">
                {editing ? 'Modify your article content' : 'Create a new blog article'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveLang('ar')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                  activeLang === 'ar' ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50"
                )}
              >العربية</button>
              <button
                onClick={() => setActiveLang('en')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                  activeLang === 'en' ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50"
                )}
              >English</button>
            </div>

            <button
              onClick={() => setShowSEO(!showSEO)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all",
                showSEO
                  ? "bg-indigo-500/10 text-indigo-500"
                  : "text-slate-500 dark:text-white/35 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Settings size={15} /> SEO
            </button>

            <div className="w-px h-6 bg-slate-200 dark:border-white/5" />

            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="h-9 px-4 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="h-9 px-5 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all disabled:opacity-50 shadow-sm shadow-indigo-500/20"
            >
              {isSaving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <main className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            showSEO ? (isRTL ? "ml-[420px]" : "mr-[420px]") : (isRTL ? "ml-0" : "mr-0")
          )}>
            <div className="max-w-4xl mx-auto px-12 py-16 space-y-14 pb-24">
              {/* Title Input */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">
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
                    "w-full bg-transparent border-none focus:ring-0 text-4xl font-bold text-slate-900 dark:text-white p-0 placeholder:text-slate-300 dark:placeholder:text-white/10",
                    activeLang === 'ar' && "text-right"
                  )}
                  dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Featured Image Section */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ImageIcon size={13} /> Featured Image
                </label>
                {form.featuredImage ? (
                  <div className="relative group aspect-video rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5">
                    <img src={getMediaUrl(form.featuredImage)} alt="Featured" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={() => setShowMediaModal(true)} className="px-4 py-2 rounded-xl bg-white text-slate-900 text-[13px] font-semibold hover:bg-slate-100 transition-colors">
                        Change Image
                      </button>
                      <button onClick={() => setForm({ ...form, featuredImage: '' })} className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMediaModal(true)}
                    className="w-full aspect-video bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Plus size={24} className="text-indigo-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Click to Add Featured Image</p>
                      <p className="text-[12px] text-slate-400 dark:text-white/25 mt-1">Recommended size: 1200x630px</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Tiptap Editor */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">
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
                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">
                  {activeLang === 'ar' ? 'مقتطف قصير (للمعاينة)' : 'Short Excerpt'}
                </label>
                <Textarea
                  placeholder="Write a brief summary for the blog list page..."
                  value={activeLang === 'ar' ? form.excerptAr : form.excerptEn}
                  onChange={(e) => {
                    if (activeLang === 'ar') setForm({ ...form, excerptAr: e.target.value });
                    else setForm({ ...form, excerptEn: e.target.value });
                  }}
                  className="rounded-xl p-4 text-[13px]"
                  rows={3}
                />
              </div>
            </div>
          </main>

          {/* SEO Sidebar */}
          <aside className={cn(
            "fixed top-16 right-0 bottom-0 w-[420px] bg-white dark:bg-[#111827] border-l border-slate-200/60 dark:border-white/5 transition-transform duration-300 z-20 overflow-y-auto custom-scrollbar",
            showSEO ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search size={16} className="text-indigo-500" /> SEO Settings
                </h3>
                <button onClick={() => setShowSEO(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-white/25">
                  <X size={16} />
                </button>
              </div>

              {/* Google Preview */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">Search Preview</label>
                <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-1">
                  <div className="text-[#1a0dab] dark:text-blue-400 text-[15px] font-medium truncate">
                    {(activeLang === 'ar' ? form.metaTitleAr : form.metaTitleEn) || (activeLang === 'ar' ? form.titleAr : form.titleEn) || 'Untitled Post'}
                  </div>
                  <div className="text-[#006621] dark:text-emerald-400 text-[12px] truncate">
                    drahmedabdellatif.com › blog › {(activeLang === 'ar' ? form.slugAr : form.slugEn) || 'slug'}
                  </div>
                  <div className="text-slate-500 dark:text-white/35 text-[12px] line-clamp-2">
                    {(activeLang === 'ar' ? form.metaDescriptionAr : form.metaDescriptionEn) || (activeLang === 'ar' ? form.excerptAr : form.excerptEn) || 'Add a meta description to see how this looks in search.'}
                  </div>
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">URL Slug</label>
                <div className="relative">
                  <Input
                    value={activeLang === 'ar' ? form.slugAr : form.slugEn}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
                      if (activeLang === 'ar') setForm({ ...form, slugAr: val });
                      else setForm({ ...form, slugEn: val });
                    }}
                    className="pl-9 font-mono text-[12px] rounded-xl h-10"
                  />
                  <Globe className="absolute left-3 top-2.5 text-slate-400 dark:text-white/25" size={14} />
                </div>
              </div>

              {/* Meta Titles */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">Meta Title ({activeLang.toUpperCase()})</label>
                <Input
                  value={activeLang === 'ar' ? form.metaTitleAr : form.metaTitleEn}
                  onChange={(e) => {
                    if (activeLang === 'ar') setForm({ ...form, metaTitleAr: e.target.value });
                    else setForm({ ...form, metaTitleEn: e.target.value });
                  }}
                  className="rounded-xl h-10 text-[13px]"
                  maxLength={60}
                />
                <p className="text-[11px] text-slate-400 dark:text-white/25 mt-2">Recommended: 50-60 characters</p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">Meta Description ({activeLang.toUpperCase()})</label>
                <Textarea
                  value={activeLang === 'ar' ? form.metaDescriptionAr : form.metaDescriptionEn}
                  onChange={(e) => {
                    if (activeLang === 'ar') setForm({ ...form, metaDescriptionAr: e.target.value });
                    else setForm({ ...form, metaDescriptionEn: e.target.value });
                  }}
                  className="rounded-xl p-3 text-[13px] resize-none"
                  rows={4}
                  maxLength={160}
                />
                <p className="text-[11px] text-slate-400 dark:text-white/25 mt-2">Recommended: 150-160 characters</p>
              </div>

              {/* Keywords */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-3 block">SEO Keywords</label>
                <Input
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="rounded-xl h-10 text-[13px]"
                  placeholder="urology, clinic, surgery..."
                />
              </div>

              {/* Show on Homepage */}
              <div className="pt-6 border-t border-slate-200/60 dark:border-white/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showOnHomepage}
                    onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-white">Show on Homepage</div>
                    <div className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">Pin this article to the main page</div>
                  </div>
                </label>
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Blog Management</h1>
          <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">
            Total Articles: <span className="text-indigo-500 font-semibold">{posts.length}</span>
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="h-9 px-4 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={15} /> New Article
        </button>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/10 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4" />
          <p className="text-[13px] font-semibold text-slate-500 dark:text-white/35">Loading articles...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200/60 dark:border-red-500/10">
          <p className="text-[13px] font-semibold text-red-500">Failed to load data</p>
          <button onClick={() => fetchPosts()} className="mt-3 h-8 px-4 rounded-xl text-[12px] font-semibold border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all">
            Retry
          </button>
        </div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-white/5">
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0 border border-slate-200/60 dark:border-white/5">
                            {post.featuredImage ? (
                              <img src={getMediaUrl(post.featuredImage)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-white/10"><ImageIcon size={18} /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{post.titleAr}</p>
                            <p className="text-[11px] text-slate-400 dark:text-white/25 font-medium mt-0.5">{post.titleEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] font-mono text-slate-400 dark:text-white/25">
                          {post.slugEn}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-block",
                          post.status === 'published'
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/35"
                        )}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(post)} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-all">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <FileText size={28} className="text-slate-300 dark:text-white/10" />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">No Articles Found</p>
                            <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">Start by creating your first article.</p>
                          </div>
                          <button onClick={() => setShowForm(true)} className="mt-2 h-9 px-5 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                            Create Article
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
