// src/context/index.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authLogin, authSignup, authLogout,
  authLoginWithGoogle, authForgotPassword,
  onAuthStateChange, getStoredUser,
} from '../api/services';

/* ══════════════════════════════════════
   AUTH CONTEXT
   Uses Firebase onAuthStateChanged as the
   single source of truth — survives page refreshes,
   tab switches, and token expiry automatically.
══════════════════════════════════════ */
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // Start with stored user so there's no flash of "logged out" on refresh
  const [user, setUser]           = useState(getStoredUser);
  const [loading, setLoading]     = useState(true);   // true until Firebase resolves
  const [authLoading, setAuthLoading] = useState(false); // true during login/signup calls
  const [error, setError]         = useState(null);

  // Subscribe to Firebase auth state — this is the canonical source of truth.
  // Fires immediately on mount (with the current user or null), then on every change.
  useEffect(() => {
    const unsubscribe = onAuthStateChange(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  const login = useCallback(async (creds) => {
    setAuthLoading(true); setError(null);
    try {
      const u = await authLogin(creds);
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    setAuthLoading(true); setError(null);
    try {
      const u = await authSignup(data);
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAuthLoading(true); setError(null);
    try {
      const u = await authLoginWithGoogle();
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data) => {
    setAuthLoading(true); setError(null);
    try {
      return await authForgotPassword(data);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    // Firebase onAuthStateChanged fires → sets user to null automatically
    window.dispatchEvent(new Event('eduvault:logout'));
  }, []);

  return (
    <AuthCtx.Provider value={{
      user,
      loading,           // true while Firebase resolves initial auth state
      authLoading,       // true during login/signup/google calls
      error,
      isAuth:   !!user,
      isAdmin:  user?.role === 'admin',
      login,
      signup,
      loginWithGoogle,
      forgotPassword,
      logout,
      clearError: () => setError(null),
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>');
  return c;
};

/* ══════════════════════════════════════
   THEME CONTEXT
══════════════════════════════════════ */
const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('eduvault_theme');
    return s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('eduvault_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeCtx.Provider>
  );
}
export const useTheme = () => useContext(ThemeCtx);

/* ══════════════════════════════════════
   CART CONTEXT
══════════════════════════════════════ */
const CartCtx = createContext(null);
const CART_KEY = 'eduvault_cart';

export function CartProvider({ children }) {
  const [items, setItems]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; }
    catch { return []; }
  });
  const [coupon, setCouponState] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // Clear cart on logout
  useEffect(() => {
    const h = () => { setItems([]); setCouponState(null); localStorage.removeItem(CART_KEY); };
    window.addEventListener('eduvault:logout', h);
    return () => window.removeEventListener('eduvault:logout', h);
  }, []);

  const addItem    = p   => setItems(prev => prev.find(i => i.id === p.id) ? prev : [...prev, p]);
  const removeItem = id  => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart  = ()  => { setItems([]); setCouponState(null); localStorage.removeItem(CART_KEY); };
  const isInCart   = id  => items.some(i => i.id === id);

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = coupon
    ? coupon.type === 'percent' ? (subtotal * coupon.discount) / 100 : coupon.discount
    : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <CartCtx.Provider value={{
      items, coupon, setCoupon: setCouponState,
      addItem, removeItem, clearCart, isInCart,
      count: items.length, subtotal, discount, total,
    }}>
      {children}
    </CartCtx.Provider>
  );
}
export const useCart = () => useContext(CartCtx);

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let _push = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  _push = (msg, type = 'info', duration = 3800) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  const icons   = { info:'ℹ️', success:'✅', error:'❌', warning:'⚠️' };
  const borders = { info:'var(--info)', success:'var(--success)', error:'var(--danger)', warning:'var(--gold)' };

  return (
    <>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} className="fade-up"
            style={{ background:'var(--surface)', border:`1px solid var(--border)`, borderLeft:`3px solid ${borders[t.type]}`, borderRadius:11, padding:'12px 18px', boxShadow:'var(--shadow-lg)', fontSize:14, color:'var(--text)', display:'flex', alignItems:'center', gap:10, maxWidth:360, pointerEvents:'all' }}>
            <span style={{ fontSize:16 }}>{icons[t.type]}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export const toast = {
  info:    m => _push?.(m, 'info'),
  success: m => _push?.(m, 'success'),
  error:   m => _push?.(m, 'error'),
  warning: m => _push?.(m, 'warning'),
};
