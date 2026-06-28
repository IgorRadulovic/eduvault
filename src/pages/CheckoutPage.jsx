// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth, toast } from '../context';
import { Button, Input, Select } from '../components/ui';
import SEO from '../components/layout/SEO';
import { fmt$ } from '../utils/helpers';

const STEPS = ['Details', 'Payment', 'Confirmation'];

export default function CheckoutPage() {
  const { items, coupon, subtotal, discount, total, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState({
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') ?? '',
    email:     user?.email ?? '',
    country:   'United States',
  });
  const [payment, setPayment] = useState({ card:'', expiry:'', cvc:'', name:'' });
  const sd = k => v => setDetails(d => ({ ...d, [k]: v }));
  const sp = k => v => setPayment(p => ({ ...p, [k]: v }));

  // Format card number with spaces
  function fmtCard(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
  function fmtExpiry(v) { return v.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/, '$1/$2'); }

  if (items.length === 0 && step < 2) {
    return (
      <div className="page" style={{ paddingTop:80, textAlign:'center' }}>
        <SEO title="Checkout" noIndex />
        <h2 style={{ fontSize:24, marginBottom:16 }}>Your cart is empty</h2>
        <Link to="/courses"><Button variant="primary">Browse Courses</Button></Link>
      </div>
    );
  }

  async function handlePayment() {
    if (!payment.card || !payment.expiry || !payment.cvc || !payment.name) {
      toast.error('Please fill in all payment fields.');
      return;
    }
    setLoading(true);
    // TODO: Replace with real Stripe integration
    // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    // const { error } = await stripe.redirectToCheckout({ ... });
    await new Promise(r => setTimeout(r, 1800)); // simulate
    clearCart();
    setStep(2);
    setLoading(false);
  }

  return (
    <main>
      <SEO title="Checkout" noIndex />
      <div className="page" style={{ paddingTop:48, paddingBottom:80, maxWidth:960 }}>
        <h1 style={{ fontSize:32, marginBottom:8 }}>Checkout</h1>

        {/* Progress stepper */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:40, maxWidth:360 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background: i <= step ? 'var(--accent)' : 'var(--bg3)', color: i <= step ? '#fff' : 'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, transition:'background .3s', flexShrink:0 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize:13, fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text)' : 'var(--text3)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex:1, height:2, background: i < step ? 'var(--accent)' : 'var(--border)', margin:'0 10px', transition:'background .3s' }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 2 ? (
          /* ── Confirmation ── */
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--success-bg)', border:'2px solid var(--success-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 24px' }}>✓</div>
            <h2 style={{ fontSize:30, marginBottom:12 }}>Payment Successful!</h2>
            <p style={{ color:'var(--text2)', fontSize:15, marginBottom:8 }}>Thank you, {details.firstName}! Your order has been confirmed.</p>
            <p style={{ color:'var(--text3)', fontSize:14, marginBottom:36 }}>A receipt has been sent to <strong>{details.email}</strong></p>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'22px 24px', maxWidth:400, margin:'0 auto 36px', textAlign:'left' }}>
              <h3 style={{ fontSize:15, marginBottom:14 }}>Order Summary</h3>
              {items.length === 0
                ? <p style={{ color:'var(--text3)', fontSize:14 }}>Your purchases are now in My Courses.</p>
                : items.map(item => (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}>
                    <span style={{ color:'var(--text2)' }}>{item.title}</span>
                    <span style={{ fontWeight:600 }}>{fmt$(item.price)}</span>
                  </div>
                ))
              }
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:10, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15 }}>
                <span>Total paid</span><span style={{ color:'var(--accent)' }}>{fmt$(total || 0)}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <Link to="/my-courses"><Button variant="primary" size="lg">Go to My Courses</Button></Link>
              <Link to="/courses"><Button variant="secondary" size="lg">Keep Browsing</Button></Link>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'flex-start' }}>
            <div>
              {step === 0 && (
                /* ── Step 1: Details ── */
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'28px 28px' }}>
                  <h2 style={{ fontSize:18, marginBottom:22 }}>Billing Details</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                    <Input label="First name" value={details.firstName} onChange={sd('firstName')} placeholder="Jane" required />
                    <Input label="Last name"  value={details.lastName}  onChange={sd('lastName')}  placeholder="Smith" required />
                    <Input label="Email address" type="email" value={details.email} onChange={sd('email')} placeholder="jane@example.com" icon="✉️" required style={{ gridColumn:'1/-1' }} />
                    <Select label="Country" value={details.country} onChange={sd('country')} style={{ gridColumn:'1/-1' }}
                      options={['United States','United Kingdom','Canada','Australia','Germany','France','Other']} />
                  </div>
                  <Button variant="primary" size="lg" full onClick={() => {
                    if (!details.firstName || !details.email) { toast.error('Please fill in required fields.'); return; }
                    setStep(1);
                  }}>Continue to Payment →</Button>
                </div>
              )}

              {step === 1 && (
                /* ── Step 2: Payment ── */
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'28px 28px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
                    <h2 style={{ fontSize:18 }}>Payment Details</h2>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {['💳','🍎','🏦'].map(i => <span key={i} style={{ fontSize:18 }}>{i}</span>)}
                      <span style={{ fontSize:12, color:'var(--text3)' }}>🔒 Secured by Stripe</span>
                    </div>
                  </div>

                  <div style={{ background:'var(--info-bg)', border:'1px solid var(--info-border)', borderRadius:9, padding:'10px 14px', marginBottom:20, fontSize:13, color:'var(--info)' }}>
                    ℹ️ This is a demo. No real payment will be processed.
                  </div>

                  <Input label="Cardholder name" value={payment.name} onChange={sp('name')} placeholder="Jane Smith" icon="👤" required />
                  <Input label="Card number" value={payment.card} onChange={v => sp('card')(fmtCard(v))} placeholder="1234 5678 9012 3456" icon="💳" required />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                    <Input label="Expiry date" value={payment.expiry} onChange={v => sp('expiry')(fmtExpiry(v))} placeholder="MM/YY" required />
                    <Input label="CVC" value={payment.cvc} onChange={v => sp('cvc')(v.replace(/\D/g,'').slice(0,4))} placeholder="123" required />
                  </div>

                  <div style={{ display:'flex', gap:10 }}>
                    <Button variant="secondary" size="lg" onClick={() => setStep(0)}>← Back</Button>
                    <Button variant="primary" size="lg" full onClick={handlePayment} loading={loading}>
                      {loading ? 'Processing…' : `Pay ${fmt$(total)} →`}
                    </Button>
                  </div>

                  <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', marginTop:14 }}>
                    🔒 Your payment is encrypted and secure. 30-day money-back guarantee.
                  </p>
                </div>
              )}
            </div>

            {/* Order summary sidebar */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, padding:'24px 22px', position:'sticky', top:'calc(var(--header-h) + 20px)' }}>
              <h3 style={{ fontSize:16, marginBottom:18 }}>Order Summary</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:18 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <div style={{ width:48, height:48, borderRadius:9, overflow:'hidden', flexShrink:0, background:'var(--bg3)' }}>
                      <img src={item.image} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)' }}>{item.title}</p>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>{item.type === 'ebook' ? 'eBook' : 'Course'}</p>
                    </div>
                    <span style={{ fontWeight:600, fontSize:14, flexShrink:0 }}>{fmt$(item.price)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                  <span style={{ color:'var(--text2)' }}>Subtotal</span><span>{fmt$(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                    <span style={{ color:'var(--success)' }}>Discount ({coupon?.code})</span>
                    <span style={{ color:'var(--success)' }}>-{fmt$(discount)}</span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:700, borderTop:'1px solid var(--border)', paddingTop:10, marginTop:4 }}>
                  <span>Total</span><span style={{ color:'var(--accent)' }}>{fmt$(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@media(max-width:800px){main .page>div:last-child{grid-template-columns:1fr!important}main .page>div:last-child>div:last-child{position:static!important}}`}</style>
    </main>
  );
}
