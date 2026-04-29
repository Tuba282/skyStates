'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { deleteCookie } from 'cookies-next';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data);
        localStorage.setItem('skyestate_user', JSON.stringify(data));
      } catch (error) {
        setUser(null);
        localStorage.removeItem('skyestate_user');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('skyestate_user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      if (error.response?.status === 403) {
        return { success: false, message: 'Your account is blocked.' };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/api/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('skyestate_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const isUser = user?.role === 'USER';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin, isAgent, isUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
