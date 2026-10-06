import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_ADMIN_PASSCODE } from '../lib/constants';

const AuthContext = createContext(null);

const SESSION_STORAGE_KEY = 'onezone_admin_auth_v1';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // 1. Check Supabase Auth session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const user = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin',
              role: 'Supabase Admin',
              authType: 'supabase'
            };
            setIsAdmin(true);
            setAdminUser(user);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth session check exception:', e);
        }
      }

      // 2. Check local session storage fallback
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.authenticated) {
            setIsAdmin(true);
            setAdminUser(parsed.user || { name: 'Gate Staff', role: 'Staff Operator', authType: 'passcode' });
          }
        } catch (e) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      setLoading(false);
    }

    initAuth();

    // Listen to Supabase auth state changes if active
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAdmin(true);
          setAdminUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin',
            role: 'Supabase Admin',
            authType: 'supabase'
          });
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      if (authListener?.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const loginWithPasscode = async (passcode, staffName = 'Gate Staff') => {
    const validPass = import.meta.env.VITE_ADMIN_PASSCODE || DEFAULT_ADMIN_PASSCODE;
    if (passcode && passcode === validPass) {
      const user = {
        name: staffName || 'Gate Operator',
        role: 'Staff Operator',
        authType: 'passcode',
        loginTime: new Date().toISOString()
      };
      setIsAdmin(true);
      setAdminUser(user);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ authenticated: true, user }));
      return { success: true };
    }
    return { success: false, error: 'Invalid admin passcode. Please verify credentials.' };
  };

  const loginWithSupabase = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: (email || '').trim().toLowerCase(),
          password
        });
        if (!error && data?.user) {
          const user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Admin',
            role: 'Supabase Admin',
            authType: 'supabase'
          };
          setIsAdmin(true);
          setAdminUser(user);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ authenticated: true, user }));
          return { success: true };
        }
        return { success: false, error: error?.message || 'Supabase authentication failed.' };
      } catch (err) {
        return { success: false, error: err.message || 'Login error occurred.' };
      }
    }
    return { success: false, error: 'Supabase connection is not configured in this environment.' };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      isAdmin,
      adminUser,
      loading,
      loginWithPasscode,
      loginWithSupabase,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
