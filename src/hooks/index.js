// src/hooks/index.js
import { useState, useEffect, useCallback, useRef } from 'react';

// ── useAsync ──────────────────────────────────
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const execute = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn(...args);
      if (mounted.current) setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      if (mounted.current) setState({ data: null, loading: false, error: err.message });
      throw err;
    }
  }, deps); // eslint-disable-line

  useEffect(() => { if (immediate) execute(); }, [execute]); // eslint-disable-line
  return { ...state, execute };
}

// ── useForm ───────────────────────────────────
export function useForm(init, validators = {}) {
  const [values, setValues]   = useState(init);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const set = (field) => (val) => {
    setValues((v) => ({ ...v, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    for (const [k, fn] of Object.entries(validators)) {
      const e = fn(values[k], values);
      if (e) errs[k] = e;
    }
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(validators).map((k) => [k, true])));
    return Object.keys(errs).length === 0;
  };

  const reset = () => { setValues(init); setErrors({}); setTouched({}); };

  return { values, errors, touched, set, validate, reset, setValues };
}

// ── validators ────────────────────────────────
export const required  = (msg = 'Required.')            => (v) => !v || !String(v).trim() ? msg : '';
export const minLen    = (n, msg)                       => (v) => v && v.length < n ? (msg ?? `Min ${n} characters.`) : '';
export const isEmail   = (msg = 'Invalid email.')       => (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : '';
export const matches   = (field, msg = 'No match.')     => (v, all) => v !== all[field] ? msg : '';
export const composeV  = (...fns)                       => (v, all) => { for (const fn of fns) { const e = fn(v, all); if (e) return e; } return ''; };
