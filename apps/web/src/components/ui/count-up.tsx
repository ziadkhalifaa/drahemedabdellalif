'use client';

import { useEffect, useState } from 'react';
import { useInView, useSpring, useMotionValue } from 'framer-motion';
import { useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

export function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  decimals = 0,
  suffix = '',
  prefix = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const [displayValue, setDisplayValue] = useState(
    direction === 'down' ? to.toString() : from.toString()
  );

  useEffect(() => {
    if (isInView && startWhen) {
      setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      let formattedValue = Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Number(latest.toFixed(decimals)));
      
      if (separator === '') {
        formattedValue = formattedValue.replace(/,/g, '');
      }

      setDisplayValue(formattedValue);
    });

    return () => unsubscribe();
  }, [springValue, decimals, separator]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
