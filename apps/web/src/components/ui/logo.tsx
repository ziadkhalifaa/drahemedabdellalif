'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className={cn("relative flex-shrink-0 transition-transform group-hover:scale-105", iconOnly ? "w-12 h-12" : "w-56 h-20 sm:w-64 sm:h-24")}>
        <Image
          src="/images/logo.png"
          alt="LRO CLINIC - Dr. Ahmed Abd El Latif"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
