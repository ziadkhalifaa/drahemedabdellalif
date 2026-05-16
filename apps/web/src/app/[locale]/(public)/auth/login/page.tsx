'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link, useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement).value;
    const password = (e.currentTarget.querySelector('input[type="password"]') as HTMLInputElement).value;

    setLoading(true);
    try {
      const data: any = await api.post('/auth/login', { email, password });
      login(data.accessToken, data.user);
      toast.success(tCommon('success') || 'Login Successful');
      if (data.user?.role === 'admin' || data.user?.role === 'editor') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <Card className="p-8 shadow-2xl border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]" />
            
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
                <LogIn size={32} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{t('title')}</h1>
              <p className="text-[var(--muted)] mt-2 text-sm">{t('subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">
                  {t('email') || 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                  <Input 
                    type="email" 
                    required 
                    placeholder="example@mail.com" 
                    className="pl-12 py-6 bg-[var(--background)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                    {t('password') || 'Password'}
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-bold text-[var(--primary)] hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                  <Input 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    className="pl-12 py-6 bg-[var(--background)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-7 text-lg font-bold rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-xl hover:shadow-[var(--primary)]/20 transition-all group"
              >
                {loading ? tCommon('loading') : (
                  <span className="flex items-center gap-2">
                    {t('submit')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-[var(--muted)] text-sm">
                {t('noAccount')}{' '}
                <Link href="/auth/register" className="text-[var(--primary)] font-bold hover:underline inline-flex items-center gap-1 ml-1">
                  {t('registerLink')} <UserPlus size={14} />
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
