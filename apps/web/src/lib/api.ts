const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchWithRefresh(url: string, options: RequestInit, token?: string): Promise<Response> {
  const res = await fetch(url, options);
  
  if (res.status === 401 && token) {
    // Try to refresh token via /api/auth/refresh
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      
      // Notify application of the new token
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('token-refreshed', { detail: accessToken }));
      }
      
      // Update the options with the new token
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };
      
      // Retry original request with new token
      return fetch(url, newOptions);
    }
  }
  return res;
}

export const api = {
  async get<T>(path: string, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      cache: 'no-store',
    }, token);
    
    if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`);
    return res.json();
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
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `API POST ${path} failed: ${res.status}`);
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
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `API PATCH ${path} failed: ${res.status}`);
    return data;
  },

  async delete<T>(path: string, token?: string): Promise<T> {
    const res = await fetchWithRefresh(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    }, token);
    
    if (!res.ok) throw new Error(`API DELETE ${path} failed: ${res.status}`);
    return res.json();
  },
};

export function getMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/images/')) return url;
  
  // Legacy local path support (fallback)
  const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `${API_ROOT}/${clean}`;
}
