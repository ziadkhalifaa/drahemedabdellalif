'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/layout/admin-layout';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Shield, Search, Filter, ChevronDown, ChevronUp,
  Globe, Database, Image, FileText, Settings, Users,
  Stethoscope, Calendar, CreditCard, Mail, Star, Pill,
  Clock, Newspaper, ChevronLeft, ChevronRight, X, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string | null;
  details: any;
  ip: string | null;
  createdAt: string;
  user: AuditUser;
}

interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
  resources: { resource: string; count: number }[];
}

const resourceIcons: Record<string, any> = {
  media: Image,
  settings: Settings,
  blog: FileText,
  services: Stethoscope,
  techniques: Star,
  appointments: Calendar,
  payments: CreditCard,
  contact: Mail,
  testimonials: Star,
  prescriptions: Pill,
  hero: Newspaper,
  'hero-slides': Newspaper,
  auth: Shield,
  newsletter: Mail,
  workinghours: Clock,
  reports: FileText,
};

const resourceColors: Record<string, string> = {
  media: 'bg-violet-500/10 text-violet-500',
  settings: 'bg-slate-500/10 text-slate-500',
  blog: 'bg-sky-500/10 text-sky-500',
  services: 'bg-teal-500/10 text-teal-500',
  techniques: 'bg-amber-500/10 text-amber-500',
  appointments: 'bg-indigo-500/10 text-indigo-500',
  payments: 'bg-emerald-500/10 text-emerald-500',
  contact: 'bg-rose-500/10 text-rose-500',
  testimonials: 'bg-yellow-500/10 text-yellow-500',
  prescriptions: 'bg-cyan-500/10 text-cyan-500',
  'hero-slides': 'bg-orange-500/10 text-orange-500',
  hero: 'bg-orange-500/10 text-orange-500',
  auth: 'bg-red-500/10 text-red-500',
  newsletter: 'bg-pink-500/10 text-pink-500',
};

function getMethodColor(method: string) {
  if (method.startsWith('POST')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (method.startsWith('PATCH') || method.startsWith('PUT')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  if (method.startsWith('DELETE')) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
}

function getMethodLabel(method: string) {
  if (method.startsWith('POST')) return 'POST';
  if (method.startsWith('PATCH')) return 'PATCH';
  if (method.startsWith('PUT')) return 'PUT';
  if (method.startsWith('DELETE')) return 'DELETE';
  return 'GET';
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function AuditLogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resourceList, setResourceList] = useState<{ resource: string; count: number }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (search) params.set('search', search);
      if (resourceFilter) params.set('resource', resourceFilter);
      if (actionFilter) params.set('action', actionFilter);

      const res = await api.get<AuditLogResponse>(`/audit-logs?${params.toString()}`, token);
      setLogs(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setResourceList(res.resources || []);
    } catch (e) {
      toast.error('Failed to load audit logs');
    }
    setLoading(false);
  }, [token, page, search, resourceFilter, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => { setPage(1); }, [search, resourceFilter, actionFilter]);

  const clearFilters = () => {
    setSearch('');
    setResourceFilter('');
    setActionFilter('');
  };

  const hasFilters = search || resourceFilter || actionFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center">
            <Shield size={18} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">Audit Logs</h1>
            <p className="text-[13px] text-slate-500 dark:text-white/35">Track all admin actions across the system.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Total Actions</p>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white mt-1">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Resources Tracked</p>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white mt-1">{resourceList.length}</p>
        </div>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Deletes</p>
          <p className="text-[22px] font-bold text-red-500 mt-1">
            {logs.filter(l => l.action.startsWith('DELETE')).length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">This Page</p>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white mt-1">{logs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Search by action, user, or IP..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 h-9 rounded-xl text-[13px] font-medium border transition-all",
              showFilters
                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/40 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
            )}
          >
            <Filter size={14} />
            Filters
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="h-8 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[12px] text-slate-700 dark:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Resources</option>
              {resourceList.map(r => (
                <option key={r.resource} value={r.resource}>
                  {r.resource} ({r.count})
                </option>
              ))}
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-8 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[12px] text-slate-700 dark:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Actions</option>
              <option value="POST">Create (POST)</option>
              <option value="PATCH">Update (PATCH)</option>
              <option value="DELETE">Delete (DELETE)</option>
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 text-[12px] font-medium hover:bg-red-500/15 transition-all"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Shield size={20} className="text-slate-400 dark:text-white/25" />
            </div>
            <p className="text-[13px] font-bold text-slate-900 dark:text-white">No audit logs found</p>
            <p className="text-[12px] text-slate-500 dark:text-white/35 mt-1">
              {hasFilters ? 'Try adjusting your filters' : 'Actions will appear here as they are performed'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_140px_90px] gap-3 px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Action</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Resource</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">User</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">Time</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25 text-right">Details</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {logs.map((log) => {
                const method = getMethodLabel(log.action);
                const path = log.action.replace(/^(GET|POST|PATCH|PUT|DELETE)\s+/, '');
                const Icon = resourceIcons[log.resource || ''] || Globe;
                const colorClass = resourceColors[log.resource || ''] || 'bg-slate-500/10 text-slate-500';
                const isExpanded = expandedId === log.id;

                return (
                  <div key={log.id}>
                    <div
                      className={cn(
                        "grid md:grid-cols-[1fr_120px_140px_140px_90px] gap-3 px-5 py-3.5 items-center cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]",
                        isExpanded && "bg-slate-50/50 dark:bg-white/[0.02]"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      {/* Action */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn(
                          "shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border",
                          getMethodColor(log.action)
                        )}>
                          {method}
                        </span>
                        <span className="text-[12px] text-slate-600 dark:text-white/40 font-mono truncate">
                          {path}
                        </span>
                      </div>

                      {/* Resource */}
                      <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", colorClass)}>
                          <Icon size={12} />
                        </div>
                        <span className="text-[12px] font-medium text-slate-700 dark:text-white/50 capitalize">
                          {log.resource || '—'}
                        </span>
                      </div>

                      {/* User */}
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-slate-700 dark:text-white/50 truncate">
                          {log.user?.name || 'Unknown'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25 truncate">
                          {log.user?.email || ''}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-[12px] text-slate-500 dark:text-white/35">
                        {timeAgo(log.createdAt)}
                      </span>

                      {/* Expand */}
                      <div className="flex items-center justify-end gap-2">
                        {log.ip && (
                          <span className="text-[11px] text-slate-400 dark:text-white/25 font-mono">
                            {log.ip}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-slate-400 dark:text-white/25" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400 dark:text-white/25" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-slate-50/30 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5">
                        <div className="grid grid-cols-2 gap-3 text-[12px]">
                          <div>
                            <span className="font-bold text-slate-500 dark:text-white/35">Full Action: </span>
                            <span className="text-slate-700 dark:text-white/50 font-mono">{log.action}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 dark:text-white/35">IP: </span>
                            <span className="text-slate-700 dark:text-white/50 font-mono">{log.ip || '—'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 dark:text-white/35">Date: </span>
                            <span className="text-slate-700 dark:text-white/50">
                              {new Date(log.createdAt).toLocaleString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 dark:text-white/35">Role: </span>
                            <span className="text-slate-700 dark:text-white/50 capitalize">{log.user?.role || '—'}</span>
                          </div>
                        </div>
                        {log.details && (
                          <div className="mt-3">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-white/35 uppercase tracking-wider">Request Body</span>
                            <pre className="mt-1.5 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-white/40 font-mono overflow-x-auto max-h-48 overflow-y-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <span className="text-[12px] text-slate-500 dark:text-white/35">
                  Page {page} of {totalPages} ({total.toLocaleString()} entries)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all",
                          p === page
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            : "text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
