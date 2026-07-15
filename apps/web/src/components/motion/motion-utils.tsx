'use client';

import { useRef, useState, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView } from 'framer-motion';

// ── 3D Tilt Card ───────────────────────────────────────────────────────────
export function TiltCard({
  children,
  className = '',
  tiltDegree = 10,
  perspective = 1000,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  tiltDegree?: number;
  perspective?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [tiltDegree, -tiltDegree]), { damping: 25, stiffness: 300 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltDegree, tiltDegree]), { damping: 25, stiffness: 300 });

  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
    setIsHovered(false);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, perspective, transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      {children}
      {glare && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-30"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}

// ── Scroll Reveal (Fade In with direction, scale, perspective) ─────────────
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const directionMap: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: 50 },
  right: { x: -50 },
  none: {},
};

export function FadeIn({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 50,
  once = true,
  scale = 1,
  perspective3d = false,
  blur = false,
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  scale?: number;
  perspective3d?: boolean;
  blur?: boolean;
}) {
  const d = directionMap[direction];
  const dx = d.x ? (d.x / 50) * distance : 0;
  const dy = d.y ? (d.y / 50) * distance : 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: dx,
        y: dy,
        scale: scale !== 1 ? scale : 1,
        rotateX: perspective3d ? 15 : 0,
        filter: blur ? 'blur(8px)' : 'none',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Staggered Children Reveal ───────────────────────────────────────────────
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.08,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up',
  distance = 40,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  scale?: number;
}) {
  const d = directionMap[direction];
  const dx = d.x ? (d.x / 50) * distance : 0;
  const dy = d.y ? (d.y / 50) * distance : 0;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: dx, y: dy, scale },
        show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Floating Particles / Orbs Background ────────────────────────────────────
export function FloatingOrbs({
  count = 5,
  className = '',
}: {
  count?: number;
  colors?: string[];
  className?: string;
}) {
  const colors = ['var(--primary)', 'var(--accent)', '#3b82f6', '#8b5cf6', '#06b6d4'];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const size = 200 + Math.random() * 400;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const color = colors[i % colors.length];
        const duration = 8 + Math.random() * 12;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, 30, -20, 40, 0],
              y: [0, -40, 20, -30, 0],
              scale: [1, 1.15, 0.9, 1.1, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Text Reveal (Word by Word) ─────────────────────────────────────────────
export function TextReveal({
  text,
  className = '',
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const words = text.split(' ');

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: delay } } }}
      className={className}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20, rotateX: -40 },
            show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ── Magnetic Button (follows cursor slightly) ──────────────────────────────
export function MagneticButton({
  children,
  className = '',
  as = 'button',
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: 'button' | 'a';
  [key: string]: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 20, stiffness: 250 });
  const springY = useSpring(y, { damping: 20, stiffness: 250 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    x.set(dx);
    y.set(dy);
  };

  const handleLeave = () => { x.set(0); y.set(0); };

  const Tag = as === 'a' ? motion.a : motion.button;

  return (
    <div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave} className="inline-block">
      <Tag style={{ x: springX, y: springY }} className={className} {...props}>
        {children}
      </Tag>
    </div>
  );
}

// ── Parallax Layer ─────────────────────────────────────────────────────────
export function ParallaxLayer({
  children,
  speed = 0.5,
  className = '',
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
