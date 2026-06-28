// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>404</h1>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Page not found</h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/"><Button variant="primary" size="lg">Go Home</Button></Link>
          <Link to="/courses"><Button variant="secondary" size="lg">Browse Courses</Button></Link>
        </div>
      </div>
    </div>
  );
}
