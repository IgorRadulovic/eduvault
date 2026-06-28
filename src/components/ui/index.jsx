// src/components/ui/index.jsx
import React, { useState, useEffect } from 'react';

/* ── Button ────────────────────────────────── */
export function Button({ children, variant='primary', size='md', onClick, disabled, loading, full, style={}, type='button' }) {
  const sz = {
    sm:   { padding:'7px 16px',  fontSize:13, borderRadius:8 },
    md:   { padding:'10px 22px', fontSize:14, borderRadius:9 },
    lg:   { padding:'13px 28px', fontSize:15, borderRadius:10 },
    xl:   { padding:'15px 36px', fontSize:16, borderRadius:11 },
    icon: { padding:'8px', fontSize:14, borderRadius:8, width:36, height:36 },
  };
  const vr = {
    primary:   { background:'var(--accent)',      color:'#fff',             border:'none' },
    secondary: { background:'var(--bg3)',          color:'var(--text)',       border:'1px solid var(--border)' },
    ghost:     { background:'transparent',         color:'var(--text2)',      border:'none' },
    danger:    { background:'var(--danger-bg)',    color:'var(--danger)',     border:'1px solid var(--danger-border)' },
    outline:   { background:'transparent',         color:'var(--accent)',     border:'1px solid var(--accent)' },
    gold:      { background:'var(--gold)',          color:'#fff',             border:'none' },
    success:   { background:'var(--success-bg)',   color:'var(--success)',    border:'1px solid var(--success-border)' },
    navy:      { background:'var(--navy)',          color:'#fff',             border:'none' },
  };
  const hoverMap = {
    primary:   { background:'var(--accent-h)' },
    secondary: { background:'var(--bg2)', borderColor:'var(--accent-border)' },
    ghost:     { background:'var(--bg3)' },
    outline:   { background:'var(--accent-bg)' },
    danger:    { background:'var(--danger-border)' },
  };
  const [hov, setHov] = useState(false);

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
        fontFamily:'inherit', fontWeight:600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition:'all .2s cubic-bezier(0.22,1,0.36,1)',
        whiteSpace:'nowrap', opacity: disabled || loading ? .55 : 1,
        width: full ? '100%' : 'auto',
        transform: hov && !disabled && !loading ? 'translateY(-1px)' : 'none',
        boxShadow: hov && !disabled && !loading && variant==='primary' ? 'var(--shadow-blue)' : 'none',
        ...sz[size],
        ...vr[variant],
        ...(hov && !disabled && !loading && hoverMap[variant] ? hoverMap[variant] : {}),
        ...style,
      }}
    >
      {loading && <Spinner size={14} color="currentColor" />}
      {children}
    </button>
  );
}

/* ── Badge ─────────────────────────────────── */
export function Badge({ children, variant='default', size='sm', dot, style={} }) {
  const v = {
    default: { bg:'var(--bg3)',        color:'var(--text2)' },
    success: { bg:'var(--success-bg)', color:'var(--success)' },
    danger:  { bg:'var(--danger-bg)',  color:'var(--danger)' },
    info:    { bg:'var(--info-bg)',    color:'var(--info)' },
    gold:    { bg:'var(--gold-bg)',    color:'var(--gold)' },
    accent:  { bg:'var(--accent-bg)', color:'var(--accent)' },
  };
  const s = {
    xs: { padding:'2px 8px',   fontSize:10 },
    sm: { padding:'3px 10px',  fontSize:11 },
    md: { padding:'5px 13px',  fontSize:12 },
  };
  const cv = v[variant] ?? v.default;
  return (
    <span style={{ background:cv.bg, color:cv.color, borderRadius:99, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4, ...s[size], ...style }}>
      {dot && <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', flexShrink:0 }} />}
      {children}
    </span>
  );
}

/* ── Input ─────────────────────────────────── */
export function Input({ label, type='text', value, onChange, placeholder, icon, error, hint, required:req, name, autoComplete, readOnly, style={} }) {
  const [show, setShow]   = useState(false);
  const [focus, setFocus] = useState(false);
  const t = type === 'password' && show ? 'text' : type;
  return (
    <div style={{ marginBottom:18, ...style }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>{label}{req && <span style={{ color:'var(--danger)', marginLeft:3 }}>*</span>}</label>}
      <div style={{ position:'relative' }}>
        {icon && <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:15, color: focus ? 'var(--accent)' : 'var(--text3)', pointerEvents:'none', transition:'color .2s' }}>{icon}</span>}
        <input type={t} value={value} name={name} autoComplete={autoComplete} readOnly={readOnly} placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ width:'100%', padding: icon ? '11px 42px 11px 40px' : '11px 42px 11px 14px', background:'var(--bg)', border:`1.5px solid ${error ? 'var(--danger)' : focus ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:9, fontSize:14, color:'var(--text)', outline:'none', transition:'border-color .2s, box-shadow .2s', boxShadow: focus ? '0 0 0 3px rgba(21,101,192,.12)' : 'none' }}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShow(s=>!s)} aria-label={show?'Hide':'Show'}
            style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:15, color:'var(--text3)', padding:2 }}>
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize:12, color:'var(--danger)', marginTop:5 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize:12, color:'var(--text3)', marginTop:5 }}>{hint}</p>}
    </div>
  );
}

/* ── Select ────────────────────────────────── */
export function Select({ label, value, onChange, options, error, required:req, style={} }) {
  return (
    <div style={{ marginBottom:18, ...style }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>{label}{req && <span style={{ color:'var(--danger)', marginLeft:3 }}>*</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1.5px solid var(--border2)', borderRadius:9, fontSize:14, color:'var(--text)', outline:'none', cursor:'pointer', transition:'border-color .2s' }}
        onFocus={e => e.target.style.borderColor='var(--accent)'}
        onBlur={e => e.target.style.borderColor='var(--border2)'}>
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ fontSize:12, color:'var(--danger)', marginTop:5 }}>{error}</p>}
    </div>
  );
}

/* ── Textarea ──────────────────────────────── */
export function Textarea({ label, value, onChange, placeholder, rows=4, error, required:req }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>{label}{req && <span style={{ color:'var(--danger)', marginLeft:3 }}>*</span>}</label>}
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1.5px solid var(--border2)', borderRadius:9, fontSize:14, color:'var(--text)', outline:'none', resize:'vertical', fontFamily:'inherit', transition:'border-color .2s' }}
        onFocus={e => e.target.style.borderColor='var(--accent)'}
        onBlur={e => e.target.style.borderColor='var(--border2)'}
      />
      {error && <p style={{ fontSize:12, color:'var(--danger)', marginTop:5 }}>{error}</p>}
    </div>
  );
}

/* ── Modal ─────────────────────────────────── */
export function Modal({ open, onClose, title, children, width=500, footer }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(7,17,28,.6)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} className="scale-in"
        style={{ background:'var(--surface)', borderRadius:18, width:'100%', maxWidth:width, maxHeight:'92vh', overflowY:'auto', boxShadow:'var(--shadow-lg)', border:'1px solid var(--border)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--surface)', zIndex:1, borderRadius:'18px 18px 0 0' }}>
          <h3 style={{ fontSize:17, fontWeight:600 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close"
            style={{ background:'var(--bg3)', border:'none', width:30, height:30, borderRadius:'50%', cursor:'pointer', fontSize:14, color:'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--danger-bg)'; e.currentTarget.style.color='var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text3)'; }}>
            ✕
          </button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
        {footer && <div style={{ padding:'14px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── Spinner ───────────────────────────────── */
export function Spinner({ size=22, color='var(--accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" style={{ animation:'spin .75s linear infinite', flexShrink:0 }} aria-hidden>
      <circle cx="11" cy="11" r="8.5" stroke={color} strokeWidth="2.5" fill="none" strokeDasharray="30" strokeLinecap="round" />
    </svg>
  );
}

/* ── Skeleton ──────────────────────────────── */
export function Skeleton({ w='100%', h=16, r=6 }) {
  return <div className="skeleton" style={{ width:w, height:h, borderRadius:r }} />;
}

/* ── Empty state ───────────────────────────── */
export function EmptyState({ emoji='📭', title, subtitle, action }) {
  return (
    <div style={{ textAlign:'center', padding:'70px 20px' }}>
      <div style={{ fontSize:52, marginBottom:16 }}>{emoji}</div>
      <h3 style={{ fontSize:20, marginBottom:8 }}>{title}</h3>
      {subtitle && <p style={{ fontSize:14, color:'var(--text2)', marginBottom:24, maxWidth:360, margin:'0 auto 24px' }}>{subtitle}</p>}
      {action}
    </div>
  );
}

/* ── Confirm modal ─────────────────────────── */
export function Confirm({ open, onClose, onConfirm, title, message, danger, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title ?? 'Are you sure?'} width={400}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={danger?'danger':'primary'} onClick={onConfirm} loading={loading}>{danger?'Delete':'Confirm'}</Button></>}>
      <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65 }}>{message}</p>
    </Modal>
  );
}

/* ── Stat card ─────────────────────────────── */
export function StatCard({ label, value, sub, icon, color='var(--accent)', trend }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:'20px 22px', transition:'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <p style={{ fontSize:13, color:'var(--text3)', fontWeight:500 }}>{label}</p>
        <span style={{ fontSize:22 }}>{icon}</span>
      </div>
      <p style={{ fontSize:28, fontWeight:700, fontFamily:'Fraunces,serif', color, marginBottom:4 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color: trend==='up'?'var(--success)':trend==='down'?'var(--danger)':'var(--text3)' }}>{sub}</p>}
    </div>
  );
}

/* ── Table ─────────────────────────────────── */
export function Table({ cols, rows, empty }) {
  if (!rows?.length) return empty ?? null;
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg3)' }}>
            {cols.map(c => (
              <th key={c.key ?? c.label} style={{ padding:'11px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.7px', whiteSpace:'nowrap' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom:'1px solid var(--border)', background:ri%2===0?'transparent':'var(--bg3)', transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--accent-bg)'}
              onMouseLeave={e => e.currentTarget.style.background=ri%2===0?'transparent':'var(--bg3)'}>
              {cols.map(c => (
                <td key={c.key ?? c.label} style={{ padding:'13px 16px', fontSize:14, color:'var(--text2)', verticalAlign:'middle' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
