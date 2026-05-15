'use client';

import React, { useState, useEffect } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui';
import { X, Check, UploadCloud, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    api.get<any[]>('/media/all', token || undefined)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = localStorage.getItem('admin_token');
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

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      // Also save to media gallery metadata
      await api.post('/media', {
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: data.url,
        titleEn: file.name,
        titleAr: file.name,
        order: 0
      }, token);

      fetchMedia();
    } catch (error) {
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
        <div className="p-8 border-b flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-2xl font-black text-[#072a44] dark:text-white uppercase tracking-tight">Media Library</h3>
              <p className="text-sm text-gray-500">Select an image for your content.</p>
            </div>
            
            <div className="h-10 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />
            
            <div className="relative">
              <input type="file" id="modal-upload" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
              <Button 
                onClick={() => document.getElementById('modal-upload')?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-blue-500/20 gap-2 transition-all active:scale-95"
              >
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                {uploading ? 'Processing...' : 'Upload New'}
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-12 w-12 hover:bg-gray-100 dark:hover:bg-white/10"><X /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center font-bold text-blue-500 animate-pulse">Loading library...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { onSelect(item.url); onClose(); }}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 hover:scale-95 transition-all shadow-md group relative"
                >
                  <img src={getMediaUrl(item.url)} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Check className="text-white" size={32} />
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="col-span-full py-20 text-center text-[var(--muted)]">
                  No media files found. Upload some first.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
