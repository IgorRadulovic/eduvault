// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  const cols = [
    { title:'Learn', links:[{to:'/courses',l:'All Courses'},{to:'/ebooks',l:'eBooks'},{to:'/courses?cat=Development',l:'Development'},{to:'/courses?cat=Design',l:'Design'},{to:'/courses?cat=Business',l:'Business'}] },
    { title:'Company', links:[{to:'#',l:'About Us'},{to:'#',l:'Blog'},{to:'#',l:'Careers'},{to:'#',l:'Press Kit'}] },
    { title:'Support', links:[{to:'#',l:'Help Centre'},{to:'#',l:'Contact Us'},{to:'#',l:'Privacy Policy'},{to:'#',l:'Terms of Service'}] },
  ];

  return (
    <footer style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)', marginTop:'auto' }}>
      <div className="page" style={{ padding:'56px 24px 32px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr repeat(3,1fr)', gap:40, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:34, height:34, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🔐</div>
              <span style={{ fontFamily:'Fraunces,serif', fontSize:20, fontWeight:700, color:'var(--text)' }}>EduVault</span>
            </Link>
            <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7, maxWidth:280, marginBottom:20 }}>
              Premium courses and ebooks curated by world-class experts. Learn skills that matter, at your own pace.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              {['𝕏','in','▶','📘'].map((i,k) => (
                <a key={k} href="#" style={{ width:34, height:34, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'var(--text2)' }}>{i}</a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(c => (
            <div key={c.title}>
              <h4 style={{ fontSize:13, fontWeight:600, color:'var(--text)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:16 }}>{c.title}</h4>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                {c.links.map(l => (
                  <li key={l.l}><Link to={l.to} style={{ fontSize:14, color:'var(--text2)', transition:'color .15s' }} onMouseEnter={e=>e.target.style.color='var(--accent)'} onMouseLeave={e=>e.target.style.color='var(--text2)'}>{l.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:13, color:'var(--text3)' }}>© {year} EduVault. All rights reserved.</p>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>Secure payments powered by</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>Stripe</span>
            <span style={{ fontSize:13, color:'var(--text3)' }}>🔒</span>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          footer .page > div:first-child{grid-template-columns:1fr 1fr!important}
          footer .page > div:first-child > div:first-child{grid-column:1/-1}
        }
        @media(max-width:480px){
          footer .page > div:first-child{grid-template-columns:1fr!important}
        }
      `}</style>
    </footer>
  );
}
