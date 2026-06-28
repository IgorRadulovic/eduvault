// src/api/services.js
// Auth   → Firebase
// Data   → Supabase
//
// Public pages gracefully fall back to bundled demo data when Supabase is not
// configured yet or the hosted database rejects a public read.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { supabase } from '../lib/supabase';

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY')
);

// ─── Auth helpers ────────────────────────────────
const USER_KEY = 'eduvault_user';

function toAppUser(firebaseUser, extras = {}) {
  return {
    id:              firebaseUser.uid,
    name:            firebaseUser.displayName ?? firebaseUser.email.split('@')[0],
    email:           firebaseUser.email,
    avatar:          firebaseUser.photoURL ?? null,
    role:            extras.role    ?? 'student',
    status:          extras.status  ?? 'active',
    joined:          firebaseUser.metadata.creationTime,
    enrolledCourses: extras.enrolledCourses ?? [],
  };
}
function persistUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
function clearUser()    { localStorage.removeItem(USER_KEY); }
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

async function getMockProductsResult({ type, category, search, page = 1, limit = 12 } = {}) {
  const { MOCK_PRODUCTS } = await import('./mockData');
  let r = [...MOCK_PRODUCTS];
  if (type && type !== 'all')         r = r.filter(p => p.type === type);
  if (category && category !== 'All') r = r.filter(p => p.category === category);
  if (search) {
    const q = search.toLowerCase();
    r = r.filter(p => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
  }
  return {
    products: r.slice((page - 1) * limit, page * limit),
    total: r.length,
    page,
    totalPages: Math.ceil(r.length / limit),
  };
}

async function getUserProfile(firebaseUser) {
  if (!hasSupabaseConfig) return {};
  const { data, error } = await supabase
    .from('users')
    .select('role, status, avatar_url')
    .eq('id', firebaseUser.uid)
    .maybeSingle();
  if (error) {
    console.warn('[Supabase] Could not load user profile:', error.message);
    return {};
  }
  return data ?? {};
}

async function syncUserProfile(firebaseUser, extras = {}) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('users').upsert({
    id:         firebaseUser.uid,
    email:      firebaseUser.email,
    name:       extras.name ?? firebaseUser.displayName ?? firebaseUser.email.split('@')[0],
    avatar_url: firebaseUser.photoURL ?? null,
    role:       extras.role ?? 'student',
    status:     'active',
  }, { onConflict: 'id' });

  if (error) {
    console.warn('[Supabase] User profile sync skipped:', error.message);
  }
}

function friendlyAuthError(code) {
  const map = {
    'auth/user-not-found':           'No account found with this email address.',
    'auth/wrong-password':           'Incorrect password. Please try again.',
    'auth/invalid-credential':       'Invalid email or password.',
    'auth/email-already-in-use':     'An account with this email already exists.',
    'auth/weak-password':            'Password must be at least 6 characters.',
    'auth/invalid-email':            'Please enter a valid email address.',
    'auth/too-many-requests':        'Too many failed attempts. Please try again later.',
    'auth/network-request-failed':   'Network error. Check your connection and try again.',
    'auth/popup-blocked':            'Popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request':  'Sign-in cancelled.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

// ══════════════════════════════════════════════════
// AUTH — Firebase (already live)
// ══════════════════════════════════════════════════

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, async firebaseUser => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser);
      const user = toAppUser(firebaseUser, profile);
      persistUser(user);
      callback(user);
    } else {
      clearUser();
      callback(null);
    }
  });
}

export async function authLogin({ email, password }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(user);
    const appUser = toAppUser(user, profile);
    persistUser(appUser);
    return appUser;
  } catch (err) { throw new Error(friendlyAuthError(err.code)); }
}

export async function authSignup({ name, email, password }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    const appUser = { ...toAppUser(user), name };
    persistUser(appUser);

    await syncUserProfile(user, { name });

    return appUser;
  } catch (err) { throw new Error(friendlyAuthError(err.code)); }
}

export async function authLoginWithGoogle() {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(user);
    const profile = await getUserProfile(user);
    const appUser = toAppUser(user, profile);
    persistUser(appUser);

    return appUser;
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return null;
    throw new Error(friendlyAuthError(err.code));
  }
}

export async function authLogout() {
  await signOut(auth);
  clearUser();
}

export async function authForgotPassword({ email }) {
  try {
    await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` });
    return { message: 'Password reset email sent.' };
  } catch (err) { throw new Error(friendlyAuthError(err.code)); }
}

// ══════════════════════════════════════════════════
// PRODUCTS — switch MOCK → REAL by swapping the blocks
// ══════════════════════════════════════════════════

export async function getProducts({ type, category, search, page = 1, limit = 12 } = {}) {
  if (!hasSupabaseConfig) return getMockProductsResult({ type, category, search, page, limit });

  // ── REAL (Supabase) ──────────────────────────────────────────────
  let query = supabase
    .from('products_with_category')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('student_count', { ascending: false });

  if (type && type !== 'all')         query = query.eq('type', type);
  if (category && category !== 'All') query = query.eq('category_name', category);
  if (search)                         query = query.ilike('title', `%${search}%`);

  const from = (page - 1) * limit;
  const to   = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.warn('[Supabase] Product read failed, using demo data:', error.message);
    return getMockProductsResult({ type, category, search, page, limit });
  }

  return {
    products:   (data ?? []).map(normalizeProduct),
    total:      count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };

  // ── MOCK (delete this when Supabase is connected) ─────────────────
  // const { MOCK_PRODUCTS } = await import('./mockData');
  // let r = [...MOCK_PRODUCTS];
  // if (type && type !== 'all')          r = r.filter(p => p.type === type);
  // if (category && category !== 'All') r = r.filter(p => p.category === category);
  // if (search) { const q = search.toLowerCase(); r = r.filter(p => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)); }
  // return { products: r.slice((page-1)*limit, page*limit), total: r.length, page, totalPages: Math.ceil(r.length/limit) };
}

export async function getProductBySlug(slug) {
  if (!hasSupabaseConfig) {
    const { MOCK_PRODUCTS } = await import('./mockData');
    const p = MOCK_PRODUCTS.find(p => p.slug === slug);
    if (!p) throw new Error('Product not found.');
    return p;
  }

  // ── REAL ──────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('products_with_category')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    const { MOCK_PRODUCTS } = await import('./mockData');
    const p = MOCK_PRODUCTS.find(p => p.slug === slug);
    if (p) return p;
    throw new Error('Product not found.');
  }
  return normalizeProduct(data);

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_PRODUCTS } = await import('./mockData');
  // const p = MOCK_PRODUCTS.find(p => p.slug === slug);
  // if (!p) throw new Error('Product not found.');
  // return p;
}

export async function getFeatured() {
  if (!hasSupabaseConfig) {
    const { MOCK_PRODUCTS } = await import('./mockData');
    return MOCK_PRODUCTS.filter(p => p.featured);
  }

  // ── REAL ──────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('products_with_category')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('student_count', { ascending: false })
    .limit(8);

  if (error) {
    console.warn('[Supabase] Featured products failed, using demo data:', error.message);
    const { MOCK_PRODUCTS } = await import('./mockData');
    return MOCK_PRODUCTS.filter(p => p.featured);
  }
  return (data ?? []).map(normalizeProduct);

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_PRODUCTS } = await import('./mockData');
  // return MOCK_PRODUCTS.filter(p => p.featured);
}

// Admin — create/update/delete products
export async function createProduct(data) {
  const row = denormalizeProduct(data);
  const { data: d, error } = await supabase.from('products').insert(row).select().single();
  if (error) throw new Error(error.message);
  return normalizeProduct(d);
}

export async function updateProduct(id, data) {
  const row = denormalizeProduct(data);
  const { data: d, error } = await supabase.from('products').update(row).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeProduct(d);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ── Field name mapping: Supabase (snake_case) ↔ App (camelCase) ──
function normalizeProduct(p) {
  return {
    id:              p.id,
    type:            p.type,
    title:           p.title,
    slug:            p.slug,
    description:     p.description,
    longDescription: p.long_description,
    author:          p.author,
    price:           Number(p.price),
    originalPrice:   Number(p.original_price ?? p.price),
    category:        p.category_name ?? p.category ?? '',
    image:           p.image_url ?? '',
    color:           p.color ?? '#1565C0',
    emoji:           p.emoji ?? '📚',
    rating:          Number(p.rating ?? 0),
    reviewCount:     p.review_count  ?? 0,
    students:        p.student_count ?? 0,
    bestseller:      p.is_bestseller ?? false,
    featured:        p.is_featured   ?? false,
    tags:            p.tags ?? [],
    lastUpdated:     p.last_updated_label ?? p.updated_at?.split('T')[0] ?? '',
    // Course fields
    level:           p.level,
    duration:        p.duration_hours ? `${p.duration_hours} hours` : undefined,
    lessons:         p.lesson_count,
    // eBook fields
    pages:           p.page_count,
    format:          p.file_format,
  };
}

function denormalizeProduct(p) {
  return {
    type:               p.type,
    title:              p.title,
    slug:               p.slug ?? p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description:        p.description,
    long_description:   p.longDescription,
    author:             p.author,
    price:              p.price,
    original_price:     p.originalPrice,
    image_url:          p.image,
    color:              p.color,
    emoji:              p.emoji,
    is_bestseller:      p.bestseller ?? false,
    is_featured:        p.featured   ?? false,
    is_published:       p.isPublished ?? true,
    tags:               p.tags ?? [],
    last_updated_label: p.lastUpdated,
    // Course
    level:              p.level,
    duration_hours:     p.duration ? parseFloat(p.duration) : null,
    lesson_count:       p.lessons  ? parseInt(p.lessons)    : null,
    // eBook
    page_count:         p.pages    ? parseInt(p.pages)      : null,
    file_format:        p.format,
  };
}

// ══════════════════════════════════════════════════
// ORDERS — Supabase
// ══════════════════════════════════════════════════

export async function getOrders({ status } = {}) {
  if (!hasSupabaseConfig) {
    const { MOCK_ORDERS } = await import('./mockData');
    const orders = status ? MOCK_ORDERS.filter(o => o.status === status) : MOCK_ORDERS;
    return { orders, total: orders.length };
  }

  // ── REAL ──────────────────────────────────────────────────────────
  let query = supabase
    .from('orders')
    .select(`*, users(name, email), order_items(*, products(title, type))`)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, count, error } = await query;
  if (error) {
    console.warn('[Supabase] Orders read failed, using demo data:', error.message);
    const { MOCK_ORDERS } = await import('./mockData');
    const orders = status ? MOCK_ORDERS.filter(o => o.status === status) : MOCK_ORDERS;
    return { orders, total: orders.length };
  }

  const orders = (data ?? []).map(o => ({
    id:     o.order_number,
    userId: o.user_id,
    user:   o.users?.name ?? o.user_id ?? 'Customer',
    email:  o.users?.email ?? '',
    amount: Number(o.total),
    status: o.status,
    date:   o.created_at?.split('T')[0],
    item:   o.order_items?.[0]?.products?.title ?? '—',
    type:   o.order_items?.[0]?.products?.type  ?? '—',
  }));

  return { orders, total: orders.length };

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_ORDERS } = await import('./mockData');
  // let r = [...MOCK_ORDERS];
  // if (status) r = r.filter(o => o.status === status);
  // return { orders: r, total: r.length };
}

export async function getOrderStats() {
  if (!hasSupabaseConfig) {
    const { MOCK_ORDERS } = await import('./mockData');
    const completed = MOCK_ORDERS.filter(o => o.status === 'completed');
    return {
      revenue: completed.reduce((sum, o) => sum + o.amount, 0),
      total: MOCK_ORDERS.length,
      completed: completed.length,
      pending: MOCK_ORDERS.filter(o => o.status === 'pending').length,
      refunded: MOCK_ORDERS.filter(o => o.status === 'refunded').length,
    };
  }

  // ── REAL ──────────────────────────────────────────────────────────
  const { data, error } = await supabase.from('revenue_stats').select('*').single();
  if (error) {
    console.warn('[Supabase] Revenue stats failed, using demo data:', error.message);
    const { MOCK_ORDERS } = await import('./mockData');
    const completed = MOCK_ORDERS.filter(o => o.status === 'completed');
    return {
      revenue: completed.reduce((sum, o) => sum + o.amount, 0),
      total: MOCK_ORDERS.length,
      completed: completed.length,
      pending: MOCK_ORDERS.filter(o => o.status === 'pending').length,
      refunded: MOCK_ORDERS.filter(o => o.status === 'refunded').length,
    };
  }
  return {
    revenue:   Number(data.total_revenue),
    total:     Number(data.completed_orders) + Number(data.pending_orders) + Number(data.refunded_orders),
    completed: Number(data.completed_orders),
    pending:   Number(data.pending_orders),
    refunded:  Number(data.refunded_orders),
  };

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_ORDERS } = await import('./mockData');
  // const done = MOCK_ORDERS.filter(o => o.status === 'completed');
  // return { revenue: done.reduce((a,b)=>a+b.amount,0), total: MOCK_ORDERS.length, completed: done.length, pending: MOCK_ORDERS.filter(o=>o.status==='pending').length, refunded: MOCK_ORDERS.filter(o=>o.status==='refunded').length };
}

// ══════════════════════════════════════════════════
// USERS (admin) — Supabase
// ══════════════════════════════════════════════════

export async function getUsers() {
  if (!hasSupabaseConfig) {
    const { MOCK_USERS } = await import('./mockData');
    return { users: MOCK_USERS.map(({ password, ...u }) => u), total: MOCK_USERS.length };
  }

  // ── REAL ──────────────────────────────────────────────────────────
  const { data, count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] Users read failed, using demo data:', error.message);
    const { MOCK_USERS } = await import('./mockData');
    return { users: MOCK_USERS.map(({ password, ...u }) => u), total: MOCK_USERS.length };
  }
  return {
    users: (data ?? []).map(u => ({
      ...u,
      joined: u.created_at?.split('T')[0] ?? u.joined ?? '',
      avatar: u.avatar_url ?? u.avatar ?? null,
    })),
    total: count ?? 0,
  };

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_USERS } = await import('./mockData');
  // return { users: MOCK_USERS.map(({password:_,...u})=>u), total: MOCK_USERS.length };
}

export async function createUser(data) {
  const { data: d, error } = await supabase.from('users').insert({
    id:     data.id ?? crypto.randomUUID(),
    email:  data.email,
    name:   data.name,
    role:   data.role ?? 'student',
    status: 'active',
  }).select().single();
  if (error) throw new Error(error.message);
  return d;
}

export async function updateUserStatus(id, status) {
  const { error } = await supabase.from('users').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  return { id, status };
}

export async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ══════════════════════════════════════════════════
// COUPONS — Supabase
// ══════════════════════════════════════════════════

export async function getCoupons() {
  if (!hasSupabaseConfig) {
    const { MOCK_COUPONS } = await import('./mockData');
    return [...MOCK_COUPONS];
  }

  // ── REAL ──────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] Coupons read failed, using demo data:', error.message);
    const { MOCK_COUPONS } = await import('./mockData');
    return [...MOCK_COUPONS];
  }
  return (data ?? []).map(normalizeCoupon);

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_COUPONS } = await import('./mockData');
  // return [...MOCK_COUPONS];
}

export async function validateCoupon(code) {
  if (!hasSupabaseConfig) {
    const { MOCK_COUPONS } = await import('./mockData');
    const c = MOCK_COUPONS.find(c => c.code === code.toUpperCase() && c.active);
    if (!c) throw new Error('Invalid or expired coupon code.');
    return c;
  }

  // ── REAL ──────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) throw new Error('Invalid or expired coupon code.');

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date())
    throw new Error('This coupon has expired.');

  // Check max uses
  if (data.max_uses && data.uses >= data.max_uses)
    throw new Error('This coupon has reached its usage limit.');

  return normalizeCoupon(data);

  // ── MOCK ──────────────────────────────────────────────────────────
  // const { MOCK_COUPONS } = await import('./mockData');
  // const c = MOCK_COUPONS.find(c => c.code === code.toUpperCase() && c.active);
  // if (!c) throw new Error('Invalid or expired coupon code.');
  // return c;
}

export async function createCoupon(data) {
  const { data: d, error } = await supabase.from('coupons').insert({
    code:           data.code.toUpperCase(),
    discount_type:  data.type,
    discount_value: Number(data.discount),
    max_uses:       data.maxUses ? Number(data.maxUses) : null,
    expires_at:     data.expires ? new Date(data.expires).toISOString() : null,
    is_active:      true,
  }).select().single();
  if (error) throw new Error(error.message);
  return normalizeCoupon(d);
}

export async function updateCoupon(id, data) {
  const { data: d, error } = await supabase.from('coupons').update({
    is_active: data.active ?? data.is_active,
  }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeCoupon(d);
}

export async function deleteCoupon(id) {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

function normalizeCoupon(c) {
  return {
    id:         c.id,
    code:       c.code,
    discount:   Number(c.discount_value),
    type:       c.discount_type,
    uses:       c.uses,
    maxUses:    c.max_uses ?? '∞',
    expires:    c.expires_at ? c.expires_at.split('T')[0] : 'Never',
    active:     c.is_active,
    createdAt:  c.created_at?.split('T')[0],
  };
}

// ══════════════════════════════════════════════════
// ENROLLMENTS
// ══════════════════════════════════════════════════

export async function getUserEnrollments(userId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`*, products(*)`)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function enrollUser(userId, productId, orderId) {
  const { error } = await supabase.from('enrollments').upsert({
    user_id:    userId,
    product_id: productId,
    order_id:   orderId,
    progress:   0,
  }, { onConflict: 'user_id,product_id' });
  if (error) throw new Error(error.message);
}

export async function updateProgress(userId, productId, progress) {
  const { error } = await supabase.from('enrollments').update({
    progress,
    completed_at: progress === 100 ? new Date().toISOString() : null,
  }).eq('user_id', userId).eq('product_id', productId);
  if (error) throw new Error(error.message);
}
