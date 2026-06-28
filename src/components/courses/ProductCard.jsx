// src/components/courses/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart, toast } from '../../context';
import { Badge } from '../ui';
import { fmt$, fmtN, disc } from '../../utils/helpers';

export default function ProductCard({ product, featured }) {
  const { addItem, isInCart } = useCart();
  const inCart   = isInCart(product.id);
  const pct      = disc(product.price, product.originalPrice);
  const [imgErr, setImgErr] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`"${product.title}" added to cart!`);
  }

  // Fallback gradient if image fails
  const fallbackBg = `linear-gradient(135deg, ${product.color}22, ${product.color}55)`;

  return (
    <Link to={`/product/${product.slug}`} style={{ display:'block', height:'100%' }}>
      <article
        style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', transition:'transform .28s cubic-bezier(0.22,1,0.36,1), box-shadow .28s cubic-bezier(0.22,1,0.36,1), border-color .28s', height:'100%', display:'flex', flexDirection:'column', cursor:'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(13,27,42,.18)'; e.currentTarget.style.borderColor='var(--accent-border)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='var(--border)'; }}
      >
        {/* ── Image thumbnail ── */}
        <div style={{ height: featured ? 195 : 165, position:'relative', overflow:'hidden', flexShrink:0 }}>
          {!imgErr ? (
            <img
              src={product.image}
              alt={product.title}
              onError={() => setImgErr(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .45s cubic-bezier(0.22,1,0.36,1)' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', background: fallbackBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize: featured ? 56 : 46, opacity:.7 }}>📚</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,27,42,.55) 0%, transparent 55%)', pointerEvents:'none' }} />

          {/* Badges */}
          <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6, flexWrap:'wrap' }}>
            {product.bestseller && <Badge variant="gold" size="xs">⭐ Bestseller</Badge>}
            <Badge variant={product.type==='ebook'?'info':'accent'} size="xs">
              {product.type==='ebook' ? '📖 eBook' : '🎥 Course'}
            </Badge>
          </div>
          <div style={{ position:'absolute', top:12, right:12 }}>
            <Badge variant="success" size="xs">-{pct}%</Badge>
          </div>

          {/* Category label at bottom of image */}
          <p style={{ position:'absolute', bottom:10, left:12, fontSize:11, fontWeight:600, color:'rgba(255,255,255,.9)', textTransform:'uppercase', letterSpacing:'.7px' }}>
            {product.category}
          </p>
        </div>

        {/* ── Card body ── */}
        <div style={{ padding:'16px 18px 18px', display:'flex', flexDirection:'column', flex:1 }}>
          <h3 style={{ fontSize:15, fontWeight:600, lineHeight:1.4, marginBottom:6, color:'var(--text)', flex:1 }}>
            {product.title}
          </h3>
          <p style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>by {product.author}</p>

          {/* Rating */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
            <div style={{ display:'flex', gap:1 }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ color: s <= Math.round(product.rating) ? 'var(--gold)' : 'var(--border2)', fontSize:12 }}>★</span>
              ))}
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{product.rating}</span>
            <span style={{ fontSize:12, color:'var(--text3)' }}>({fmtN(product.reviewCount)})</span>
            <span style={{ fontSize:12, color:'var(--text3)', marginLeft:'auto' }}>{fmtN(product.students)} enrolled</span>
          </div>

          {/* Price + CTA */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
            <div>
              <span style={{ fontSize:20, fontWeight:700, color:'var(--accent)' }}>{fmt$(product.price)}</span>
              <span style={{ fontSize:13, color:'var(--text3)', textDecoration:'line-through', marginLeft:7 }}>{fmt$(product.originalPrice)}</span>
            </div>
            <button
              onClick={handleAdd}
              style={{
                padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer',
                background: inCart ? 'var(--success-bg)' : 'var(--accent)',
                color: inCart ? 'var(--success)' : '#fff',
                border: inCart ? '1px solid var(--success-border)' : 'none',
                transition:'all .2s cubic-bezier(0.22,1,0.36,1)',
                transform:'scale(1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; if(!inCart) e.currentTarget.style.background='var(--accent-h)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; if(!inCart) e.currentTarget.style.background='var(--accent)'; }}
            >
              {inCart ? '✓ In Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
