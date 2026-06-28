// src/pages/CatalogPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/services';
import { CATEGORIES } from '../api/mockData';
import ProductCard from '../components/courses/ProductCard';
import { Spinner, EmptyState, Button } from '../components/ui';
import SEO from '../components/layout/SEO';

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('reveal');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('revealed'); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin:'0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function CatalogPage({ type }) {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [category, setCategory] = useState(params.get('cat') ?? 'All');
  const [sort, setSort]         = useState('popular');
  const headRef = useReveal();

  useEffect(() => {
    setLoading(true);
    getProducts({ type: type ?? 'all', category, search: params.get('q') ?? '', page:1, limit:24 })
      .then(d => {
        let sorted = [...d.products];
        if (sort === 'price-asc')  sorted.sort((a,b) => a.price - b.price);
        if (sort === 'price-desc') sorted.sort((a,b) => b.price - a.price);
        if (sort === 'rating')     sorted.sort((a,b) => b.rating - a.rating);
        setProducts(sorted); setTotal(d.total); setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type, category, sort, params.get('q')]);

  const typeLabel = type==='ebook' ? 'eBooks' : type==='course' ? 'Courses' : 'All Products';

  return (
    <main style={{ minHeight:'80vh' }}>
      <SEO title={typeLabel} description={`Browse our full library of ${typeLabel.toLowerCase()} from industry experts.`} />
      <div className="page" style={{ paddingTop:40, paddingBottom:80 }}>
        <div ref={headRef} style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:36, marginBottom:8 }}>{typeLabel}</h1>
          <p style={{ color:'var(--text2)', fontSize:15 }}>
            {total} {typeLabel.toLowerCase()} available
            {params.get('q') && <> · Results for "<strong>{params.get('q')}</strong>"</>}
          </p>
        </div>

        <div style={{ display:'flex', gap:32, alignItems:'flex-start' }}>
          {/* Sidebar */}
          <aside style={{ width:220, flexShrink:0 }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 16px', marginBottom:16 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:14 }}>Category</p>
              {['All',...CATEGORIES.filter(c=>c!=='All')].map(c => (
                <button key={c} onClick={()=>setCategory(c)}
                  style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8, border:'none', background:category===c?'var(--accent-bg)':'transparent', color:category===c?'var(--accent)':'var(--text2)', fontSize:14, fontWeight:category===c?600:400, cursor:'pointer', marginBottom:2, transition:'all .15s' }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 16px' }}>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:14 }}>Sort by</p>
              {[['popular','Most Popular'],['rating','Highest Rated'],['price-asc','Price: Low → High'],['price-desc','Price: High → Low']].map(([v,l]) => (
                <button key={v} onClick={()=>setSort(v)}
                  style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8, border:'none', background:sort===v?'var(--accent-bg)':'transparent', color:sort===v?'var(--accent)':'var(--text2)', fontSize:14, fontWeight:sort===v?600:400, cursor:'pointer', marginBottom:2, transition:'all .15s' }}>
                  {l}
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div style={{ flex:1, minWidth:0 }}>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><Spinner size={40} /></div>
            ) : products.length === 0 ? (
              <EmptyState emoji="🔍" title="Nothing found" subtitle="Try a different category or search term." />
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:22 }}>
                {products.map((p,i) => (
                  <div key={p.id} className={`reveal delay-${Math.min((i%6)+1,6)}`}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:720px){aside{display:none}}`}</style>
    </main>
  );
}
