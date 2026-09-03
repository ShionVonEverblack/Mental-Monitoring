import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface WipeResult {
  success: boolean;
  keysRemoved: number;
  supabaseCleaned: boolean;
  error?: string;
}

export async function wipeAllData(): Promise<WipeResult> {
  let keysRemoved = 0;
  let supabaseCleaned = false;

  try {
    // 1. Clean Supabase user data if logged in
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('mood_entries').delete().eq('user_id', user.id);
          await supabase.from('journal_entries').delete().eq('user_id', user.id);
          await supabase.from('safety_plans').delete().eq('user_id', user.id);
          await supabase.auth.signOut();
          supabaseCleaned = true;
        }
      } catch (err) {
        console.warn('Failed to wipe data from Supabase:', err);
      }
    }

    // 2. Collect all rima-* keys and clear them from localStorage
    const keysToWipe: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rima-') || key === 'local-storage')) {
        keysToWipe.push(key);
      }
    }

    keysToWipe.forEach(key => {
      localStorage.removeItem(key);
      keysRemoved++;
    });

    // 3. Dispatch storage and custom events to notify all active components
    window.dispatchEvent(new Event('local-storage'));
    window.dispatchEvent(new Event('storage'));

    return {
      success: true,
      keysRemoved,
      supabaseCleaned
    };
  } catch (err) {
    console.error('Wipe data failed:', err);
    return {
      success: false,
      keysRemoved,
      supabaseCleaned,
      error: String(err)
    };
  }
}
