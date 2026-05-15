'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@/context/editor-context';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Check, X, Save, Edit3, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { api, getMediaUrl } from '@/lib/api';
import { useLocale } from 'next-intl';
import { MediaPickerModal } from '@/components/media-picker';


interface EditableTextProps {
  contentKey: string;
  defaultAr: string;
  defaultEn: string;
  className?: string;
  as?: any;
}

export function EditableText({
  contentKey,
  defaultAr,
  defaultEn,
  className = '',
  as: Tag = 'span'
}: EditableTextProps) {
  const { isEditing, pageContent, updateContent } = useEditor();
  const locale = useLocale();

  // Determine initial value during render to avoid flash
  const getInitialValue = () => {
    const val = pageContent[contentKey];
    if (locale === 'ar') return val?.ar || defaultAr;
    return val?.en || defaultEn;
  };

  const [localValue, setLocalValue] = useState(getInitialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(getInitialValue());
  }, [pageContent, contentKey, locale]);


  if (!isEditing) {
    return <Tag className={className}>{localValue}</Tag>;
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsFocused(false);
    const newValue = e.currentTarget.innerText.trim();

    // Handle model field updates (keys with colons like service:id:field)
    if (contentKey.includes(':')) {
      const currentVal = locale === 'ar' ? defaultAr : defaultEn;
      if (newValue !== currentVal) {
        updateContent(contentKey, newValue);
      }
      return;
    }

    // Default settings update
    const currentFullVal = pageContent[contentKey] || { ar: defaultAr, en: defaultEn };
    if (newValue !== (locale === 'ar' ? currentFullVal.ar : currentFullVal.en)) {
      updateContent(contentKey, {
        ...currentFullVal,
        [locale]: newValue
      });
    }
  };


  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      className={cn(
        className,
        "outline-none transition-all duration-200",
        "hover:bg-blue-500/5 hover:ring-1 hover:ring-blue-500/30 rounded px-1",
        "focus:bg-blue-500/10 focus:ring-2 focus:ring-blue-500 cursor-text",
        isFocused && "shadow-inner"
      )}
    >
      {localValue}
    </Tag>
  );
}

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
}




export function EditableImage({
  contentKey,
  defaultSrc,
  alt = '',
  className = ''
}: EditableImageProps) {
  const { isEditing, pageContent, updateContent } = useEditor();
  const [showPicker, setShowPicker] = useState(false);

  const val = pageContent[contentKey];
  const src = val?.src || defaultSrc;


  if (!isEditing) {
    if (!src) return null;
    return <img src={getMediaUrl(src)} alt={alt} className={className} />;
  }


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = localStorage.getItem('admin_token');
    if (!file || !token) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      updateContent(contentKey, { src: data.url, alt });
    } catch (error) {
      alert('Upload failed');
    }
  };

  return (
    <div className="relative group">
      {src ? (
        <img src={getMediaUrl(src)} alt={alt} className={cn(className, "transition-all group-hover:opacity-75")} />
      ) : (
        <div className={cn(className, "bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-white/10 min-h-[200px]")}>
          <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
            <Plus className="text-[var(--primary)]" size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Add Image</span>
        </div>
      )}

      {/* Persistent edit indicator for visibility */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none group-hover:opacity-0 transition-opacity">
        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg border border-white/20">
          <Edit3 size={14} />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <label className="cursor-pointer bg-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center" title="Upload New">
            <Edit3 size={20} />
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          <button
            onClick={() => setShowPicker(true)}
            className="bg-[#072a44] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
            title="Choose from Library"
          >
            <ImageIcon size={20} />
          </button>
        </div>
      </div>
      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url) => updateContent(contentKey, { src: url, alt })}
      />
    </div>
  );
}

export function EditorToolbar() {
  const { isEditing, setIsEditing, saveChanges, hasChanges, isSaving } = useEditor();
  const locale = useLocale();

  if (!isEditing) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl p-4 rounded-3xl border-2 border-blue-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-3 px-4 border-r border-gray-200 dark:border-white/10 mr-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Live Editor</span>
      </div>

      <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl gap-1">
        <Link href={window.location.pathname} locale="ar">
          <Button variant={locale === 'ar' ? 'primary' : 'ghost'} size="sm" className="h-9 px-4 rounded-xl text-xs font-bold">العربية</Button>
        </Link>
        <Link href={window.location.pathname} locale="en">
          <Button variant={locale === 'en' ? 'primary' : 'ghost'} size="sm" className="h-9 px-4 rounded-xl text-xs font-bold">English</Button>
        </Link>
      </div>

      <Button
        variant={hasChanges ? "primary" : "secondary"}
        onClick={saveChanges}
        disabled={!hasChanges || isSaving}
        className={cn("gap-2 h-11 px-8 rounded-2xl font-bold shadow-lg transition-all", hasChanges && "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20")}
      >
        <Save size={18} /> {isSaving ? 'Publishing...' : 'Publish Changes'}
      </Button>

      <div className="flex items-center gap-2">
        <Link href="/admin/editor">
          <Button variant="outline" className="h-11 rounded-2xl gap-2 font-bold border-gray-200">
            Dashboard
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (hasChanges && !confirm('Discard unsaved changes?')) return;
            sessionStorage.removeItem('is_editing_mode');
            setIsEditing(false);
            window.location.href = window.location.pathname;
          }}
          className="h-11 w-11 rounded-2xl text-red-500 hover:bg-red-500/10 hover:text-red-600"
        >
          <X size={20} />
        </Button>

      </div>
    </div>
  );
}
