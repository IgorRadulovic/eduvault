// src/components/layout/ErrorBoundary.jsx
import React from 'react';
import { Button } from '../ui';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to your error tracking service (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
        <div style={{ maxWidth:460 }}>
          <div style={{ fontSize:56, marginBottom:20 }}>⚠️</div>
          <h2 style={{ fontSize:24, marginBottom:12 }}>Something went wrong</h2>
          <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.7, marginBottom:28 }}>
            An unexpected error occurred on this page. Our team has been notified. You can try refreshing, or go back to the homepage.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{ background:'var(--danger-bg)', border:'1px solid var(--danger-border)', borderRadius:9, padding:14, fontSize:12, color:'var(--danger)', textAlign:'left', overflowX:'auto', marginBottom:24, whiteSpace:'pre-wrap' }}>
              {this.state.error.toString()}
            </pre>
          )}
          <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
            <Button variant="primary" onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="secondary" onClick={() => { this.setState({ hasError:false, error:null }); window.location.href='/'; }}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }
}
