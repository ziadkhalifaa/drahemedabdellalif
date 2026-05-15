'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, SectionHeader, Card, Button, Input, Textarea } from '@/components/ui';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { Star, Quote, MessageSquare, X, Send } from 'lucide-react';
import { api } from '@/lib/api';
import type { Testimonial } from '@dr-ahmed/shared';
import { cn } from '@/lib/utils';

export default function TestimonialsPage() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    patientName: '',
    rating: 5,
    content: ''
  });

  const fetchTestimonials = () => {
    setLoading(true);
    api.get<Testimonial[]>('/testimonials')
      .then(setTestimonials)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/testimonials', form);
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setForm({ patientName: '', rating: 5, content: '' });
      }, 3000);
    } catch (error) {
      alert('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <Section className="bg-gradient-to-b from-[var(--primary)]/5 to-transparent">
          <SectionHeader title={t('title')} subtitle={t('subtitle')} />
          
          <div className="grid gap-8 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full py-20 text-center text-blue-500 animate-pulse font-bold">
                 Loading experiences...
              </div>
            ) : (
              testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="p-8 relative overflow-hidden h-full border-none shadow-xl bg-[var(--card)] hover:shadow-2xl transition-all">
                    <Quote className="absolute top-4 left-4 h-12 w-12 text-[var(--primary)] opacity-5 -rotate-12" />
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {testimonial.patientName[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[var(--foreground)]">{testimonial.patientName}</h4>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} size={14} className={idx < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-[var(--muted)] leading-relaxed italic text-lg">
                      &quot;{testimonial.content}&quot;
                    </p>

                    <div className="mt-6 pt-6 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--muted)]">
                      <span className="font-medium">{new Date(testimonial.createdAt).toLocaleDateString(locale)}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{t('verified')}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
            {!loading && testimonials.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-[var(--muted)]">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>

          <div className="mt-20 text-center space-y-6">
             <h3 className="text-2xl font-bold text-[var(--primary)]">{t('shareTitle')}</h3>
             <p className="text-[var(--muted)] max-w-xl mx-auto">{t('shareDesc')}</p>
             <Button 
               onClick={() => setShowModal(true)}
               className="rounded-full px-12 py-6 text-lg font-bold shadow-xl shadow-[var(--primary)]/20 hover:-translate-y-1 transition-all"
             >
                {t('addReview')}
             </Button>
          </div>
        </Section>
      </main>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
            >
              {success ? (
                <div className="p-12 text-center space-y-4">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                      <Send size={32} />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">Thank You!</h3>
                   <p className="text-gray-500">Your review has been submitted for approval. It will appear on the site soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black uppercase tracking-tight">Share Experience</h3>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X size={20} /></Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Your Full Name</label>
                    <Input 
                      required
                      value={form.patientName}
                      onChange={(e) => setForm({...form, patientName: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="rounded-2xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Rating</label>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map((star) => (
                         <button 
                           key={star}
                           type="button"
                           onClick={() => setForm({...form, rating: star})}
                           className={cn(
                             "h-12 flex-1 rounded-2xl flex items-center justify-center transition-all border",
                             form.rating >= star ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-gray-50 dark:bg-white/5 text-gray-300 border-transparent"
                           )}
                         >
                            <Star size={20} fill={form.rating >= star ? "currentColor" : "none"} />
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Review Content</label>
                    <Textarea 
                      required
                      value={form.content}
                      onChange={(e) => setForm({...form, content: e.target.value})}
                      placeholder="Tell us about your experience with Dr. Ahmed..."
                      rows={4}
                      className="rounded-2xl p-4 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                  >
                    {isSubmitting ? 'Submitting...' : 'Post Review'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
