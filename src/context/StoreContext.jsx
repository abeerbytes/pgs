import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { DEFAULT_SETTINGS } from '../config/store.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState({
    settings: DEFAULT_SETTINGS,
    categories: [],
    brands: [],
    status: 'loading',
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const [settings, categories, brands] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getBrands().catch(() => []),
      ]);
      setState({
        settings: {
          ...DEFAULT_SETTINGS,
          ...settings,
          whatsappNumber: settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
        },
        categories: categories || [],
        brands: brands || [],
        status: 'ready',
        error: null,
      });
    } catch (error) {
      setState((s) => ({ ...s, status: 'error', error }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => ({ ...state, reload: load }), [state, load]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
