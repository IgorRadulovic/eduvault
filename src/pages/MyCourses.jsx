// src/pages/MyCourses.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { getUserEnrollments } from '../api/services';
import { Button, EmptyState, Badge, Spinner } from '../components/ui';
import SEO from '../components/layout/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const headRef = useScrollReveal();

  useEffect(() => {
    if (!user?.id) return;
    getUserEnrollments(user.id)
      .then(data => { setEnrollments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  return (
    <main>
      <SEO title="My Courses" noIndex />
      <div className="page" style={{ paddingTop:48, paddingBottom:80 }}>
        <div ref={headRef} style={{ marginBottom:36 }}>
          <h1 style={{ fontSize:34, marginBottom:8 }}>My Learning</h1>
          <p style={{ color:'var(--text2)', fontSize:15 }}>
            {enrollments.length} item{enrollments.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>
        ) : enrollments.length === 0 ? (
          <EmptyState emoji="📚" title="No courses yet"
            subtitle="Browse our catalogue and enrol in your first course or ebook."
            action={<Link to="/courses"><Button variant="primary" size="lg">Browse Courses</Button></Link>} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:22 }}>
            {enrollments.map((enr, i) => {
              const p = enr.products;
              if (!p) return null;
              return (
                <div key={enr.id} className={`reveal delay-${Math.min(i+1,6)}`}
                  style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', transition:'all .26s var(--ease)' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                  <div style={{ height:120, overflow:'hidden', position:'relative' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', background:`${p.color??'#1565C0'}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>📚</div>
                    )}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,27,42,.5) 0%, transparent 60%)' }} />
                  </div>
                  <div style={{ padding:18 }}>
                    <Badge variant={p.type==='ebook'?'info':'accent'} size="xs" style={{ marginBottom:10 }}>
                      {p.type==='ebook'?'📖 eBook':'🎥 Course'}
                    </Badge>
                    <h3 style={{ fontSize:15, fontWeight:600, marginBottom:6, lineHeight:1.4, color:'var(--text)' }}>{p.title}</h3>
                    <p style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>by {p.author}</p>

                    {/* Progress bar */}
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:5 }}>
                        <span>Progress</span>
                        <span style={{ fontWeight:600, color:enr.progress===100?'var(--success)':'var(--text2)' }}>
                          {enr.progress===100?'✓ Complete':`${enr.progress}%`}
                        </span>
                      </div>
                      <div style={{ background:'var(--bg3)', borderRadius:99, height:7, overflow:'hidden' }}>
                        <div style={{ width:`${enr.progress}%`, height:7, borderRadius:99, background: enr.progress===100?'var(--success)':'var(--accent)', transition:'width .6s var(--ease)' }} />
                      </div>
                    </div>
                    <Link to={`/product/${p.slug}`}>
                      <Button variant={enr.progress===100?'success':'primary'} size="sm" full>
                        {enr.progress===100?'✓ Review Course':'Continue Learning →'}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
