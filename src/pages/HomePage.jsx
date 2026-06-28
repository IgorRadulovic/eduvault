// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/services';
import ProductCard from '../components/courses/ProductCard';
import { Button, Spinner } from '../components/ui';
import SEO from '../components/layout/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { debounce, fmtN } from '../utils/helpers';

const STATS = [
  { n:'50K+', l:'Learners Enrolled',  icon:'👥' },
  { n:'200+', l:'Expert-led Courses', icon:'📚' },
  { n:'4.8★', l:'Average Rating',     icon:'⭐' },
  { n:'95%',  l:'Completion Rate',    icon:'🏆' },
];

const TESTIMONIALS = [
  { name:'Jessica T.', role:'Frontend Developer', text:'I landed my first dev job 3 months after finishing the React course. The quality is unmatched.' },
  { name:'Marcus O.',  role:'Product Manager',    text:'The product thinking ebook completely changed how I approach feature prioritisation.' },
  { name:'Ananya R.',  role:'Data Analyst',       text:'Python for Data Science took me from zero to confidently handling real datasets at work.' },
];

const CATEGORIES = [
  { emoji:'💻', label:'Development' },
  { emoji:'🎨', label:'Design'       },
  { emoji:'📊', label:'Data Science' },
  { emoji:'💼', label:'Business'     },
  { emoji:'📱', label:'Marketing'    },
  { emoji:'⚡', label:'Productivity' },
];

// Simple hook to add reveal class to a ref
function useReveal(variant = 'reveal') {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add(variant);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('revealed'); return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant]);
  return ref;
}

export default function HomePage() {
  const [search, setSearch]       = useState('');
  const [query, setQuery]         = useState('');
  const [featured, setFeatured]   = useState([]);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searching, setSearching] = useState(false);
  const nav = useNavigate();

  // Section refs for scroll reveal
  const statsRef       = useReveal();
  const catsRef        = useReveal();
  const featuredRef    = useReveal();
  const ebooksRef      = useReveal('reveal-left');
  const testimonialsRef= useReveal();
  const ctaRef         = useReveal('reveal-scale');

  useEffect(() => {
    getProducts({ limit:8 })
      .then(d => { setFeatured(d.products.filter(p => p.featured).slice(0,6)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const doSearch = useCallback(debounce(async q => {
    if (!q.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const d = await getProducts({ search: q });
    setResults(d.products); setSearching(false);
  }, 350), []);

  function handleSearch(v) { setSearch(v); setQuery(v); doSearch(v); }

  return (
    <main>
      <SEO />

      {/* ── Hero ── */}
      <section style={{ background:'linear-gradient(160deg, #0D1B2A 0%, #1A3A6B 55%, #1565C0 100%)', padding:'88px 24px 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:420, height:420, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.03)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', left:'10%', width:200, height:200, borderRadius:'50%', background:'rgba(41,121,255,.08)', pointerEvents:'none', filter:'blur(40px)' }} />

        <div className="page" style={{ maxWidth:760, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <div className="fade-down">
            <img src="/logo.png" alt="EduVault" style={{ height:76, width:'auto', margin:'0 auto 28px', objectFit:'contain', filter:'brightness(0) invert(1)' }} />
          </div>
          <h1 className="fade-up" style={{ fontSize:'clamp(34px,5.5vw,60px)', lineHeight:1.1, fontWeight:700, marginBottom:18, color:'#fff', animationDelay:'.1s' }}>
            Unlock Your<br /><span style={{ color:'#64B5F6' }}>Full Potential</span>
          </h1>
          <p className="fade-up" style={{ fontSize:17, color:'rgba(255,255,255,.78)', lineHeight:1.75, marginBottom:40, maxWidth:500, margin:'0 auto 40px', animationDelay:'.2s' }}>
            Premium courses and ebooks crafted by industry experts. Learn at your pace, apply skills immediately.
          </p>

          {/* Search */}
          <div className="fade-up" style={{ position:'relative', maxWidth:560, margin:'0 auto', animationDelay:'.3s' }}>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1, position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17, color:'rgba(255,255,255,.5)', pointerEvents:'none' }}>🔍</span>
                <input value={search} onChange={e => handleSearch(e.target.value)}
                  placeholder="Search courses, ebooks, topics…"
                  style={{ width:'100%', padding:'15px 15px 15px 46px', borderRadius:12, border:'1.5px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.12)', fontSize:15, color:'#fff', outline:'none', backdropFilter:'blur(8px)', transition:'all .2s' }}
                  onFocus={e => { e.target.style.borderColor='rgba(255,255,255,.5)'; e.target.style.background='rgba(255,255,255,.18)'; }}
                  onBlur={e => { e.target.style.borderColor='rgba(255,255,255,.2)'; e.target.style.background='rgba(255,255,255,.12)'; }}
                />
              </div>
              <button onClick={() => nav(`/courses?q=${search}`)}
                style={{ padding:'0 24px', borderRadius:12, border:'none', background:'#fff', color:'var(--accent)', fontWeight:700, fontSize:15, cursor:'pointer', flexShrink:0, transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                Search
              </button>
            </div>
            {/* Live results */}
            {query && (
              <div className="scale-in" style={{ position:'absolute', top:'100%', left:0, right:0, marginTop:8, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, boxShadow:'var(--shadow-lg)', zIndex:100, maxHeight:340, overflowY:'auto', textAlign:'left' }}>
                {searching ? (
                  <div style={{ padding:24, display:'flex', justifyContent:'center' }}><Spinner size={22} /></div>
                ) : results.length ? results.map(p => (
                  <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { setSearch(''); setQuery(''); }}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--border)', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--accent-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ width:44, height:44, borderRadius:9, overflow:'hidden', flexShrink:0, background:'var(--bg3)' }}>
                      <img src={p.image} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>{p.type==='ebook'?'📖 eBook':'🎥 Course'} · {p.category}</p>
                    </div>
                    <span style={{ fontSize:15, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>${p.price}</span>
                  </Link>
                )) : <p style={{ padding:'16px 20px', fontSize:14, color:'var(--text3)' }}>No results for "{query}"</p>}
              </div>
            )}
          </div>
          <p className="fade-up" style={{ fontSize:13, color:'rgba(255,255,255,.45)', marginTop:16, animationDelay:'.4s' }}>Popular: React, Python, Figma, AI, Product Management</p>
        </div>
        <style>{`input::placeholder{color:rgba(255,255,255,.45)}`}</style>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'28px 24px' }}>
        <div className="page">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {STATS.map((s,i) => (
              <div key={s.l} className={`reveal delay-${i+1}`} style={{ textAlign:'center', padding:'20px 12px', borderRadius:12, transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--accent-bg)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
                <p style={{ fontSize:28, fontWeight:700, fontFamily:'Fraunces,serif', color:'var(--accent)', marginBottom:4 }}>{s.n}</p>
                <p style={{ fontSize:13, color:'var(--text3)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:580px){.page>div[style*="repeat(4"]{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding:'64px 24px' }}>
        <div className="page">
          <div ref={catsRef}>
            <h2 style={{ fontSize:32, marginBottom:8 }}>Browse by Category</h2>
            <p style={{ color:'var(--text2)', marginBottom:32, fontSize:15 }}>Find exactly what you need across our full library.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:14 }}>
            {CATEGORIES.map((c,i) => (
              <Link key={c.label} to={`/courses?cat=${c.label}`}
                className={`reveal delay-${Math.min(i+1,6)}`}
                style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'22px 16px', textAlign:'center', display:'block', transition:'all .24s var(--ease)' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.boxShadow='var(--shadow)';e.currentTarget.style.background='var(--accent-bg)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.background='var(--bg2)';}}>
                <div style={{ fontSize:30, marginBottom:10 }}>{c.emoji}</div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured courses ── */}
      <section style={{ padding:'0 24px 72px' }}>
        <div className="page">
          <div ref={featuredRef} style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:32 }}>
            <div>
              <h2 style={{ fontSize:32, marginBottom:8 }}>Featured Courses</h2>
              <p style={{ color:'var(--text2)', fontSize:15 }}>Hand-picked by our expert team.</p>
            </div>
            <Link to="/courses"><Button variant="outline" size="md">View All →</Button></Link>
          </div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><Spinner size={40} /></div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:26 }}>
              {featured.map((p,i) => (
                <div key={p.id} className={`reveal delay-${Math.min(i+1,6)}`}>
                  <ProductCard product={p} featured />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── eBooks CTA ── */}
      <section style={{ padding:'0 24px 72px' }}>
        <div className="page">
          <div ref={ebooksRef} style={{ background:'linear-gradient(135deg, #0D1B2A 0%, #1A3A6B 100%)', borderRadius:22, padding:'56px 52px', display:'flex', alignItems:'center', gap:52, flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
            <div style={{ flex:1, minWidth:260, position:'relative' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.12)', borderRadius:99, padding:'6px 16px', marginBottom:20, fontSize:13, color:'#90CAF9', fontWeight:600 }}>
                📚 eBook Library
              </div>
              <h2 style={{ fontSize:34, lineHeight:1.25, marginBottom:14, color:'#fff' }}>Knowledge you can<br />carry everywhere</h2>
              <p style={{ color:'rgba(255,255,255,.72)', lineHeight:1.75, marginBottom:30, fontSize:15 }}>
                Downloadable, DRM-free ebooks by leading practitioners. PDF, ePub & Kindle formats.
              </p>
              <Link to="/ebooks">
                <button style={{ background:'#fff', color:'var(--accent)', border:'none', padding:'13px 28px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.3)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                  Browse eBook Library →
                </button>
              </Link>
            </div>
            {!loading && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, flex:1, minWidth:240, position:'relative' }}>
                {featured.filter(p=>p.type==='ebook').slice(0,4).map(p => (
                  <Link key={p.id} to={`/product/${p.slug}`}
                    style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:14, display:'block', transition:'all .22s', backdropFilter:'blur(8px)' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.15)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.08)';e.currentTarget.style.transform='';}}>
                    <div style={{ height:56, borderRadius:8, overflow:'hidden', marginBottom:10, background:'rgba(255,255,255,.1)' }}>
                      <img src={p.image} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    </div>
                    <p style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)', lineHeight:1.4, marginBottom:5 }}>{p.title}</p>
                    <p style={{ fontSize:13, fontWeight:700, color:'#90CAF9' }}>${p.price}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding:'0 24px 72px' }}>
        <div className="page">
          <div ref={testimonialsRef} style={{ textAlign:'center', marginBottom:40 }}>
            <h2 style={{ fontSize:32, marginBottom:8 }}>What Our Learners Say</h2>
            <p style={{ color:'var(--text2)', fontSize:15 }}>Over 50,000 learners have transformed their careers.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:22 }}>
            {TESTIMONIALS.map((t,i) => (
              <div key={t.name} className={`reveal delay-${i+1}`}
                style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'28px 24px', transition:'all .26s var(--ease)' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';e.currentTarget.style.borderColor='var(--accent-border)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='var(--border)';}}>
                <div style={{ fontSize:28, color:'var(--accent)', marginBottom:14 }}>❝</div>
                <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.8, marginBottom:22 }}>{t.text}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600 }}>{t.name}</p>
                    <p style={{ fontSize:12, color:'var(--text3)' }}>{t.role}</p>
                  </div>
                  <span style={{ color:'var(--gold)', fontSize:14, letterSpacing:1 }}>★★★★★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding:'0 24px 90px' }}>
        <div className="page">
          <div ref={ctaRef} style={{ background:'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', borderRadius:24, padding:'72px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-50, left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.06)' }} />
            <img src="/logo.png" alt="EduVault" style={{ height:58, width:'auto', margin:'0 auto 24px', filter:'brightness(0) invert(1)', opacity:.85, position:'relative' }} />
            <h2 style={{ fontSize:40, color:'#fff', marginBottom:14, position:'relative' }}>Start Learning Today</h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,.78)', marginBottom:40, position:'relative' }}>Join 50,000+ learners unlocking their potential on EduVault.</p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', position:'relative' }}>
              <Link to="/courses">
                <button style={{ background:'#fff', color:'var(--accent)', border:'none', padding:'14px 32px', borderRadius:11, fontSize:15, fontWeight:700, cursor:'pointer', transition:'all .22s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.25)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>Browse Courses</button>
              </Link>
              <Link to="/signup">
                <button style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,.5)', padding:'14px 32px', borderRadius:11, fontSize:15, fontWeight:700, cursor:'pointer', transition:'all .22s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.12)';e.currentTarget.style.borderColor='rgba(255,255,255,.8)';e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(255,255,255,.5)';e.currentTarget.style.transform='';}}>Create Free Account</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
