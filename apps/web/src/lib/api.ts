export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getResponseData(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await res.text();
    return { message: text };
  } catch {
    return null;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let refreshPromise: Promise<string | null> | null = null;

async function getNewToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const localRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ refreshToken: localRefreshToken || undefined }),
        });

        if (refreshRes.ok) {
          const { accessToken, refreshToken } = await refreshRes.json();

          if (refreshToken && typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // Notify application of the new token
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('token-refreshed', { detail: accessToken }));
          }
          return accessToken;
        }
      } catch (e) {
        console.error('Error refreshing token:', e);
      } finally {
        refreshPromise = null;
      }
      return null;
    })();
  }
  return refreshPromise;
}

async function fetchWithRefresh(url: string, options: RequestInit, token?: string): Promise<Response> {
  const res = await fetch(url, options);

  if (res.status === 401 && token) {
    // Try to refresh token via shared /api/auth/refresh promise
    const newAccessToken = await getNewToken();

    if (newAccessToken) {
      // Update the options with the new token
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };

      // Retry original request with new token
      return fetch(url, newOptions);
    }
  }
  return res;
}

export const api = {
  async get<T>(path: string, token?: string, options?: RequestInit): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      cache: token ? 'no-store' : undefined,
      ...(!token ? { next: { revalidate: 60 } } : {}),
      ...options,
    }, token);

    const data = await getResponseData(res);
    if (!res.ok) {
      throw new ApiError(data?.message || `API GET ${path} failed: ${res.status}`, res.status);
    }
    return data;
  },

  async post<T>(path: string, body: unknown, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    }, token);

    const data = await getResponseData(res);
    if (!res.ok) {
      throw new ApiError(data?.message || `API POST ${path} failed: ${res.status}`, res.status);
    }
    return data;
  },

  async patch<T>(path: string, body: unknown, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    }, token);

    const data = await getResponseData(res);
    if (!res.ok) {
      throw new ApiError(data?.message || `API PATCH ${path} failed: ${res.status}`, res.status);
    }
    return data;
  },

  async delete<T>(path: string, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    }, token);

    const data = await getResponseData(res);
    if (!res.ok) {
      throw new ApiError(data?.message || `API DELETE ${path} failed: ${res.status}`, res.status);
    }
    return data;
  },

  async put<T>(path: string, body: unknown, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    }, token);

    const data = await getResponseData(res);
    if (!res.ok) {
      throw new ApiError(data?.message || `API PUT ${path} failed: ${res.status}`, res.status);
    }
    return data;
  },

  async postFormData<T>(path: string, formData: FormData, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    }, token);

    const data = await getResponseData(res);
    if (!res.ok) {
      throw new ApiError(data?.message || `API POST FormData ${path} failed: ${res.status}`, res.status);
    }
    return data;
  },
};

export function getMediaUrl(url: string): string {
  if (!url) return '';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkqmympallxpdfypwxlr.supabase.co';

  // If it's a placeholder URL from a misconfigured API, fix it
  if (url.includes('placeholder.supabase.co')) {
    return url.replace('https://placeholder.supabase.co', supabaseUrl);
  }

  // Already absolute URL (Supabase, external, or data URI)
  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) return url;

  // Public folder images (in apps/web/public/)
  if (url.startsWith('/images/')) return url;

  // Legacy /uploads/ paths — convert to Supabase Storage URL
  if (url.startsWith('/uploads/')) {
    const filename = url.replace('/uploads/', '');
    return `${supabaseUrl}/storage/v1/object/public/media/images/${filename}`;
  }

  // Relative path (likely from Supabase)
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${supabaseUrl}/storage/v1/object/public/media/${cleanPath}`;
}

// ─── Typed API helpers ────────────────────────────────────────────────────────

export const clinicsApi = {
  getAll: (token?: string) => api.get<any[]>('/clinics', token),
  getOne: (id: string, token?: string) => api.get<any>(`/clinics/${id}`, token),
  getAvailableSlots: (clinicId: string, date: string) =>
    api.get<string[]>(`/clinics/${clinicId}/available-slots?date=${date}&_t=${Date.now()}`),
  getWorkingHours: (clinicId: string, token?: string) =>
    api.get<any[]>(`/clinics/${clinicId}/working-hours?_t=${Date.now()}`, token),
  getBlockedSlots: (clinicId: string, token?: string) =>
    api.get<any[]>(`/clinics/${clinicId}/blocked-slots?_t=${Date.now()}`, token),
  // Admin
  create: (data: any, token: string) => api.post<any>('/clinics', data, token),
  update: (id: string, data: any, token: string) => api.patch<any>(`/clinics/${id}`, data, token),
  remove: (id: string, token: string) => api.delete<any>(`/clinics/${id}`, token),
  setWorkingHours: (clinicId: string, hours: any[], token: string) =>
    api.put<any>(`/clinics/${clinicId}/working-hours`, { hours }, token),
  addBlockedSlot: (clinicId: string, data: any, token: string) =>
    api.post<any>(`/clinics/${clinicId}/blocked-slots`, data, token),
  removeBlockedSlot: (clinicId: string, slotId: string, token: string) =>
    api.delete<any>(`/clinics/${clinicId}/blocked-slots/${slotId}`, token),
};

export const appointmentsApi = {
  getAll: (params: Record<string, any> = {}, token: string) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return api.get<any>(`/appointments${query ? '?' + query : ''}`, token);
  },
  getMy: (token: string) => api.get<any[]>('/appointments/my', token),
  getPendingPayments: (token: string) => api.get<any[]>('/appointments/pending-payments', token),
  getOne: (id: string, token: string) => api.get<any>(`/appointments/${id}`, token),
  create: (data: any) => api.post<any>('/appointments', data),
  updateStatus: (id: string, status: string, cancellationReason?: string, token?: string) =>
    api.patch<any>(`/appointments/${id}/status`, { status, cancellationReason }, token),
  cancel: (id: string, token: string) => api.patch<any>(`/appointments/${id}/cancel`, {}, token),

  uploadPaymentProof: async (appointmentId: string, file: File, senderPhone: string) => {
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('senderPhone', senderPhone);
    return api.postFormData<any>(`/appointments/${appointmentId}/payment-proof`, formData);
  },

  confirmPayment: (
    appointmentId: string,
    action: 'confirm' | 'reject',
    adminNote: string | undefined,
    token: string,
  ) => api.patch<any>(`/appointments/${appointmentId}/confirm-payment`, { action, adminNote }, token),
};

export const siteSettingsApi = {
  getAllPublic: () => api.get<any[]>('/settings/public'),
  updateMultiple: (settings: { key: string; value: string }[], token: string) =>
    api.put<any>('/settings', { settings }, token),
};


