'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';


export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({
    hero: {
      titleAr: 'جراحة الكلى والمسالك البولية والذكورة',
      titleEn: 'Urology and Andrology Surgery',
      subtitleAr: 'نقدم أحدث الحلول الطبية وجراحات المناظير والليزر بأعلى المعايير العالمية',
      subtitleEn: 'Providing the latest medical solutions and endoscopic laser surgeries with the highest global standards',
    },
    about: {
      textAr: 'الأستاذ الدكتور أحمد عبد اللطيف، استشاري جراحة المسالك البولية...',
      textEn: 'Prof. Dr. Ahmed Abdellatif, Consultant Urologist...',
    },
    contact: {
      phone: '+20 123 456 7890',
      email: 'info@drahmedabdellatif.com',
      addressBeniSuef: 'بني سويف، مصر',
      addressOctober: 'الحي المتميز، 6 أكتوبر',
    }
  });

  useEffect(() => {
    if (token) {
      api.get<any>('/settings', token).then((data: any[]) => {
        const s: any = { ...settings };
        data.forEach(item => {
          s[item.key] = item.value;
        });
        setSettings(s);
      }).catch(() => {});
    }
  }, [token]);

  const handleSave = async (key: string) => {
    if (!token) return;
    setLoading(true);
    try {
      await api.post(`/settings/${key}`, { value: settings[key] }, token);
      toast.success('Settings saved successfully!');
    } catch (e) {
      toast.error('Failed to save settings');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--foreground)]">Site Settings & Content Control</h2>

      {/* Hero Section Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
           <h3 className="text-lg font-bold">Home Page Hero Section</h3>
           <Button onClick={() => handleSave('hero')} disabled={loading} className="gap-2">
              <Save size={16} /> Save Hero Settings
           </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <div className="space-y-4">
              <h4 className="font-semibold text-[var(--primary)]">Arabic Content</h4>
              <Input label="Main Title (AR)" value={settings.hero.titleAr} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, titleAr: e.target.value } })} />
              <Textarea label="Subtitle (AR)" value={settings.hero.subtitleAr} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subtitleAr: e.target.value } })} />
           </div>
           <div className="space-y-4">
              <h4 className="font-semibold text-[var(--primary)]">English Content</h4>
              <Input label="Main Title (EN)" value={settings.hero.titleEn} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, titleEn: e.target.value } })} />
              <Textarea label="Subtitle (EN)" value={settings.hero.subtitleEn} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subtitleEn: e.target.value } })} />
           </div>
        </div>
      </Card>

      {/* About Us Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
           <h3 className="text-lg font-bold">About Us Section</h3>
           <Button onClick={() => handleSave('about')} disabled={loading} className="gap-2">
              <Save size={16} /> Save About Settings
           </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <Textarea label="About Text (AR)" className="min-h-[200px]" value={settings.about.textAr} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, textAr: e.target.value } })} />
           <Textarea label="About Text (EN)" className="min-h-[200px]" value={settings.about.textEn} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, textEn: e.target.value } })} />
        </div>
      </Card>

      {/* Contact Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
           <h3 className="text-lg font-bold">Contact & Clinic Info</h3>
           <Button onClick={() => handleSave('contact')} disabled={loading} className="gap-2">
              <Save size={16} /> Save Contact Info
           </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <Input label="Phone Number" value={settings.contact.phone} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })} />
           <Input label="Email Address" value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} />
           <Input label="Address (Beni Suef)" value={settings.contact.addressBeniSuef} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, addressBeniSuef: e.target.value } })} />
           <Input label="Address (6 October)" value={settings.contact.addressOctober} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, addressOctober: e.target.value } })} />
        </div>
      </Card>
    </div>
  );
}
