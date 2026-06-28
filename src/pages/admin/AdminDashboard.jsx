// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, toast } from '../../context';
import {
  getOrderStats, getOrders, getUsers, getCoupons, getProducts,
  createProduct, updateProduct, deleteProduct,
  createUser, updateUserStatus, deleteUser,
  createCoupon, updateCoupon, deleteCoupon,
} from '../../api/services';
import { REVENUE_BY_MONTH, CATEGORIES } from '../../api/mockData';
import {
  Button, Badge, Modal, Input, Select, Textarea,
  Confirm, StatCard, Spinner, Table,
} from '../../components/ui';
import { fmt$, fmtN, inits } from '../../utils/helpers';

const TABS = [
  { id: 'overview', icon: '📈', label: 'Overview' },
  { id: 'products', icon: '📚', label: 'Products' },
  { id: 'orders',   icon: '🛒', label: 'Orders' },
  { id: 'users',    icon: '👥', label: 'Users' },
  { id: 'coupons',  icon: '🎫', label: 'Coupons' },
];

function Sidebar({ active, setActive, user, dark, toggleDark }) {
  const name = user?.name ?? 'Admin';
  return (
    <aside style={{ width: '240px', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="EduVault" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <p style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 2 }}>Admin</p>
        </Link>
      </div>
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, border: 'none', background: active === t.id ? 'var(--accent-bg)' : 'transparent', color: active === t.id ? 'var(--accent)' : 'var(--text2)', fontWeight: active === t.id ? 600 : 400, fontSize: 14, cursor: 'pointer', marginBottom: 2, textAlign: 'left', transition: 'background .15s' }}>
            <span style={{ fontSize: 17 }}>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={toggleDark} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text2)', fontSize: 14, cursor: 'pointer', marginBottom: 4, textAlign: 'left' }}>
          {dark ? '☀️' : '🌙'} {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 10, fontSize: 14, color: 'var(--text2)', marginBottom: 8 }}>← Back to Site</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{inits(name)}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    getOrderStats().then(setStats).catch(e => toast.error(e.message));
    getOrders().then(d => setOrders(d.orders.slice(0, 5))).catch(e => toast.error(e.message));
    getProducts({ limit: 50 }).then(d => setProducts(d.products)).catch(e => toast.error(e.message));
  }, []);
  const maxR = Math.max(...REVENUE_BY_MONTH.map(m => m.revenue));
  const topProducts = [...products].sort((a, b) => (b.students ?? 0) - (a.students ?? 0)).slice(0, 5);
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>Welcome back! Here's what's happening today.</p>
      </div>
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Revenue" value={fmt$(stats.revenue)} icon="💰" sub="↑ 12% this month" trend="up" />
          <StatCard label="Total Students" value={fmtN(products.reduce((sum, p) => sum + (p.students ?? 0), 0))} icon="👥" sub="Across active products" trend="up" color="var(--info)" />
          <StatCard label="Active Products" value={products.length} icon="📚" color="var(--success)" />
          <StatCard label="Pending Orders" value={stats.pending} icon="🛒" color="var(--gold)" />
        </div>
      ) : <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div>}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Revenue — Last 12 Months</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 160 }}>
            {REVENUE_BY_MONTH.map((m, i) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div title={fmt$(m.revenue)} style={{ width: '100%', background: i === 11 ? 'var(--accent)' : 'var(--border2)', borderRadius: '4px 4px 0 0', height: `${(m.revenue / maxR) * 140}px`, minHeight: 4, cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.background = i === 11 ? 'var(--accent)' : 'var(--border2)'} />
                <span style={{ fontSize: 9, color: 'var(--text3)' }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 20px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Orders</h3>
          {orders.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{(o.user ?? o.userId ?? 'Customer').split(' ')[0]}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)' }}>{o.item.slice(0, 22)}…</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{fmt$(o.amount)}</p>
                <Badge variant={o.status === 'completed' ? 'success' : o.status === 'pending' ? 'gold' : 'danger'} size="xs">{o.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
        <h3 style={{ fontSize: 16, marginBottom: 18 }}>Top Products by Enrollment</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topProducts.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{p.title}</span>
                  <span style={{ fontSize: 13, color: 'var(--text3)', flexShrink: 0 }}>{fmtN(p.students)}</span>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 6 }}>
                  <div style={{ width: `${Math.min(((p.students ?? 0) / Math.max(1, topProducts[0]?.students ?? 1)) * 100, 100)}%`, height: 6, borderRadius: 99, background: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EMPTY_P = { title: '', author: '', price: '', originalPrice: '', category: 'Development', type: 'course', description: '', emoji: '📚', level: 'Beginner', duration: '', lessons: '', pages: '', format: 'PDF + ePub', tags: '', bestseller: false, featured: false };

function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_P);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState(null);
  const [delLoading, setDelLoad] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const sf = k => v => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    getProducts({ limit: 50 })
      .then(d => setItems(d.products))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setEditing(null); setForm(EMPTY_P); setModal(true); }
  function openEdit(item) {
    setEditing(item);
    setForm({ ...item, price: String(item.price), originalPrice: String(item.originalPrice), lessons: String(item.lessons ?? ''), pages: String(item.pages ?? ''), tags: (item.tags ?? []).join(', ') });
    setModal(true);
  }

  async function handleSave() {
    if (!form.title || !form.author || !form.price) return;
    setSaving(true);
    const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), lessons: Number(form.lessons) || undefined, pages: Number(form.pages) || undefined, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        setItems(i => i.map(x => x.id === editing.id ? { ...x, ...payload } : x));
        toast.success('Product updated.');
      } else {
        const fresh = { ...payload, id: String(Date.now()), students: 0, rating: 0, reviewCount: 0, slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), color: '#1a6bc8', lastUpdated: new Date().toISOString().split('T')[0] };
        await createProduct(fresh);
        setItems(i => [...i, fresh]);
        toast.success('Product created.');
      }
      setModal(false);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDelLoad(true);
    try {
      await deleteProduct(delId);
      setItems(i => i.filter(x => x.id !== delId));
      setDelId(null);
      toast.success('Product deleted.');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDelLoad(false);
    }
  }

  const shown = typeFilter === 'all' ? items : items.filter(p => p.type === typeFilter);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div><h2 style={{ fontSize: 26, marginBottom: 4 }}>Products</h2><p style={{ color: 'var(--text3)', fontSize: 14 }}>{items.length} total items</p></div>
        <Button variant="primary" onClick={openAdd}>+ Add Product</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All'], ['course', 'Courses'], ['ebook', 'eBooks']].map(([v, l]) => (
          <button key={v} onClick={() => setTypeFilter(v)} style={{ padding: '7px 16px', borderRadius: 99, border: `1px solid ${typeFilter === v ? 'var(--accent)' : 'var(--border)'}`, background: typeFilter === v ? 'var(--accent-bg)' : 'var(--bg2)', color: typeFilter === v ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: typeFilter === v ? 600 : 400, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {loading ? <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <Table cols={[
            { label: 'Product', render: p => <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 26 }}>{p.emoji}</span><div><p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.title}</p><p style={{ fontSize: 12, color: 'var(--text3)' }}>by {p.author}</p></div></div> },
            { label: 'Type', render: p => <Badge variant={p.type === 'ebook' ? 'info' : 'accent'} size="xs">{p.type}</Badge> },
            { label: 'Category', key: 'category' },
            { label: 'Price', render: p => <><span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt$(p.price)}</span><span style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'line-through', marginLeft: 6 }}>{fmt$(p.originalPrice)}</span></> },
            { label: 'Students', render: p => fmtN(p.students) },
            { label: 'Rating', render: p => `⭐ ${p.rating}` },
            { label: 'Actions', render: p => <div style={{ display: 'flex', gap: 6 }}><button onClick={() => openEdit(p)} style={{ background: 'var(--info-bg)', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>✏️</button><button onClick={() => setDelId(p.id)} style={{ background: 'var(--danger-bg)', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>🗑</button></div> },
          ]} rows={shown} />
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'} width={600}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create Product'}</Button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Title" value={form.title} onChange={sf('title')} placeholder="Course title" required style={{ gridColumn: '1/-1' }} />
          <Input label="Author" value={form.author} onChange={sf('author')} placeholder="Author name" required />
          <Select label="Type" value={form.type} onChange={sf('type')} options={[{ value: 'course', label: 'Course' }, { value: 'ebook', label: 'eBook' }]} />
          <Input label="Price ($)" value={form.price} onChange={sf('price')} placeholder="79" required />
          <Input label="Original Price ($)" value={form.originalPrice} onChange={sf('originalPrice')} placeholder="149" />
          <Select label="Category" value={form.category} onChange={sf('category')} options={CATEGORIES.filter(c => c !== 'All')} />
          <Input label="Emoji icon" value={form.emoji} onChange={sf('emoji')} placeholder="💻" />
          {form.type === 'course' && <>
            <Select label="Level" value={form.level} onChange={sf('level')} options={['Beginner', 'Intermediate', 'Advanced', 'Beginner to Advanced']} />
            <Input label="Duration" value={form.duration} onChange={sf('duration')} placeholder="24 hours" />
            <Input label="Lessons" value={form.lessons} onChange={sf('lessons')} placeholder="180" />
          </>}
          {form.type === 'ebook' && <>
            <Input label="Pages" value={form.pages} onChange={sf('pages')} placeholder="200" />
            <Input label="Formats" value={form.format} onChange={sf('format')} placeholder="PDF + ePub" />
          </>}
          <Input label="Tags (comma-separated)" value={form.tags} onChange={sf('tags')} placeholder="React, JavaScript" style={{ gridColumn: '1/-1' }} />
          <Textarea label="Description" value={form.description} onChange={sf('description')} placeholder="Short description…" rows={3} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '6px 0' }}>
            {[['bestseller', '⭐ Mark as Bestseller'], ['featured', '📌 Mark as Featured']].map(([k, l]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={!!form[k]} onChange={e => sf(k)(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />{l}
              </label>
            ))}
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete} danger loading={delLoading} title="Delete product?" message="This will permanently delete this product and cannot be undone." />
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    Promise.all([getOrders(), getOrderStats()])
      .then(([d, s]) => { setOrders(d.orders); setStats(s); })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);
  const shown = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ fontSize: 26, marginBottom: 20 }}>Orders</h2>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Revenue" value={fmt$(stats.revenue)} icon="💰" trend="up" />
          <StatCard label="Completed" value={stats.completed} icon="✅" color="var(--success)" />
          <StatCard label="Pending" value={stats.pending} icon="⏳" color="var(--gold)" />
          <StatCard label="Refunded" value={stats.refunded} icon="↩️" color="var(--danger)" />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all','All'],['completed','Completed'],['pending','Pending'],['refunded','Refunded']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: '7px 16px', borderRadius: 99, border: `1px solid ${filter === v ? 'var(--accent)' : 'var(--border)'}`, background: filter === v ? 'var(--accent-bg)' : 'var(--bg2)', color: filter === v ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: filter === v ? 600 : 400, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {loading ? <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <Table cols={[
            { label: 'Order ID', render: o => <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 13 }}>{o.id}</span> },
            { label: 'Customer', render: o => <div><p style={{ fontSize: 13, fontWeight: 500 }}>{o.user}</p><p style={{ fontSize: 12, color: 'var(--text3)' }}>{o.email}</p></div> },
            { label: 'Item', render: o => <span style={{ fontSize: 13 }}>{o.item.slice(0, 28)}{o.item.length > 28 ? '…' : ''}</span> },
            { label: 'Amount', render: o => <span style={{ fontWeight: 700, fontSize: 14 }}>{fmt$(o.amount)}</span> },
            { label: 'Status', render: o => <Badge variant={o.status === 'completed' ? 'success' : o.status === 'pending' ? 'gold' : 'danger'} size="xs">{o.status}</Badge> },
            { label: 'Date', key: 'date' },
          ]} rows={shown} />
        </div>
      )}
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', password: '' });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState(null);
  const sf = k => v => setForm(f => ({ ...f, [k]: v }));
  useEffect(() => {
    getUsers()
      .then(d => setUsers(d.users))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd() {
    setSaving(true);
    try {
      const u = { ...form, id: String(Date.now()), joined: new Date().toISOString().split('T')[0], status: 'active', avatar: null, enrolledCourses: [] };
      await createUser(u);
      setUsers(prev => [...prev, u]);
      setModal(false); setForm({ name: '', email: '', role: 'student', password: '' });
      toast.success('User created.');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function toggleStatus(u) {
    const ns = u.status === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatus(u.id, ns);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: ns } : x));
      toast.success(`User ${ns}.`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    try {
      await deleteUser(delId);
      setUsers(prev => prev.filter(x => x.id !== delId));
      setDelId(null);
      toast.success('User deleted.');
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div><h2 style={{ fontSize: 26, marginBottom: 4 }}>Users</h2><p style={{ color: 'var(--text3)', fontSize: 14 }}>{users.length} registered users</p></div>
        <Button variant="primary" onClick={() => setModal(true)}>+ Add User</Button>
      </div>
      {loading ? <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <Table cols={[
            { label: 'Name', render: u => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{inits(u.name)}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span></div> },
            { label: 'Email', render: u => <span style={{ fontSize: 13, color: 'var(--text2)' }}>{u.email}</span> },
            { label: 'Role', render: u => <Badge variant={u.role === 'admin' ? 'gold' : 'info'} size="xs">{u.role}</Badge> },
            { label: 'Joined', key: 'joined' },
            { label: 'Status', render: u => <Badge variant={u.status === 'active' ? 'success' : 'danger'} size="xs" dot>{u.status}</Badge> },
            { label: 'Actions', render: u => <div style={{ display: 'flex', gap: 6 }}><button onClick={() => toggleStatus(u)} style={{ padding: '5px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{u.status === 'active' ? 'Suspend' : 'Activate'}</button><button onClick={() => setDelId(u.id)} style={{ background: 'var(--danger-bg)', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>🗑</button></div> },
          ]} rows={users} />
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add User" width={440}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" onClick={handleAdd} loading={saving}>Create User</Button></>}>
        <Input label="Full name" value={form.name} onChange={sf('name')} placeholder="Jane Smith" required />
        <Input label="Email" type="email" value={form.email} onChange={sf('email')} placeholder="jane@example.com" required />
        <Input label="Temporary password" type="password" value={form.password} onChange={sf('password')} placeholder="temp123" required />
        <Select label="Role" value={form.role} onChange={sf('role')} options={[{ value: 'student', label: 'Student' }, { value: 'admin', label: 'Admin' }]} />
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete} danger title="Delete user?" message="This will permanently delete this user account and cannot be undone." />
    </div>
  );
}

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percent', maxUses: '', expires: '' });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState(null);
  const sf = k => v => setForm(f => ({ ...f, [k]: v }));
  useEffect(() => {
    getCoupons()
      .then(c => setCoupons(c))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setSaving(true);
    try {
      const fresh = { ...form, id: String(Date.now()), discount: Number(form.discount), maxUses: Number(form.maxUses), uses: 0, active: true, createdAt: new Date().toISOString().split('T')[0] };
      await createCoupon(fresh);
      setCoupons(prev => [...prev, fresh]);
      setModal(false); setForm({ code: '', discount: '', type: 'percent', maxUses: '', expires: '' });
      toast.success('Coupon created.');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function toggle(c) {
    try {
      await updateCoupon(c.id, { ...c, active: !c.active });
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
      toast.success(`Coupon ${c.active ? 'deactivated' : 'activated'}.`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    try {
      await deleteCoupon(delId);
      setCoupons(prev => prev.filter(x => x.id !== delId));
      setDelId(null);
      toast.success('Coupon deleted.');
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 26, marginBottom: 4 }}>Coupons</h2><p style={{ color: 'var(--text3)', fontSize: 14 }}>{coupons.length} discount codes</p></div>
        <Button variant="primary" onClick={() => setModal(true)}>+ New Coupon</Button>
      </div>
      {loading ? <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 18 }}>
          {coupons.map(c => (
            <div key={c.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 20px', opacity: c.active ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ background: 'var(--bg3)', border: '2px dashed var(--border2)', borderRadius: 9, padding: '8px 16px' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Fraunces,serif', letterSpacing: '1px', color: 'var(--accent)' }}>{c.code}</p>
                </div>
                <Badge variant={c.active ? 'success' : 'danger'} size="xs" dot>{c.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{c.discount}{c.type === 'percent' ? '% off' : '$ off'}</p>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text3)' }}>Usage</span><span style={{ fontWeight: 500 }}>{c.uses} / {c.maxUses}</span>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 6 }}>
                  <div style={{ width: `${Number.isFinite(Number(c.maxUses)) ? Math.min((c.uses / Number(c.maxUses)) * 100, 100) : 0}%`, height: 6, borderRadius: 99, background: 'var(--accent)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginTop: 5 }}>
                  <span>Created {c.createdAt}</span><span>Expires {c.expires}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggle(c)} style={{ flex: 1, padding: '8px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2)' }}>{c.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => setDelId(c.id)} style={{ background: 'var(--danger-bg)', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Coupon" width={440}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" onClick={handleCreate} loading={saving}>Create</Button></>}>
        <Input label="Coupon Code" value={form.code} onChange={v => sf('code')(v.toUpperCase())} placeholder="SAVE20" required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Discount" value={form.discount} onChange={sf('discount')} placeholder="20" required />
          <Select label="Type" value={form.type} onChange={sf('type')} options={[{ value: 'percent', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed ($)' }]} />
          <Input label="Max Uses" value={form.maxUses} onChange={sf('maxUses')} placeholder="100" />
          <Input label="Expires" type="date" value={form.expires} onChange={sf('expires')} />
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete} danger title="Delete coupon?" message="This coupon code will be permanently removed and can no longer be used." />
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('eduvault_theme', next ? 'dark' : 'light');
  }

  const panels = { overview: <Overview />, products: <Products />, orders: <Orders />, users: <Users />, coupons: <Coupons /> };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active={tab} setActive={setTab} user={user} dark={dark} toggleDark={toggleDark} />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>{panels[tab]}</main>
    </div>
  );
}
