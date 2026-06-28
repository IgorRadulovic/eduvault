// src/components/layout/PageTransition.jsx
// Wraps each page with a fade+slide-up animation on route change.
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove('page-enter');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('page-enter');
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
