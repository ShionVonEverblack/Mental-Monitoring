import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateAnonymousName, generateId } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const INITIAL_USER: UserProfile = {
  id: generateId(),
  displayName: generateAnonymousName(),
  avatarSeed: Math.random().toString(36).substring(7),
  language: 'id',
  theme: 'dark',
  createdAt: new Date().toISOString(),
};

export function useAuth() {
  const [user, setUser] = useLocalStorage<UserProfile>('rima-user-profile', INITIAL_USER);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          displayName: session.user.user_metadata?.displayName || prev.displayName,
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          displayName: session.user.user_metadata?.displayName || prev.displayName,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const updateDisplayName = useCallback((name: string) => {
    setUser(prev => ({ ...prev, displayName: name }));
  }, [setUser]);

  const regenerateAnonymousName = useCallback(() => {
    setUser(prev => ({ ...prev, displayName: generateAnonymousName() }));
  }, [setUser]);

  const loginWithEmail = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase belum dikonfigurasi. Mode lokal tetap aktif.');
    }
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser({
      id: generateId(),
      displayName: generateAnonymousName(),
      avatarSeed: Math.random().toString(36).substring(7),
      language: 'id',
      theme: 'dark',
      createdAt: new Date().toISOString(),
    });
  };

  return {
    user,
    updateDisplayName,
    regenerateAnonymousName,
    loginWithEmail,
    logout,
    isAuthenticating,
    isSupabaseConfigured,
  };
}
