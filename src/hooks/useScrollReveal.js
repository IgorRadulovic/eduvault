// src/hooks/useScrollReveal.js
// Observes elements and triggers reveal animations as they scroll into view.
// Usage: const ref = useScrollReveal(); then <div ref={ref}>...</div>

import { useEffect, useRef } from 'react';

const DEFAULT_OPTIONS = {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px',
};

export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, { ...DEFAULT_OPTIONS, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// Hook for staggered children animations
export function useStaggerReveal(count, options = {}) {
  const refs = Array.from({ length: count }, () => useRef(null));

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      refs.forEach(ref => {
        if (ref.current) { ref.current.style.opacity = '1'; ref.current.style.transform = 'none'; }
      });
      return;
    }

    const observers = refs.map((ref, i) => {
      const el = ref.current;
      if (!el) return null;
      el.style.transitionDelay = `${i * 80}ms`;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { ...DEFAULT_OPTIONS, ...options });
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach(o => o?.disconnect());
  }, [count]);

  return refs;
}
