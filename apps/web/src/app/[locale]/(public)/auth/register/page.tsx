'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Link, useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { User, Mail, Phone, Lock, UserPlus, LogIn, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tVerify = useTranslations('auth.verifyEmail');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Submitting registration...", { ...formData, method });
      await api.post('/auth/register', { ...formData, method });
      console.log("Registration successful, switching to verify view");
      setShowVerify(true);
      toast.success(tCommon('success') || 'Verification code sent!');
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message || tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = (e.currentTarget.querySelector('input') as HTMLInputElement).value;
    if (code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const data: any = await api.post('/auth/verify-email', { email: formData.email, code });
      login(data.accessToken, data.user);
      toast.success('Email verified successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-code', { email: formData.email, method });
      toast.success(tVerify('resendSuccess') || 'New code sent!');
    } catch (error: any) {
      toast.error(error.message || tCommon('error'));
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl px-4"
        >
          <Card className="p-8 md:p-10 shadow-2xl border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]" />
            
            {!showVerify ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
                    <UserPlus size={32} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('title')}</h1>
                  <p className="text-[var(--muted)] mt-2 text-sm">{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">
                      {t('fullName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                      <Input 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe" 
                        className="pl-12 py-6 bg-[var(--background)]/50 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                      <Input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com" 
                        className="pl-12 py-6 bg-[var(--background)]/50 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">
                      {t('phone')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                      <Input 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+20 123 456 789" 
                        className="pl-12 py-6 bg-[var(--background)]/50 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] ml-1">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                      <Input 
                        type="password" 
                        required 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••" 
                        className="pl-12 py-6 bg-[var(--background)]/50 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Method Selection */}
                  <div className="md:col-span-2 space-y-4 pt-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] block text-center">
                      {tCommon('verificationMethod') || 'How should we send your code?'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMethod('email')}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold",
                          method === 'email' 
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" 
                            : "border-[var(--border)] bg-[var(--background)]/50 text-[var(--muted)]"
                        )}
                      >
                        <Mail size={18} />
                        {tCommon('email') || 'Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod('whatsapp')}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold",
                          method === 'whatsapp' 
                            ? "border-[#25D366] bg-[#25D366]/10 text-[#25D366]" 
                            : "border-[var(--border)] bg-[var(--background)]/50 text-[var(--muted)]"
                        )}
                      >
                        <Phone size={18} />
                        WhatsApp
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-8 text-xl font-bold rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-2xl hover:shadow-[var(--primary)]/30 transition-all group"
                    >
                      {loading ? tCommon('loading') : (
                        <span className="flex items-center gap-3">
                          {t('submit')} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
                  <p className="text-[var(--muted)] text-sm">
                    {t('hasAccount')}{' '}
                    <Link href="/auth/login" className="text-[var(--primary)] font-bold hover:underline inline-flex items-center gap-1 ml-1">
                      {t('loginLink')} <LogIn size={14} />
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className={cn(
                  "inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6", 
                  method === 'email' 
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
                    : "bg-[#25D366]/10 text-[#25D366]"
                )}>
                  {method === 'email' ? <Mail size={32} /> : <MessageCircle size={32} />}
                </div>
                <h2 className="text-3xl font-black mb-4">
                  {method === 'email' ? tVerify('title') : tVerify('titleWhatsApp')}
                </h2>
                <p className="text-[var(--muted)] mb-8 text-sm">
                  {method === 'email' 
                    ? tVerify('subtitle', { email: formData.email })
                    : tVerify('subtitleWhatsApp', { phone: formData.phone })
                  }
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                   <div className="flex justify-center gap-3">
                      <Input 
                        maxLength={6} 
                        required 
                        className="text-center text-3xl font-black py-8 tracking-[0.5em] rounded-2xl bg-[var(--background)]/50 border-2 border-[var(--primary)]/20 focus:border-[var(--primary)] transition-all max-w-[240px]" 
                        placeholder="000000"
                      />
                   </div>
                   <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-7 text-lg font-bold rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] shadow-xl shadow-[var(--primary)]/20"
                    >
                      {loading ? tCommon('loading') : tVerify('submit')}
                    </Button>
                    <button 
                       type="button" 
                       onClick={handleResend}
                       className="text-[var(--primary)] font-bold text-sm hover:underline"
                    >
                       {tVerify('resend')}
                    </button>
                </form>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
