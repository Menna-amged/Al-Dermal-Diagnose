// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services';
import api from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('dashboard_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem('dashboard_token'))
        .finally(() => setRestoring(false));
    } else {
      setRestoring(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const u = await AuthService.login(email, password);
      setUser(u);
      return true;
    } catch (e) {
      setError(e.response?.data?.error || e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (restoring) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
