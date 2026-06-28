// src/pages/CartPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, toast } from '../context';
import { validateCoupon } from '../api/services';
import { Button, Input, Badge, EmptyState } from '../components/ui';
import { fmt$, disc } from '../utils/helpers';
import SEO from '../components/layout/SEO';

export default function CartPage() {
  const { items, coupon, setCoupon, removeItem, clearCart, subtotal, discount, total } = useCart();
  const [code, setCode]       = useState('');
  const [cErr, setCErr]       = useState('');
  const [cLoading, setCLoad]  = useState(false);
  const nav = useNavigate();

  async function applyCoupon() {
    if (!code.trim()) return;
    setCLoad(true); setCErr('');
    try {
      const c = await validateCoupon(code);
      setCoupon(c);
      toast.success(`Coupon "${c.code}" applied — ${c.type==='percent'?c.discount+'%':'$'+c.discount} off!`);
      setCode('');
    } catch (e) {
      setCErr(e.message);
    } finally { setCLoad(false); }
  }

  if (items.length === 0) return (
    <div className="page" style={{ paddingTop:80, paddingBottom:80 }}>
      <SEO title="Shopping Cart" noIndex />
      <EmptyState
        emoji="🛒"
        title="Your cart is empty"
        subtitle="Browse our courses and ebooks to get started."
        action={<Link to="/courses"><Button variant="primary" size="lg">Browse Courses</Button></Link>}
      />
    </div>
  );

  return (
    <main>
      <SEO title="Shopping Cart" noIndex />
      <div className="page" style={{ paddingTop:48, paddingBottom:80 }}>
        <h1 style={{ fontSize:34, marginBottom:32 }}>Your Cart ({items.length})</h1>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:32, alignItems:'flex-start' }}>
          {/* Items */}
          <div>
            {items.map(item => {
              const pct = disc(item.price, item.originalPrice);
              return (
                <div key={item.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', display:'flex', gap:18, alignItems:'center', marginBottom:14 }}>
                  <div style={{ width:64, height:64, background:`${item.color}22`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                    {item.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <Link to={`/product/${item.slug}`} style={{ fontSize:15, fontWeight:600, color:'var(--text)', display:'block', marginBottom:4 }}>{item.title}</Link>
                    <p style={{ fontSize:13, color:'var(--text3)', marginBottom:6 }}>by {item.author}</p>
                    <Badge variant={item.type==='ebook'?'info':'accent'} size="xs">{item.type==='ebook'?'eBook':'Course'}</Badge>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:18, fontWeight:700, color:'var(--accent)', marginBottom:2 }}>{fmt$(item.price)}</p>
                    <p style={{ fontSize:12, color:'var(--text3)', textDecoration:'line-through', marginBottom:8 }}>{fmt$(item.originalPrice)}</p>
                    <button onClick={() => { removeItem(item.id); toast.info('Item removed.'); }} style={{ fontSize:12, color:'var(--danger)', background:'none', border:'none', cursor:'pointer' }}>
                      🗑 Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button onClick={() => { clearCart(); toast.info('Cart cleared.'); }} style={{ fontSize:13, color:'var(--text3)', background:'none', border:'none', cursor:'pointer', marginTop:4 }}>
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'24px 22px', position:'sticky', top:'calc(var(--header-h) + 20px)' }}>
            <h2 style={{ fontSize:20, marginBottom:22 }}>Order Summary</h2>

            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:14 }}>
              <span style={{ color:'var(--text2)' }}>Subtotal ({items.length} items)</span>
              <span style={{ fontWeight:500 }}>{fmt$(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:14 }}>
                <span style={{ color:'var(--success)' }}>Discount ({coupon?.code})</span>
                <span style={{ color:'var(--success)', fontWeight:500 }}>-{fmt$(discount)}</span>
              </div>
            )}

            <div style={{ borderTop:'1px solid var(--border)', marginTop:16, paddingTop:16, display:'flex', justifyContent:'space-between', marginBottom:22 }}>
              <span style={{ fontSize:17, fontWeight:700 }}>Total</span>
              <span style={{ fontSize:22, fontWeight:700, color:'var(--accent)' }}>{fmt$(total)}</span>
            </div>

            {/* Coupon */}
            {!coupon ? (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:8 }}>Have a coupon?</p>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setCErr(''); }}
                    placeholder="COUPON CODE"
                    onKeyDown={e => e.key==='Enter' && applyCoupon()}
                    style={{ flex:1, padding:'9px 12px', background:'var(--bg)', border:`1px solid ${cErr?'var(--danger)':'var(--border2)'}`, borderRadius:8, fontSize:13, color:'var(--text)', outline:'none', letterSpacing:'.5px' }}
                  />
                  <Button variant="outline" size="sm" onClick={applyCoupon} loading={cLoading}>Apply</Button>
                </div>
                {cErr && <p style={{ fontSize:12, color:'var(--danger)', marginTop:5 }}>{cErr}</p>}
              </div>
            ) : (
              <div style={{ background:'var(--success-bg)', border:'1px solid var(--success-border)', borderRadius:9, padding:'10px 14px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:'var(--success)', fontWeight:500 }}>✓ Coupon "{coupon.code}" applied</span>
                <button onClick={() => setCoupon(null)} style={{ fontSize:12, color:'var(--text3)', background:'none', border:'none', cursor:'pointer' }}>Remove</button>
              </div>
            )}

            <Button variant="primary" size="lg" full onClick={() => nav('/checkout')}>
              Proceed to Checkout →
            </Button>

            <p style={{ textAlign:'center', fontSize:12, color:'var(--text3)', marginTop:14 }}>
              🔒 Secure checkout · 30-day money-back guarantee
            </p>

            <div style={{ borderTop:'1px solid var(--border)', marginTop:18, paddingTop:16 }}>
              <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', marginBottom:10 }}>Accepted payments</p>
              <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
                {['💳 Visa','💳 Mastercard','💳 Amex','🍎 Pay'].map(p=><span key={p} style={{ fontSize:11, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', color:'var(--text3)' }}>{p}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:860px){main .page>div:last-child{grid-template-columns:1fr!important}main .page>div:last-child>div:last-child{position:static!important}}`}</style>
    </main>
  );
}
