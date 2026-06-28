// src/pages/auth/AuthPages.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Input } from '../../components/ui';
import SEO from '../../components/layout/SEO';
import { useForm, required, isEmail, minLen, matches, composeV } from '../../hooks';

/* ── Shared card wrapper ───────────────────────── */
function AuthCard({ children, title, sub }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/">
            <img src="/logo.png" alt="EduVault" style={{ height:56, width:'auto', margin:'0 auto 18px', objectFit:'contain' }} />
          </Link>
          <h1 style={{ fontSize:26, fontWeight:700, marginBottom:8 }}>{title}</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>{sub}</p>
        </div>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:'32px 28px', boxShadow:'var(--shadow)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Google button ─────────────────────────────── */
function GoogleButton({ onClick, loading, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:12,
        padding:'11px 20px', borderRadius:9, border:'1.5px solid var(--border2)',
        background: hov ? 'var(--bg3)' : 'var(--bg)',
        color:'var(--text)', fontSize:14, fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer',
        transition:'all .18s', opacity: loading ? .6 : 1,
      }}>
      {/* Google "G" logo SVG */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      {loading ? 'Please wait…' : label}
    </button>
  );
}

/* ── Divider ───────────────────────────────────── */
function Divider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
      <span style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>or continue with email</span>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
    </div>
  );
}

/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
export function LoginPage() {
  const { login, loginWithGoogle, authLoading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [apiErr, setApiErr] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { values, errors, set, validate } = useForm(
    { email:'', password:'' },
    {
      email:    composeV(required(), isEmail()),
      password: required('Password is required.'),
    }
  );

  const dest = loc.state?.from?.pathname ?? '/';

  async function handleLogin() {
    if (!validate()) return;
    setApiErr('');
    try {
      const u = await login(values);
      nav(u?.role === 'admin' ? '/admin' : dest, { replace: true });
    } catch (e) {
      setApiErr(e.message);
    }
  }

  async function handleGoogle() {
    setApiErr(''); setGoogleLoading(true);
    try {
      const u = await loginWithGoogle();
      if (u) nav(u?.role === 'admin' ? '/admin' : dest, { replace: true });
    } catch (e) {
      setApiErr(e.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" sub="Sign in to continue learning">
      <SEO title="Sign In" noIndex />

      {apiErr && (
        <div style={{ background:'var(--danger-bg)', border:'1px solid var(--danger-border)', borderRadius:9, padding:'10px 14px', marginBottom:18, fontSize:13, color:'var(--danger)' }}>
          {apiErr}
        </div>
      )}

      {/* Google sign-in */}
      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continue with Google" />

      <Divider />

      <Input label="Email address" type="email" value={values.email} onChange={set('email')}
        placeholder="you@example.com" icon="✉️" error={errors.email} autoComplete="email" required />
      <Input label="Password" type="password" value={values.password} onChange={set('password')}
        placeholder="Enter your password" icon="🔒" error={errors.password} autoComplete="current-password" required />

      <div style={{ textAlign:'right', marginBottom:22, marginTop:-8 }}>
        <Link to="/forgot-password" style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>
          Forgot password?
        </Link>
      </div>

      <Button variant="primary" size="lg" full onClick={handleLogin} loading={authLoading}>
        Sign In
      </Button>

      <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text2)' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color:'var(--accent)', fontWeight:600 }}>Create one →</Link>
      </p>
    </AuthCard>
  );
}

/* ══════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════ */
export function SignupPage() {
  const { signup, loginWithGoogle, authLoading } = useAuth();
  const nav = useNavigate();
  const [apiErr, setApiErr] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { values, errors, set, validate } = useForm(
    { name:'', email:'', password:'', confirm:'' },
    {
      name:     composeV(required(), minLen(2, 'Name must be at least 2 characters.')),
      email:    composeV(required(), isEmail()),
      password: composeV(required(), minLen(6, 'Password must be at least 6 characters.')),
      confirm:  composeV(required('Please confirm your password.'), matches('password', 'Passwords do not match.')),
    }
  );

  async function handleSignup() {
    if (!validate()) return;
    setApiErr('');
    try {
      await signup(values);
      nav('/');
    } catch (e) {
      setApiErr(e.message);
    }
  }

  async function handleGoogle() {
    setApiErr(''); setGoogleLoading(true);
    try {
      const u = await loginWithGoogle();
      if (u) nav('/');
    } catch (e) {
      setApiErr(e.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthCard title="Create account" sub="Start your learning journey today">
      <SEO title="Create Account" noIndex />

      {apiErr && (
        <div style={{ background:'var(--danger-bg)', border:'1px solid var(--danger-border)', borderRadius:9, padding:'10px 14px', marginBottom:18, fontSize:13, color:'var(--danger)' }}>
          {apiErr}
        </div>
      )}

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />

      <Divider />

      <Input label="Full name" value={values.name} onChange={set('name')}
        placeholder="Jane Smith" icon="👤" error={errors.name} autoComplete="name" required />
      <Input label="Email address" type="email" value={values.email} onChange={set('email')}
        placeholder="you@example.com" icon="✉️" error={errors.email} autoComplete="email" required />
      <Input label="Password" type="password" value={values.password} onChange={set('password')}
        placeholder="Create a password" icon="🔒" error={errors.password}
        autoComplete="new-password" hint="At least 6 characters." required />
      <Input label="Confirm password" type="password" value={values.confirm} onChange={set('confirm')}
        placeholder="Repeat password" icon="🔒" error={errors.confirm} autoComplete="new-password" required />

      <Button variant="primary" size="lg" full onClick={handleSignup} loading={authLoading}>
        Create Account
      </Button>

      <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign in →</Link>
      </p>

      <p style={{ textAlign:'center', marginTop:14, fontSize:12, color:'var(--text3)' }}>
        By signing up you agree to our{' '}
        <a href="#" style={{ color:'var(--accent)' }}>Terms</a> and{' '}
        <a href="#" style={{ color:'var(--accent)' }}>Privacy Policy</a>.
      </p>
    </AuthCard>
  );
}

/* ══════════════════════════════════════
   FORGOT PASSWORD PAGE
══════════════════════════════════════ */
export function ForgotPasswordPage() {
  const { forgotPassword, authLoading } = useAuth();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [err, setErr]       = useState('');

  async function handleSubmit() {
    if (!email) { setErr('Please enter your email address.'); return; }
    setErr('');
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <AuthCard title="Reset password" sub="We'll send a reset link to your email">
      <SEO title="Reset Password" noIndex />

      {sent ? (
        <div style={{ textAlign:'center', padding:'8px 0' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
          <h3 style={{ fontSize:18, marginBottom:10 }}>Check your inbox</h3>
          <p style={{ fontSize:14, color:'var(--text2)', marginBottom:8, lineHeight:1.6 }}>
            A password reset link has been sent to <strong>{email}</strong>
          </p>
          <p style={{ fontSize:13, color:'var(--text3)', marginBottom:28 }}>
            Check your spam folder if you don't see it within a minute.
          </p>
          <Link to="/login">
            <Button variant="primary" size="md" full>Back to Sign In</Button>
          </Link>
        </div>
      ) : (
        <>
          {err && (
            <div style={{ background:'var(--danger-bg)', border:'1px solid var(--danger-border)', borderRadius:9, padding:'10px 14px', marginBottom:18, fontSize:13, color:'var(--danger)' }}>
              {err}
            </div>
          )}
          <Input label="Email address" type="email" value={email} onChange={setEmail}
            placeholder="you@example.com" icon="✉️"
            autoComplete="email" />
          <Button variant="primary" size="lg" full onClick={handleSubmit} loading={authLoading}>
            Send Reset Link
          </Button>
          <p style={{ textAlign:'center', marginTop:18, fontSize:13 }}>
            <Link to="/login" style={{ color:'var(--accent)' }}>← Back to Sign In</Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
