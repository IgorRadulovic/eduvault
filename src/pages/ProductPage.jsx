// src/pages/ProductPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../api/services';
import { useCart, toast } from '../context';
import { Button, Badge, Spinner, Skeleton } from '../components/ui';
import SEO from '../components/layout/SEO';
import { fmt$, disc, fmtN } from '../utils/helpers';

export default function ProductPage() {
  const { slug }   = useParams();
  const nav        = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [imgErr, setImgErr]   = useState(false);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    setLoading(true); setError(null); setImgErr(false);
    getProductBySlug(slug)
      .then(p => { setProduct(p); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="page" style={{ paddingTop:48, paddingBottom:80 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:48 }}>
        <div>
          <Skeleton w="100%" h={240} r={16} />
          <div style={{ marginTop:24 }}><Skeleton w="60%" h={14} r={6} /><br/><Skeleton w="100%" h={36} r={6} /><br/><Skeleton w="80%" h={18} r={6} /></div>
        </div>
        <div><Skeleton w="100%" h={340} r={16} /></div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div style={{ textAlign:'center', padding:'100px 20px' }}>
      <SEO title="Not Found" noIndex />
      <div style={{ fontSize:52, marginBottom:16 }}>😕</div>
      <h2 style={{ fontSize:26, marginBottom:12 }}>Product not found</h2>
      <p style={{ color:'var(--text2)', marginBottom:28 }}>{error || 'This product does not exist or has been removed.'}</p>
      <Button variant="primary" onClick={() => nav(-1)}>← Go Back</Button>
    </div>
  );

  const inCart = isInCart(product.id);
  const pct    = disc(product.price, product.originalPrice);

  function handleAdd() {
    addItem(product);
    toast.success(`"${product.title}" added to cart!`);
  }

  const features = product.type === 'course'
    ? ['♾️ Lifetime access', '📱 Mobile & desktop', '🏆 Certificate of completion', '💬 Community access', '🔄 30-day money-back guarantee']
    : ['📥 Instant download after purchase', '📖 All formats included (PDF + ePub)', '♾️ Yours to keep forever', '🔄 30-day money-back guarantee'];

  return (
    <main>
      <SEO title={product.title} description={product.description} image={product.image} />

      <div className="page" style={{ paddingTop:48, paddingBottom:80 }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display:'flex', gap:8, alignItems:'center', marginBottom:36, fontSize:13, color:'var(--text3)' }}>
          <Link to="/" className="link-hover" style={{ color:'var(--text3)' }}>Home</Link>
          <span>›</span>
          <Link to={product.type==='ebook'?'/ebooks':'/courses'} className="link-hover" style={{ color:'var(--text3)', textTransform:'capitalize' }}>
            {product.type==='ebook' ? 'eBooks' : 'Courses'}
          </Link>
          <span>›</span>
          <span style={{ color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:300 }}>{product.title}</span>
        </nav>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:52, alignItems:'flex-start' }}>
          {/* ── Left ── */}
          <div>
            {/* Hero image */}
            <div style={{ height:280, borderRadius:18, overflow:'hidden', marginBottom:32, border:'1px solid var(--border)', position:'relative' }}>
              {!imgErr ? (
                <img src={product.image} alt={product.title} onError={() => setImgErr(true)}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${product.color}22,${product.color}55)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80 }}>📚</div>
              )}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,27,42,.4) 0%, transparent 60%)', pointerEvents:'none' }} />
            </div>

            {/* Badges */}
            <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
              {product.bestseller && <Badge variant="gold">⭐ Bestseller</Badge>}
              <Badge variant={product.type==='ebook'?'info':'accent'}>{product.type==='ebook'?'📖 eBook':'🎥 Course'}</Badge>
              <Badge variant="default">{product.category}</Badge>
              {product.level && <Badge variant="default">{product.level}</Badge>}
            </div>

            <h1 style={{ fontSize:34, lineHeight:1.2, fontWeight:700, marginBottom:14 }}>{product.title}</h1>
            <p style={{ fontSize:16, color:'var(--text2)', lineHeight:1.8, marginBottom:22 }}>{product.description}</p>

            {/* Meta row */}
            <div style={{ display:'flex', gap:20, alignItems:'center', marginBottom:28, flexWrap:'wrap', padding:'16px 20px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--gold)', fontSize:16 }}>{'★'.repeat(Math.round(product.rating))}</span>
                <span style={{ fontWeight:700 }}>{product.rating}</span>
                <span style={{ color:'var(--text3)', fontSize:13 }}>({fmtN(product.reviewCount)} reviews)</span>
              </div>
              <span style={{ color:'var(--border2)' }}>|</span>
              <span style={{ fontSize:14, color:'var(--text2)' }}>👥 {fmtN(product.students)} enrolled</span>
              <span style={{ color:'var(--border2)' }}>|</span>
              <span style={{ fontSize:14, color:'var(--text2)' }}>✍️ {product.author}</span>
              <span style={{ color:'var(--border2)' }}>|</span>
              <span style={{ fontSize:13, color:'var(--text3)' }}>🔄 Updated {product.lastUpdated}</span>
            </div>

            {/* Details grid */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'24px', marginBottom:28 }}>
              <h3 style={{ fontSize:17, marginBottom:18 }}>
                {product.type === 'course' ? 'Course Details' : 'eBook Details'}
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                {product.type === 'course' && <>
                  <Detail icon="⏱" label="Duration"    value={product.duration} />
                  <Detail icon="📋" label="Lessons"     value={`${product.lessons} lessons`} />
                  <Detail icon="🎯" label="Level"       value={product.level} />
                  <Detail icon="🌍" label="Language"    value="English" />
                  <Detail icon="🏆" label="Certificate" value="Yes, on completion" />
                  <Detail icon="♾️" label="Access"      value="Lifetime" />
                </>}
                {product.type === 'ebook' && <>
                  <Detail icon="📄" label="Pages"    value={`${product.pages} pages`} />
                  <Detail icon="📁" label="Formats"  value={product.format} />
                  <Detail icon="🌍" label="Language" value="English" />
                  <Detail icon="📥" label="Download" value="Instant, lifetime" />
                </>}
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:10 }}>Topics</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {product.tags.map(t => (
                    <Link key={t} to={`/courses?q=${t}`}
                      style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:99, padding:'5px 14px', fontSize:13, color:'var(--text2)', transition:'all .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='var(--accent-bg)'; e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.color='var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; }}>
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Purchase card ── */}
          <div style={{ position:'sticky', top:'calc(var(--header-h) + 20px)' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:18, padding:'28px 26px', boxShadow:'var(--shadow)' }}>
              <div style={{ marginBottom:22 }}>
                <span style={{ fontSize:36, fontWeight:700, color:'var(--accent)' }}>{fmt$(product.price)}</span>
                <span style={{ fontSize:16, color:'var(--text3)', textDecoration:'line-through', marginLeft:12 }}>{fmt$(product.originalPrice)}</span>
                <span style={{ marginLeft:10, background:'var(--success-bg)', color:'var(--success)', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:700 }}>{pct}% off</span>
              </div>

              <Button variant={inCart ? 'success' : 'primary'} size="lg" full onClick={handleAdd} style={{ marginBottom:10 }}>
                {inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </Button>
              <Link to="/cart">
                <Button variant="secondary" size="lg" full>View Cart</Button>
              </Link>

              <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:14 }}>This purchase includes</p>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10, fontSize:13, color:'var(--text2)' }}>
                    <span style={{ color:'var(--success)', flexShrink:0, marginTop:1 }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid var(--border)', textAlign:'center' }}>
                <p style={{ fontSize:12, color:'var(--text3)' }}>🔒 Secure checkout via Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){main .page>div:last-child{grid-template-columns:1fr!important}main .page>div:last-child>div:last-child{position:static!important}}`}</style>
    </main>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
      <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{value}</p>
      </div>
    </div>
  );
}
