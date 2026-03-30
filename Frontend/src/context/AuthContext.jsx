import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

/**
 * AuthContext provides authentication state and actions across the app.
 * Exposes: user, token, loading, login, register, logout, loginWithGoogle, checkAuth.
 */
export const AuthContext = createContext(null);

/**
 * AuthProvider wraps the component tree and manages all auth state.
 * On mount it attempts to restore the session from a stored JWT.
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /**
   * Verifies the stored JWT by calling GET /api/auth/me.
   * If valid, restores the user state; otherwise clears the session.
   */
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      const { data } = await axiosClient.get('/api/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore session on initial mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Authenticates a user with email and password.
   * Stores the returned JWT and sets user state.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} The authenticated user object.
   * @throws Will throw on invalid credentials or network errors.
   */
  const login = useCallback(async (email, password) => {
    const { data } = await axiosClient.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  /**
   * Registers a new user and auto-logs them in.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} The newly created user object.
   * @throws Will throw on validation failure or duplicate emails.
   */
  const register = useCallback(async (name, email, password) => {
    const { data } = await axiosClient.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  /**
   * Clears the JWT from storage and resets auth state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Redirects the browser to the backend Google OAuth endpoint.
   * The backend will redirect to Google's consent screen.
   */
  const loginWithGoogle = useCallback(() => {
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiURL}/api/auth/google`;
  }, []);

  /** Memoised context value to prevent unnecessary re-renders. */
  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, loginWithGoogle, checkAuth }),
    [user, token, loading, login, register, logout, loginWithGoogle, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
