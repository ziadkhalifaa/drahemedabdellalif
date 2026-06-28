'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative flex-shrink-0 transition-transform group-hover:scale-105">
        <Image
          src="/images/logo.png"
          alt="LRO CLINIC - Dr. Ahmed Abd El Latif"
          width={iconOnly ? 40 : 72}
          height={iconOnly ? 40 : 72}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
