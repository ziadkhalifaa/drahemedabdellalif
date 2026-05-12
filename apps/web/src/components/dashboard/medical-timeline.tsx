'use client';

import { motion } from 'framer-motion';
import { Calendar, FileText, Pill, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '../ui';

interface TimelineItem {
  id: string;
  type: 'appointment' | 'report' | 'prescription';
  title: string;
  date: Date;
  status?: string;
  details?: string;
}

export function MedicalTimeline({ items }: { items: TimelineItem[] }) {
  const sortedItems = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
      {sortedItems.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--primary)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {item.type === 'appointment' && <Calendar size={18} />}
            {item.type === 'report' && <FileText size={18} />}
            {item.type === 'prescription' && <Pill size={18} />}
          </div>

          {/* Content */}
          <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 border-[var(--border)] rounded-3xl hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-1">
              <time className="font-black text-xs text-[var(--primary)] uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={12} />
                {new Date(item.date).toLocaleDateString()}
              </time>
              {item.status && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] uppercase">
                  {item.status}
                </span>
              )}
            </div>
            <h4 className="text-lg font-black text-[var(--foreground)]">{item.title}</h4>
            {item.details && <p className="text-sm text-[var(--muted)] mt-1 font-medium">{item.details}</p>}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
