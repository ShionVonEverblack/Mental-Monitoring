import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateAnonymousName, generateId } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { isNetworkAllowed } from '../stores/dualModeStore';

const INITIAL_ANON_USER: UserProfile = {
  id: generateId(),
  displayName: generateAnonymousName(),
  avatarSeed: Math.random().toString(36).substring(7),
  language: 'id',
  theme: 'dark',
  createdAt: new Date().toISOString(),
};

export interface AccountUser {
  id: string;
  email?: string;
  displayName?: string;
}

export interface UseAuthReturn {
  user: UserProfile;
  accountUser: AccountUser | null;
  isAuthenticated: boolean;
  isAnonymousMode: boolean;
  activeDisplayName: string;
  isAuthenticating: boolean;
  isSupabaseConfigured: boolean;
  toggleAnonymousMode: () => { success: boolean; requiresAuth: boolean };
  setAnonymousMode: (enabled: boolean) => void;
  updateDisplayName: (name: string) => void;
  regenerateAnonymousName: () => void;
  loginWithEmail: (email: string) => Promise<void>;
  verifyOtp?: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useLocalStorage<UserProfile>('rima-user-profile', INITIAL_ANON_USER);
  const [anonymousProfile, setAnonymousProfile] = useLocalStorage<UserProfile>('rima-anonymous-profile', INITIAL_ANON_USER);
  const [accountUser, setAccountUser] = useState<AccountUser | null>(null);
  const [isAnonymousMode, setIsAnonymousMode] = useLocalStorage<boolean>('rima-anonymous-mode', true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!isNetworkAllowed() || !isSupabaseConfigured || !supabase) return;

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAccountUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.displayName || session.user.email?.split('@')[0] || 'User',
        });
      }
    }).catch(err => {
      console.warn('Failed to get Supabase session:', err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAccountUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.displayName || session.user.email?.split('@')[0] || 'User',
        });
      } else {
        setAccountUser(null);
        setIsAnonymousMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [setIsAnonymousMode]);

  const isAuthenticated = Boolean(accountUser);

  const activeDisplayName = useMemo(() => {
    if (isAnonymousMode) {
      return anonymousProfile.displayName || user.displayName || generateAnonymousName();
    }
    return accountUser?.displayName || user.displayName;
  }, [isAnonymousMode, anonymousProfile.displayName, user.displayName, accountUser?.displayName]);

  const toggleAnonymousMode = useCallback(() => {
    if (isAnonymousMode) {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }
      setIsAnonymousMode(false);
      return { success: true, requiresAuth: false };
    } else {
      setIsAnonymousMode(true);
      return { success: true, requiresAuth: false };
    }
  }, [isAnonymousMode, isAuthenticated, setIsAnonymousMode]);

  const regenerateAnonymousName = useCallback(() => {
    const newName = generateAnonymousName();
    setAnonymousProfile(prev => ({ ...prev, displayName: newName }));
    setUser(prev => ({ ...prev, displayName: newName }));
  }, [setAnonymousProfile, setUser]);

  const updateDisplayName = useCallback((name: string) => {
    if (isAnonymousMode) {
      setAnonymousProfile(prev => ({ ...prev, displayName: name }));
    }
    setUser(prev => ({ ...prev, displayName: name }));
  }, [isAnonymousMode, setAnonymousProfile, setUser]);

  const loginWithEmail = async (email: string) => {
    if (!isNetworkAllowed()) {
      throw new Error('Mode Luring Penuh (Air-Gapped Vault) aktif. Beralih ke Mode Tersambung untuk masuk dengan akun.');
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase belum dikonfigurasi. Mode lokal tetap aktif.');
    }
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    if (!isNetworkAllowed()) {
      throw new Error('Mode Luring Penuh (Air-Gapped Vault) aktif. Beralih ke Mode Tersambung untuk masuk dengan akun.');
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase belum dikonfigurasi. Mode lokal tetap aktif.');
    }
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      if (data.user) {
        setAccountUser({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.displayName || data.user.email?.split('@')[0] || 'User',
        });
        setIsAnonymousMode(false);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAccountUser(null);
    setIsAnonymousMode(true);
    const freshUser: UserProfile = {
      id: generateId(),
      displayName: generateAnonymousName(),
      avatarSeed: Math.random().toString(36).substring(7),
      language: 'id',
      theme: 'dark',
      createdAt: new Date().toISOString(),
    };
    setUser(freshUser);
    setAnonymousProfile(freshUser);
  };

  return {
    user,
    accountUser,
    isAuthenticated,
    isAnonymousMode,
    activeDisplayName,
    toggleAnonymousMode,
    setAnonymousMode: setIsAnonymousMode,
    updateDisplayName,
    regenerateAnonymousName,
    loginWithEmail,
    verifyOtp,
    logout,
    isAuthenticating,
    isSupabaseConfigured,
  };
}
