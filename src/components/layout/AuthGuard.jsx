// src/components/layout/AuthGuard.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { Spinner } from '../ui';

// Full-screen spinner shown while Firebase resolves the initial auth state.
// Without this, protected pages would flash "not logged in" for ~300ms on refresh.
function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <img src="/logo.png" alt="EduVault" style={{ height:52, width:'auto', objectFit:'contain', opacity:.8 }} />
      <Spinner size={32} />
    </div>
  );
}

/** Redirect unauthenticated users to /login, preserving the intended destination */
export function RequireAuth({ children }) {
  const { isAuth, loading } = useAuth();
  const loc = useLocation();
  if (loading)  return <LoadingScreen />;
  if (!isAuth)  return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

/** Redirect non-admins. Unauthenticated users go to /login. */
export function RequireAdmin({ children }) {
  const { isAuth, isAdmin, loading } = useAuth();
  const loc = useLocation();
  if (loading)  return <LoadingScreen />;
  if (!isAuth)  return <Navigate to="/login" state={{ from: loc }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

/** Redirect already-authenticated users away from /login and /signup */
export function RequireGuest({ children }) {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuth)  return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  return children;
}
