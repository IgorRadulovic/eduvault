// src/api/client.js
// All HTTP calls go through here.
// Change VITE_API_BASE_URL in .env.local to point at your backend.

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

function token() { return localStorage.getItem('eduvault_token'); }

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  const t = token();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message); this.name = 'ApiError'; this.status = status; this.data = data;
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, 'Network error — check your connection.', null);
  }

  if (res.status === 401) {
    localStorage.removeItem('eduvault_token');
    localStorage.removeItem('eduvault_user');
    window.dispatchEvent(new Event('eduvault:unauthorized'));
    throw new ApiError(401, 'Session expired. Please sign in again.', null);
  }

  const ct = res.headers.get('content-type') ?? '';
  const data = ct.includes('application/json') ? await res.json() : { message: await res.text() };
  if (!res.ok) throw new ApiError(res.status, data?.message ?? 'Something went wrong.', data);
  return data;
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};
