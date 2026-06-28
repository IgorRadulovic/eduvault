// src/components/layout/CookieBanner.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('eduvault_cookie_consent');
    if (!consent) setTimeout(() => setShow(true), 1200);
  }, []);

  function accept() { localStorage.setItem('eduvault_cookie_consent', 'accepted'); setShow(false); }
  function decline() { localStorage.setItem('eduvault_cookie_consent', 'declined'); setShow(false); }

  if (!show) return null;

  return (
    <div className="fade-up" style={{ position:'fixed', bottom:20, left:20, right:20, maxWidth:520, margin:'0 auto', zIndex:8000, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', boxShadow:'var(--shadow-lg)', display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
      <div style={{ flex:1, minWidth:200 }}>
        <p style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>🍪 We use cookies</p>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
          We use essential cookies to make our site work, and optional analytics cookies to improve your experience.{' '}
          <a href="#" style={{ color:'var(--accent)' }}>Privacy Policy</a>
        </p>
      </div>
      <div style={{ display:'flex', gap:8, alignSelf:'center', flexShrink:0 }}>
        <Button variant="secondary" size="sm" onClick={decline}>Decline</Button>
        <Button variant="primary" size="sm" onClick={accept}>Accept All</Button>
      </div>
    </div>
  );
}
