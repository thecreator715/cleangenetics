import React, { useEffect, useRef, useState } from 'react';

/** Fades/blurs children in as they enter the viewport. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}> = ({ children, delay = 0, className = '', as = 'div' }) => {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as any;
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
};

/** Counts up to a number once visible: "10k+", "98%". */
export const CountUp: React.FC<{ to: number; suffix?: string; prefix?: string; duration?: number; className?: string }> = ({
  to,
  suffix = '',
  prefix = '',
  duration = 1600,
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 4);
        setVal(Math.round(to * eased));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === 'undefined') {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

/** Pointer-driven 3D tilt. Spread the returned props onto any element. */
export const useTilt = (max = 7) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const fine = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || reduce || !fine) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.classList.add('is-tilting');
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0) scale(1.012)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('is-tilting');
    el.style.transform = '';
  };
  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
};

/** Fixed, animated aurora backdrop that lives behind the whole app. */
export const Aurora: React.FC = () => (
  <div className="aurora" aria-hidden>
    <div className="orb a" />
    <div className="orb b" />
    <div className="orb c" />
    <div className="orb d" />
    <div className="cursor-light" id="cursor-light" />
    <div className="grid" />
    <div className="grain" />
  </div>
);
