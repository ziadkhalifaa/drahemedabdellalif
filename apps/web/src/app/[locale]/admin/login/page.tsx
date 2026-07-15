'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin');
    } catch {
      setError(isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0c1220] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-white dark:bg-[#111b2e] rounded-3xl border border-gray-200/50 dark:border-white/[0.06] shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isRTL ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-white/35 mt-1">
              {isRTL ? 'سجّل دخولك للمتابعة' : 'Sign in to your account'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
            >
              <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 dark:text-white/50 mb-1.5 uppercase tracking-wider">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={isRTL ? 'admin@drahmed.com' : 'admin@drahmed.com'}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 dark:text-white/50 mb-1.5 uppercase tracking-wider">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl text-[13px] font-bold text-white transition-all duration-200",
                "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90",
                "shadow-lg shadow-primary/25 hover:shadow-primary/35",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isRTL ? 'جاري الدخول...' : 'Signing in...'}
                </>
              ) : (
                isRTL ? 'تسجيل الدخول' : 'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 dark:text-white/20 mt-6">
          {isRTL ? '© 2025 د. أحمد عبد اللطيف. جميع الحقوق محفوظة.' : '© 2025 Dr. Ahmed Abdellatif. All rights reserved.'}
        </p>
      </motion.div>
    </div>
  );
}
