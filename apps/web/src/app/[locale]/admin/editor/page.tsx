'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Layout, ArrowRight, MousePointer2, Edit3, Info } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const pages = [
  { id: 'home', name: 'Home Page', path: '/', icon: Layout },
  { id: 'about', name: 'About Us', path: '/about', icon: MousePointer2 },
  { id: 'services', name: 'Services', path: '/services', icon: Layout },
  { id: 'blog', name: 'Blog', path: '/blog', icon: Layout },
  { id: 'contact', name: 'Contact Us', path: '/contact', icon: Layout },
];

export default function LiveEditorManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">
          Live Website Editor
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-white/35 mt-1">
          Choose a page and language to start editing your website live.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page, idx) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 hover:border-slate-300 dark:hover:border-white/10 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-500 mb-5 group-hover:scale-105 transition-transform">
              <page.icon size={20} />
            </div>

            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-5">
              {page.name}
            </h3>

            <div className="space-y-2">
              <Link href={`${page.path}?edit=true`} locale="ar">
                <div className="w-full flex items-center justify-between h-10 px-4 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 text-[13px] font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/20">
                  <span className="flex items-center gap-2">
                    <Globe size={15} />
                    Edit in Arabic
                  </span>
                  <ArrowRight size={14} />
                </div>
              </Link>

              <Link href={`${page.path}?edit=true`} locale="en">
                <div className="w-full flex items-center justify-between h-10 px-4 rounded-xl border border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-white/60 hover:border-indigo-500 hover:text-indigo-500 text-[13px] font-bold transition-all cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Globe size={15} />
                    Edit in English
                  </span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/15 p-6 flex gap-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={18} className="text-indigo-500" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">How it works</h3>
          <p className="text-[12px] text-slate-500 dark:text-white/35 leading-relaxed">
            After choosing a page, you will be redirected to the live site.
            Click on any text or image to change it, and use the toolbar at the bottom to publish your changes.
          </p>
        </div>
      </div>
    </div>
  );
}
