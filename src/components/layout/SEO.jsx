// src/components/layout/SEO.jsx
// Updates <title>, meta description, and Open Graph tags per page.
// Usage: <SEO title="..." description="..." image="..." />
import { useEffect } from 'react';

const SITE_NAME  = 'EduVault';
const SITE_URL   = import.meta.env.VITE_SITE_URL ?? 'https://eduvault.com';
const DEFAULT_OG = '/logo.png';

export default function SEO({ title, description, image, noIndex }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Unlock Your Potential`;
  const desc = description ?? 'Premium courses and ebooks curated by industry experts. Learn at your pace, apply skills immediately.';
  const img  = image ?? `${SITE_URL}${DEFAULT_OG}`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('description', desc);
    setMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    setOG('og:title',       fullTitle);
    setOG('og:description', desc);
    setOG('og:image',       img);
    setOG('og:type',        'website');
    setOG('og:site_name',   SITE_NAME);
    setOG('twitter:card',        'summary_large_image');
    setOG('twitter:title',       fullTitle);
    setOG('twitter:description', desc);
    setOG('twitter:image',       img);
  }, [fullTitle, desc, img, noIndex]);

  return null;
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setOG(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(prop.startsWith('og:') ? 'property' : 'name', prop); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
