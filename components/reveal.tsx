'use client';
import { useEffect, useRef } from 'react';

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    // Only conceal content below the viewport; the page remains readable without JavaScript.
    if (element.getBoundingClientRect().top < innerHeight) return;
    element.dataset.reveal = 'waiting';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delete element.dataset.reveal;
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -24px 0px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
