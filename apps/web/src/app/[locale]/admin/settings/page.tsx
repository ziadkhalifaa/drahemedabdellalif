'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Globe, Info, Phone, Share2, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    hero: {
      titleAr: '',
      titleEn: '',
      subtitleAr: '',
      subtitleEn: '',
    },
    about: {
      textAr: '',
      textEn: '',
    },
    contact: {
      phone: '',
      email: '',
      addressBeniSuef: '',
      addressOctober: '',
    },
    social: {
      facebook: '',
      youtube: '',
      instagram: '',
      whatsapp: ''
    },
    seo: {
      metaTitleAr: '',
      metaTitleEn: '',
      metaDescriptionAr: '',
      metaDescriptionEn: '',
      ogImage: '',
    }
  });

  useEffect(() => {
    if (token) {
      const fetchSettings = (attempt = 1) => {
        api.get<any>('/settings', token)
          .then((data: any[]) => {
            setSettings((prevSettings: any) => {
              const s = { ...prevSettings };
              data.forEach(item => {
                s[item.key] = item.value;
              });
              return s;
            });
          })
          .catch(err => {
            console.error(`Failed to fetch settings (attempt ${attempt}):`, err);
            if (attempt < 2) {
              setTimeout(() => fetchSettings(attempt + 1), 1500);
            }
          });
      };
      fetchSettings();
    }
  }, [token]);

  const handleSave = async (key: string) => {
    if (!token) return;
    setSavingKey(key);
    try {
      await api.post(`/settings/${key}`, { value: settings[key] }, token);
      toast.success('Settings saved successfully!');
    } catch (e) {
      toast.error('Failed to save settings');
    }
    setSavingKey(null);
  };

  const updateField = (section: string, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const sections = [
    {
      key: 'hero',
      title: 'Hero Section',
      description: 'Main headline and subtitle displayed on the home page.',
      icon: Globe,
    },
    {
      key: 'about',
      title: 'About Us',
      description: 'Description text for the about section.',
      icon: Info,
    },
    {
      key: 'contact',
      title: 'Contact & Clinic Info',
      description: 'Phone, email, and clinic addresses.',
      icon: Phone,
    },
    {
      key: 'social',
      title: 'Social Media Links',
      description: 'External links to social media profiles.',
      icon: Share2,
    },
    {
      key: 'seo',
      title: 'SEO Settings',
      description: 'Meta tags and Open Graph for search engines.',
      icon: Search,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">
            Site Settings
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-white/35 mt-1">
            Manage your website content and configuration.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <Globe size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Hero Section</h2>
              <p className="text-[12px] text-slate-500 dark:text-white/35">Main headline and subtitle on the home page.</p>
            </div>
          </div>
          <button
            onClick={() => handleSave('hero')}
            disabled={savingKey === 'hero'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
              savingKey === 'hero'
                ? "bg-indigo-500/20 text-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            )}
          >
            {savingKey === 'hero' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Arabic</span>
            <div className="space-y-2">
              <input
                type="text"
                value={settings.hero.titleAr}
                onChange={(e) => updateField('hero', 'titleAr', e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Title in Arabic"
              />
              <textarea
                value={settings.hero.subtitleAr}
                onChange={(e) => updateField('hero', 'subtitleAr', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                placeholder="Subtitle in Arabic"
              />
            </div>
          </div>
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">English</span>
            <div className="space-y-2">
              <input
                type="text"
                value={settings.hero.titleEn}
                onChange={(e) => updateField('hero', 'titleEn', e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Title in English"
              />
              <textarea
                value={settings.hero.subtitleEn}
                onChange={(e) => updateField('hero', 'subtitleEn', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                placeholder="Subtitle in English"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <Info size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">About Us</h2>
              <p className="text-[12px] text-slate-500 dark:text-white/35">Description text for the about section.</p>
            </div>
          </div>
          <button
            onClick={() => handleSave('about')}
            disabled={savingKey === 'about'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
              savingKey === 'about'
                ? "bg-indigo-500/20 text-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            )}
          >
            {savingKey === 'about' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Arabic</span>
            <textarea
              value={settings.about.textAr}
              onChange={(e) => updateField('about', 'textAr', e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              placeholder="About text in Arabic"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">English</span>
            <textarea
              value={settings.about.textEn}
              onChange={(e) => updateField('about', 'textEn', e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              placeholder="About text in English"
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <Phone size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Contact & Clinic Info</h2>
              <p className="text-[12px] text-slate-500 dark:text-white/35">Phone, email, and clinic addresses.</p>
            </div>
          </div>
          <button
            onClick={() => handleSave('contact')}
            disabled={savingKey === 'contact'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
              savingKey === 'contact'
                ? "bg-indigo-500/20 text-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            )}
          >
            {savingKey === 'contact' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Phone Number</label>
            <input
              type="text"
              value={settings.contact.phone}
              onChange={(e) => updateField('contact', 'phone', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Email Address</label>
            <input
              type="email"
              value={settings.contact.email}
              onChange={(e) => updateField('contact', 'email', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Address (Beni Suef)</label>
            <input
              type="text"
              value={settings.contact.addressBeniSuef}
              onChange={(e) => updateField('contact', 'addressBeniSuef', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Address (6 October)</label>
            <input
              type="text"
              value={settings.contact.addressOctober}
              onChange={(e) => updateField('contact', 'addressOctober', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <Share2 size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Social Media Links</h2>
              <p className="text-[12px] text-slate-500 dark:text-white/35">External links to social media profiles.</p>
            </div>
          </div>
          <button
            onClick={() => handleSave('social')}
            disabled={savingKey === 'social'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
              savingKey === 'social'
                ? "bg-indigo-500/20 text-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            )}
          >
            {savingKey === 'social' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Facebook URL</label>
            <input
              type="url"
              value={settings.social?.facebook || ''}
              onChange={(e) => updateField('social', 'facebook', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">YouTube URL</label>
            <input
              type="url"
              value={settings.social?.youtube || ''}
              onChange={(e) => updateField('social', 'youtube', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Instagram URL</label>
            <input
              type="url"
              value={settings.social?.instagram || ''}
              onChange={(e) => updateField('social', 'instagram', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">WhatsApp URL</label>
            <input
              type="url"
              value={settings.social?.whatsapp || ''}
              onChange={(e) => updateField('social', 'whatsapp', e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="https://wa.me/..."
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
              <Search size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">SEO Settings</h2>
              <p className="text-[12px] text-slate-500 dark:text-white/35">Meta tags and Open Graph for search engines.</p>
            </div>
          </div>
          <button
            onClick={() => handleSave('seo')}
            disabled={savingKey === 'seo'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
              savingKey === 'seo'
                ? "bg-indigo-500/20 text-indigo-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            )}
          >
            {savingKey === 'seo' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Arabic</span>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-white/25">Meta Title</label>
                <input
                  type="text"
                  value={settings.seo?.metaTitleAr || ''}
                  onChange={(e) => updateField('seo', 'metaTitleAr', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Meta title in Arabic"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-white/25">Meta Description</label>
                <textarea
                  value={settings.seo?.metaDescriptionAr || ''}
                  onChange={(e) => updateField('seo', 'metaDescriptionAr', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Meta description in Arabic"
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">English</span>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-white/25">Meta Title</label>
                <input
                  type="text"
                  value={settings.seo?.metaTitleEn || ''}
                  onChange={(e) => updateField('seo', 'metaTitleEn', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Meta title in English"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-white/25">Meta Description</label>
                <textarea
                  value={settings.seo?.metaDescriptionEn || ''}
                  onChange={(e) => updateField('seo', 'metaDescriptionEn', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Meta description in English"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Open Graph Image URL</label>
          <input
            type="url"
            value={settings.seo?.ogImage || ''}
            onChange={(e) => updateField('seo', 'ogImage', e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="https://example.com/og-image.jpg"
          />
          <p className="text-[11px] text-slate-400 dark:text-white/25">Image shown when the site is shared on social media (1200x630 recommended).</p>
        </div>
      </div>
    </div>
  );
}
