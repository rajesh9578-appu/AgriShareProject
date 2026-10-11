import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agri_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('agri_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('agri_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        if (res.data.isUnverified) {
          addToast(res.data.message, 'warning');
          return { isUnverified: true, email: res.data.email };
        }

        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('agri_token', token);
        localStorage.setItem('agri_user', JSON.stringify(user));
        addToast(`Welcome back, ${user.name}!`, 'success');
        await fetchCurrentUser();
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        return { success: true, email: res.data.email };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('agri_token', token);
        localStorage.setItem('agri_user', JSON.stringify(user));
        addToast('Account verified successfully! Welcome to AgriShare.', 'success');
        await fetchCurrentUser();
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const resendOTP = async (email, purpose = 'registration') => {
    try {
      const res = await api.post('/auth/resend-otp', { email, purpose });
      if (res.data.success) {
        addToast(res.data.message, 'info');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfile(null);
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    addToast('You have been logged out.', 'info');
  };

  const toggleOwnerMode = async () => {
    try {
      const res = await api.put('/auth/toggle-owner-mode');
      if (res.data.success) {
        setUser((prev) => ({ ...prev, isOwnerActive: res.data.isOwnerActive }));
        const updatedUser = { ...user, isOwnerActive: res.data.isOwnerActive };
        localStorage.setItem('agri_user', JSON.stringify(updatedUser));
        addToast(res.data.message, 'success');
        return res.data.isOwnerActive;
      }
    } catch (err) {
      addToast('Failed to switch role mode.', 'error');
    }
  };

  const updateProfileData = async (data) => {
    try {
      const res = await api.put('/farmers/profile', data);
      if (res.data.success) {
        setProfile(res.data.profile);
        addToast('Profile updated successfully!', 'success');
        await fetchCurrentUser();
        return res.data.profile;
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        toggleOwnerMode,
        updateProfileData,
        refreshProfile: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
