'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useSearchParams } from 'next/navigation';

interface EditorContextType {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  pageContent: Record<string, any>;
  updateContent: (key: string, value: any) => void;
  saveChanges: () => Promise<void>;
  hasChanges: boolean;
  isSaving: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ 
  children,
  initialSettings = {}
}: { 
  children: React.ReactNode;
  initialSettings?: Record<string, any>;
}) {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [pageContent, setPageContent] = useState<Record<string, any>>(initialSettings);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const [isSaving, setIsSaving] = useState(false);

  // Enable editing if user is admin and ?edit=true is in URL or was previously enabled in session
  useEffect(() => {
    const editModeParam = searchParams.get('edit') === 'true';
    const wasEditing = sessionStorage.getItem('is_editing_mode') === 'true';
    const savedUser = localStorage.getItem('admin_user');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'admin') {
          if (editModeParam) {
            setIsEditing(true);
            sessionStorage.setItem('is_editing_mode', 'true');
          } else if (wasEditing) {
            setIsEditing(true);
          }
        }
      } catch (e) {
        console.error('Failed to parse admin_user', e);
      }
    }
  }, [searchParams]);


  // Fetch all settings initially
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.get<any[]>('/settings');
        const contentMap: Record<string, any> = {};
        if (Array.isArray(settings)) {
          settings.forEach((s: any) => {
            contentMap[s.key] = s.value;
          });
        }
        setPageContent(contentMap);
      } catch (e) {
        console.error('Failed to fetch settings', e);
      }
    };
    fetchSettings();
  }, []);

  const updateContent = (key: string, value: any) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
    setPageContent(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    if (!token || Object.keys(pendingChanges).length === 0) {
      if (!token) alert('You must be logged in as admin to save changes.');
      return;
    }
    
    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(pendingChanges).map(([key, value]) => {
          // Handle specific model updates
          if (key.startsWith('service:') || key.startsWith('technique:')) {
            const [model, id, field] = key.split(':');
            const endpoint = model === 'service' ? 'services' : 'techniques';
            // If it's an image update, value is { src, alt }
            const payload = field === 'image' ? { [field]: value.src } : { [field]: value };
            return api.patch(`/${endpoint}/${id}`, payload, token);
          }
          
          // Default to settings update
          return api.post(`/settings/${key}`, { value }, token);
        })
      );

      setPendingChanges({});
      alert('Changes published successfully!');
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save changes. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditorContext.Provider value={{ 
      isEditing, 
      setIsEditing, 
      pageContent, 
      updateContent, 
      saveChanges,
      hasChanges: Object.keys(pendingChanges).length > 0,
      isSaving
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
};
