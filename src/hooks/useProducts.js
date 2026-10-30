import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function useProducts(params, enabled = true) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ status: 'loading', items: [], meta: null, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: null }));
    api
      .getProducts(JSON.parse(key), { signal: ctrl.signal })
      .then((d) => setState({ status: 'ready', items: d.items, meta: d.meta, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ status: 'error', items: [], meta: null, error: err });
      });
    return () => ctrl.abort();
  }, [key, enabled, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
