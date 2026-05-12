'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  icon: Icon,
  isOpen,
  onClick,
  className
}: AccordionItemProps) {
  return (
    <div className={cn("border-b border-[var(--border)] last:border-none", className)}>
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 px-4 text-right transition-all hover:bg-[var(--primary)]/5"
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <Icon size={20} />
            </div>
          )}
          <span className="text-lg font-bold text-[var(--foreground)]">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[var(--muted)]"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 pt-0 text-[var(--muted)] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Accordion({ children, className }: { children: React.ReactNode; className?: string }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-[var(--border)] rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen: openIndex === index,
            onClick: () => setOpenIndex(openIndex === index ? null : index),
          });
        }
        return child;
      })}
    </div>
  );
}
