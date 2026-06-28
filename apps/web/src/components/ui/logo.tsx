'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className={cn("relative flex-shrink-0 transition-transform group-hover:scale-105", iconOnly ? "w-10 h-10" : "w-40 h-16 sm:w-48 sm:h-20")}>
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
