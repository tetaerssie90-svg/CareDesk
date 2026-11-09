import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('care_user') || 'null'));
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('care_token', data.data.token);
    localStorage.setItem('care_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  };
  const logout = () => {
    localStorage.removeItem('care_token'); localStorage.removeItem('care_user'); setUser(null);
  };
  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
