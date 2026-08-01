import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/auth/me').then(({ user: current }) => setUser(current)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    setUser(data.user);
  }, []);
  const register = useCallback(async (credentials) => {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
    setUser(data.user);
  }, []);
  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
