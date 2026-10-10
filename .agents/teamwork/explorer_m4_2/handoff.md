# Handoff Report: Auth, In-App Incognito Mode & Forum Identity Architecture (M4: R3 & R4)

**Agent ID**: `explorer_m4_2`  
**Role**: Auth, Incognito Mode & Forum Identity Specialist  
**Working Directory**: `C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\explorer_m4_2`  
**Milestone**: M4 — Public Web Access & Modern Minimalist Experience  
**Date**: 2026-10-10T19:35:00Z  

---

## 1. Observation

### 1.1 Existing Auth Architecture (`src/hooks/useAuth.ts`)
- **File**: `src/hooks/useAuth.ts` (Lines 1–94)
- Current state management:
  - Line 17: `const [user, setUser] = useLocalStorage<UserProfile>('rima-user-profile', INITIAL_USER);`
  - Line 18: `const [isAuthenticating, setIsAuthenticating] = useState(false);`
  - Lines 20–47: Subscribes to Supabase `getSession()` and `onAuthStateChange`. When `session?.user` exists, it directly mutates `user.id` and `user.displayName`.
  - Line 63: `const { error } = await supabase.auth.signInWithOtp({ email });`
  - **Absence of Incognito Mode**: Currently, `useAuth` has no `isAnonymousMode` boolean state, no localStorage persistence for `'rima-anonymous-mode'`, and no `toggleAnonymousMode()` function.
  - **Lack of Identity Separation**: When Supabase logs in, `user.displayName` is overwritten with the account metadata. If the user desires anonymity, their real account name could be leaked because there is no separate store for an anonymous pseudonym versus authenticated profile.

### 1.2 Event-Driven Storage Synchronization (`src/hooks/useLocalStorage.ts`)
- **File**: `src/hooks/useLocalStorage.ts` (Lines 31–75)
- Line 40: `window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }));`
- Lines 60–75: Listens to both native `storage` events and `local-storage` CustomEvents.
- **Architectural Fact**: Calling `useLocalStorage('rima-anonymous-mode', true)` across multiple components (Header, Profile, Forum) guarantees instantaneous, zero-overhead reactive state updates across all mounted components without needing an external state store or context wrapper.

### 1.3 Forum Identity & Pseudonym Flow (`src/pages/Forum.tsx` & `src/services/forumService.ts`)
- **File**: `src/pages/Forum.tsx`
  - Line 43: `const [anonymousAuthor, setAnonymousAuthor] = useState(() => generateAnonymousName());`
  - Lines 120–125: Post creation sends `anonymousAuthor` directly:
    ```ts
    const { isCrisis } = await createForumPost(newTitle.trim(), newContent.trim(), newCategory, anonymousAuthor);
    ```
  - Line 171: Comment creation calls `addCommentToPost(postId, newCommentText.trim());` which falls back inside `forumService.ts:267` to `generateAnonymousName()`.
  - Line 319: Displays `postingAs: anonymousAuthor` in composing card.
  - Line 452: Post header displays `post.authorName`.
  - Line 516: Comment card displays `comment.authorName`.
- **File**: `src/utils/constants.ts` (Lines 428–429) & `src/utils/helpers.ts` (Lines 60–64):
  - `ANONYMOUS_ADJECTIVES = ['Brave', 'Gentle', 'Quiet', 'Bright', 'Calm', 'Mighty', 'Soft', 'Warm', 'Cool', 'Clear']`
  - `ANONYMOUS_NOUNS = ['Butterfly', 'Wave', 'Breeze', 'Cloud', 'Star', 'Moon', 'Sun', 'Forest', 'River', 'Mountain']`
  - `generateAnonymousName()` combines these into soothing pseudonyms such as `"Calm River"`, `"Gentle Breeze"`, and `"Quiet Wave"`.
  - **Issue**: `Forum.tsx` currently does not import or subscribe to `useAuth()`. It does not detect whether `isAnonymousMode` is toggled on or off, and does not provide an option for authenticated users to post under their account or pseudonym.

### 1.4 Header & Profile Integration Anchors
- **Home Header**: `src/pages/Home.tsx` (Lines 108–134):
  - Line 110: `.zen-header-actions` contains `.home-lang-btn.zen-lang-btn` and `.streak-badge.zen-streak-badge`.
  - `src/styles/components.css` (Lines 791–828): Pill styling with `var(--bg-glass-card)`, `backdrop-filter: blur(16px)`, `border-radius: var(--radius-full)`, `border: 1px solid var(--border-subtle)`.
  - This is the exact design system anchor for the in-app incognito pill toggle.
- **Profile Page**: `src/pages/Profile.tsx` (Lines 249–289):
  - Line 267: Displays `user.displayName` with edit and regenerate buttons.
  - Lines 285–288: Static badge: `<Shield size={14} /> <span>{t('profile.anonBadge')}</span>`.
  - Ideal location to place the interactive pill toggle alongside the display name and in the security/privacy section.
- **AppShell**: `src/components/layout/AppShell.tsx` (Lines 12–35):
  - Clean flex wrapper (`.app-shell`) with `<Sidebar />`, `<main className="app-main">`, and `<BottomNav />`. No top header bar currently exists in `AppShell` itself; page-level headers are used.

### 1.5 Supabase Client Configuration & Modal Primitives
- **File**: `src/services/supabase.ts` (Lines 1–11):
  - Exports `isSupabaseConfigured` (boolean) and `supabase` (SupabaseClient | null).
- **Modal Component**: `src/components/ui/Modal.tsx` (Lines 1–152):
  - Full WCAG focus-trapping, portal to body, Escape key listener, backdrop blur (`.modal-overlay`), and smooth CSS animations (`fadeIn`, `scaleIn`).
- **Input & Button Components**: `src/components/ui/Input.tsx` and `src/components/ui/Button.tsx`:
  - Support `icon`, `label`, `error`, `loading` spinner (`Loader2`), variants (`primary`, `secondary`, `ghost`), and WCAG touch targets.

### 1.6 Quality Gates Baseline
- `npm run lint` (`oxlint`): 0 warnings, 0 errors (130 files checked in 34ms).
- `npx tsc -b`: Exited with code 0 (clean compilation).
- `npm run test` (`vitest`): 44 test files passed, 456 tests passed (100% pass rate).
- `npm run build` (`tsc -b && vite build`): Succeeded in 1.32s generating PWA assets.
- `src/test/i18nParity.test.ts`: Strictly enforces 100% exact key parity between `id.json` and all 7 other languages (`en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`).

---

## 2. Logic Chain

### 2.1 Dual-Identity Architecture in `useAuth.ts` (R3)
1. **Separation of Concerns**: To prevent leaking the user's real name while in Incognito Mode, `useAuth` must decouple the authenticated identity from the anonymous identity:
   - `accountUser`: Session-derived object `{ id: string; email?: string; displayName?: string } | null`.
   - `anonymousProfile`: Pseudonym object `{ displayName: string; avatarSeed: string }` stored in `'rima-anonymous-profile'`.
   - `isAnonymousMode`: Boolean stored in `'rima-anonymous-mode'` via `useLocalStorage`.
2. **Default State Determination**:
   - For visitors without an authenticated Supabase session, `isAnonymousMode` defaults to `true`.
   - For users with an active session, `isAnonymousMode` initializes to `false` unless the user previously set it to `true` in `localStorage`.
3. **Toggle Logic**:
   - Switching to Anonymous Mode (`true`): Always permitted in 1 click. Masks real name/email immediately.
   - Switching to Account Mode (`false`): Permitted only if `isAuthenticated === true`. If the user is unauthenticated, the toggle returns `{ requiresAuth: true }`, which triggers opening the `AuthModal` dialog.
4. **Subscription Model**:
   - Because `useLocalStorage` emits a `window` `local-storage` CustomEvent on update, any component calling `useAuth()` automatically re-renders with the latest `isAnonymousMode` and `activeDisplayName` without prop-drilling.

```typescript
// Proposed useAuth.ts expansion:
export interface UseAuthReturn {
  user: UserProfile;
  accountUser: { id: string; email?: string; displayName?: string } | null;
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
```

### 2.2 Interactive Incognito Pill Toggle Component (`IncognitoPillToggle.tsx`)
1. **Component Design**:
   - Creates a reusable `<IncognitoPillToggle onRequireAuth?: () => void />` component.
   - **Active State (🕶️ Mode Anonim Aktif)**:
     - Visual: Subtle frosted glass pill, sunglasses emoji (`🕶️`), calm text `Mode Anonim Aktif`.
     - Behavior: On click, calls `toggleAnonymousMode()`. If unauthenticated, triggers `onRequireAuth()` to open `AuthModal`. If authenticated, switches to Account Mode with a toast notification.
   - **Inactive State (👤 Akun Terhubung)**:
     - Visual: Glowing primary accent glass pill, user icon (`👤`), text `Akun Terhubung` (or user name).
     - Behavior: On click, 1-click instant return to `isAnonymousMode = true` with toast confirmation: "🕶️ Mode Anonim Aktif. Identitas publik Anda disembunyikan."
2. **Placement**:
   - **Primary Placement (Home Header)**: Inside `zen-header-actions` in `src/pages/Home.tsx`, directly alongside `zen-lang-btn` and `zen-streak-badge`.
   - **Secondary Placement (Profile Header)**: In `src/pages/Profile.tsx`, replacing the static `anonBadge` below the user avatar and in the security section.
   - **Tertiary Placement (Desktop Sidebar / AppShell)**: Inside `src/components/layout/Sidebar.tsx` footer or header for persistent visibility across all views on wide screens.

### 2.3 Forum Identity Protection Flow (`Forum.tsx`)
1. **Subscription**: `Forum.tsx` imports and subscribes to `{ isAnonymousMode, activeDisplayName, accountUser, toggleAnonymousMode } = useAuth()`.
2. **Post Author Masking**:
   - If `isAnonymousMode === true`:
     - `anonymousAuthor` is randomly assigned via `generateAnonymousName()` (e.g. `"Calm River"`, `"Gentle Breeze"`).
     - Composing card displays: `🕶️ {t('forum.postingAsAnon')}: {anonymousAuthor}` with a "🎲 Acak Nama" re-roll button.
     - `createForumPost` strictly receives `anonymousAuthor`. Real account ID and email are completely withheld.
   - If `isAnonymousMode === false`:
     - Composing card displays: `👤 {t('forum.postingAsUser')}: {activeDisplayName}` with a quick `🕶️ {t('forum.switchToAnon')}` button.
     - `createForumPost` receives `activeDisplayName`.
3. **Comment Author Masking**:
   - In `handleAddComment(postId)`:
     - If `isAnonymousMode === true`: sends `generateAnonymousName()` or session pseudonym.
     - If `isAnonymousMode === false`: sends `activeDisplayName`.
4. **Header Banner**: Forum header includes an ambient badge showing active identity protection status so users feel 100% safe before posting.

### 2.4 Modern Minimalist AuthModal (`AuthModal.tsx`) (R4)
1. **Container**: Built using `<Modal isOpen={isOpen} onClose={onClose} size="sm" title={...}>`.
2. **State Machine**:
   ```
   [ 'input' ]  ──(Submit Valid Email)──>  [ 'sending' ]
        │                                       │
        │ (Cancel / Escape / Click Outside)      │ (Supabase signInWithOtp)
        ▼                                       ▼
   [ Closed -> Returns to Anonymous Mode ]   [ 'sent' ]
                                                │
                                                ├──(Optional OTP input: verifyOtp)
                                                └──(Magic link clicked in email)
   ```
3. **Validation**:
   - Rejects empty input: `t('auth.emailRequired')`.
   - Validates format via standard RFC email regex: `t('auth.emailInvalid')`.
4. **Sending & Invocation**:
   - Calls `supabase.auth.signInWithOtp({ email: trimmedEmail, options: { emailRedirectTo: window.location.origin } })`.
   - Accessible `aria-busy` and `Loader2` animation on submit button.
5. **Sent Status**:
   - Clear visual reassurance: mail icon with calm secondary green/cyan highlight.
   - Helpful guidance: "Periksa kotak masuk email Anda dan klik tautan untuk masuk secara instan."
   - 60-second cooldown timer for the "Kirim Ulang Tautan" button to prevent spam/rate-limiting.
   - Dual-mode support: Magic link link click OR 6-digit OTP code entry with `supabase.auth.verifyOtp`.
6. **Zero-Friction Cancellation**:
   - A clear secondary button: `t('auth.cancelAndStayAnonymous', 'Tetap sebagai Tamu Anonim')`.
   - Clicking cancel or closing the dialog cleanly dismisses the modal without error and guarantees the user remains in anonymous mode with zero barriers.

---

## 3. Caveats

1. **Supabase Environment Variables**: In local offline environments without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, Supabase authentication cannot send real emails. `AuthModal` must include a graceful alert explaining that local anonymous mode remains fully functional.
2. **Session Persistence**: Supabase JS client persists session tokens in `localStorage` under `sb-<project-ref>-auth-token`. When an authenticated user activates Incognito Mode, their Supabase token is NOT deleted; only their in-app presentation and outbound forum payloads are masked. Signing out completely (`logout()`) deletes the token and resets identity.
3. **Pre-existing Forum Posts**: In Supabase table `forum_posts`, posts already submitted with an author name are immutable. Toggling incognito mode only affects new posts and comments authored from that point forward.
4. **Strict i18n Key Parity**: Any new translation key introduced MUST be added to all 8 locale files (`id.json`, `en.json`, `jv.json`, `su.json`, `ja.json`, `zh.json`, `es.json`, `ar.json`) simultaneously to avoid breaking `src/test/i18nParity.test.ts`.

---

## 4. Conclusion

The existing RIMA codebase provides an exceptionally well-structured, modular foundation for R3 and R4. By combining the existing `useLocalStorage` event bus with a decoupled dual-identity model in `useAuth.ts`, the implementation will achieve:
1. **Instantaneous cross-component reactivity** for the incognito toggle without prop-drilling or external context overhead.
2. **Aesthetic Zen Pill UI** in `Home.tsx` (`zen-header-actions`) and `Profile.tsx` perfectly matching existing design tokens.
3. **Ironclad forum privacy** with soothing random pseudonyms (`"Calm River"`, `"Gentle Breeze"`) generated from existing constants whenever incognito mode is active.
4. **A friction-free AuthModal** supporting Supabase Magic Link OTP with clean 3-state UX and instant return to anonymous guest mode.

---

## 5. Implementation Specifications & Code Blueprints

### 5.1 Proposed Blueprint: `src/hooks/useAuth.ts`
```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateAnonymousName, generateId } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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

export function useAuth() {
  const [user, setUser] = useLocalStorage<UserProfile>('rima-user-profile', INITIAL_ANON_USER);
  const [anonymousProfile, setAnonymousProfile] = useLocalStorage<UserProfile>('rima-anonymous-profile', INITIAL_ANON_USER);
  const [accountUser, setAccountUser] = useState<AccountUser | null>(null);
  const [isAnonymousMode, setIsAnonymousMode] = useLocalStorage<boolean>('rima-anonymous-mode', true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

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

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAccountUser(null);
    setIsAnonymousMode(true);
    const freshUser = {
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
    logout,
    isAuthenticating,
    isSupabaseConfigured,
  };
}
```

### 5.2 Proposed Blueprint: `src/components/auth/IncognitoPillToggle.tsx`
```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { UserCheck, Shield } from 'lucide-react';

interface IncognitoPillToggleProps {
  onRequireAuth?: () => void;
  className?: string;
}

export const IncognitoPillToggle: React.FC<IncognitoPillToggleProps> = ({
  onRequireAuth,
  className = '',
}) => {
  const { t } = useTranslation();
  const { isAnonymousMode, isAuthenticated, toggleAnonymousMode } = useAuth();

  const handleToggle = () => {
    const result = toggleAnonymousMode();
    if (!result.success && result.requiresAuth && onRequireAuth) {
      onRequireAuth();
    }
  };

  if (isAnonymousMode) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`incognito-pill-btn incognito-pill-active ${className}`}
        aria-label={t('auth.incognitoModeActive', 'Mode Anonim Aktif')}
        title={isAuthenticated ? t('auth.switchToAccount', 'Beralih ke Akun') : t('auth.connectAccount', 'Masuk dengan Akun')}
      >
        <span className="incognito-pill-emoji" aria-hidden="true">🕶️</span>
        <span className="incognito-pill-label">{t('auth.incognitoModeActive', 'Mode Anonim Aktif')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`incognito-pill-btn incognito-pill-account ${className}`}
      aria-label={t('auth.accountConnected', 'Akun Terhubung')}
      title={t('auth.switchToAnonymous', 'Beralih ke Mode Anonim (1-Klik)')}
    >
      <span className="incognito-pill-emoji" aria-hidden="true">👤</span>
      <span className="incognito-pill-label">{t('auth.accountConnected', 'Akun Terhubung')}</span>
      <span className="incognito-pill-hint">1-Klik Anonim</span>
    </button>
  );
};
```

### 5.3 Proposed Blueprint: `src/components/auth/AuthModal.tsx`
```typescript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { Mail, CheckCircle2, Shield, AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { loginWithEmail, isSupabaseConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('auth.emailRequired', 'Email tidak boleh kosong.'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('auth.emailInvalid', 'Format email tidak valid.'));
      return;
    }
    setError(null);
    setStatus('sending');

    try {
      await loginWithEmail(email.trim());
      setStatus('sent');
    } catch (err: unknown) {
      setStatus('idle');
      const msg = err instanceof Error ? err.message : t('common.error', 'Terjadi kesalahan.');
      setError(msg);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setStatus('idle');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={status === 'sent' ? t('auth.sentTitle', 'Tautan Masuk Terkirim') : t('auth.modalTitle', 'Masuk dengan Akun')}
    >
      {status === 'sent' ? (
        <div className="auth-modal-sent">
          <div className="auth-sent-icon-wrapper">
            <CheckCircle2 size={48} className="auth-sent-icon" />
          </div>
          <h3 className="auth-sent-heading">{t('auth.checkEmailTitle', 'Periksa Kotak Masuk Anda')}</h3>
          <p className="auth-sent-desc">
            {t('auth.sentDesc', 'Kami telah mengirimkan tautan masuk ajaib (Magic Link) ke')} <strong>{email}</strong>. {t('auth.clickToSignIn', 'Klik tautan tersebut untuk masuk secara instan.')}
          </p>
          <div className="auth-sent-note">
            <Shield size={16} />
            <span>{t('auth.privacyNote', 'Anda dapat kembali ke Mode Anonim kapan saja setelah masuk.')}</span>
          </div>
          <div className="auth-modal-actions">
            <Button variant="primary" onClick={handleClose} className="auth-btn-full">
              {t('auth.continueInApp', 'Lanjut Menggunakan Aplikasi')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-modal-form">
          <p className="auth-modal-desc">
            {t('auth.modalSubtitle', 'Tautkan akun tanpa kata sandi menggunakan Magic Link OTP. Data tetap terlindungi di perangkat Anda.')}
          </p>

          {!isSupabaseConfigured && (
            <div className="auth-warning-box">
              <AlertCircle size={18} />
              <span>{t('auth.supabaseNotConfigured', 'Koneksi Supabase belum diatur. Mode offline-first lokal tetap aktif sepenuhnya.')}</span>
            </div>
          )}

          <Input
            label={t('auth.emailLabel', 'Alamat Email')}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder={t('auth.emailPlaceholder', 'nama@contoh.com')}
            icon={<Mail size={18} />}
            error={error || undefined}
            autoFocus
            disabled={status === 'sending'}
          />

          <div className="auth-modal-actions">
            <Button
              type="submit"
              variant="primary"
              loading={status === 'sending'}
              disabled={status === 'sending' || !isSupabaseConfigured}
              className="auth-btn-full"
            >
              {status === 'sending' ? t('auth.sending', 'Mengirimkan...') : t('auth.sendMagicLink', 'Kirim Tautan Masuk')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={status === 'sending'}
              className="auth-btn-full"
              icon={<ArrowLeft size={16} />}
            >
              {t('auth.cancelAndStayAnonymous', 'Tetap sebagai Tamu Anonim')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
```

### 5.4 Proposed CSS Tokens & Styling (`src/styles/components.css`)
```css
/* In-App Incognito Pill Toggle */
.incognito-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-glass-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  color: var(--text-primary);
  min-height: 48px;
  box-sizing: border-box;
  box-shadow: var(--shadow-subtle), var(--border-glass-rim);
  transition: all var(--transition-fast);
}

.incognito-pill-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--border-strong);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}

.incognito-pill-btn:active {
  transform: scale(0.98);
}

.incognito-pill-active {
  border-color: hsla(165, 45%, 50%, 0.3);
  color: var(--text-primary);
}

.incognito-pill-account {
  background: hsla(215, 65%, 55%, 0.12);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.incognito-pill-hint {
  font-size: 0.688rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: hsla(215, 65%, 55%, 0.15);
  margin-left: 4px;
}

/* Auth Modal Styles */
.auth-modal-form,
.auth-modal-sent {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.auth-modal-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.auth-warning-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: hsla(35, 75%, 60%, 0.12);
  border: 1px solid var(--color-warm);
  color: var(--color-warm);
  font-size: var(--font-size-xs);
}

.auth-modal-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.auth-btn-full {
  width: 100%;
  justify-content: center;
}

.auth-sent-icon-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.auth-sent-icon {
  color: var(--color-secondary);
  animation: scaleIn 0.3s ease-out;
}

.auth-sent-heading {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  text-align: center;
  color: var(--text-primary);
  margin: 0;
}

.auth-sent-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.auth-sent-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-glass-subtle);
  border: 1px solid var(--border-subtle);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}
```

### 5.5 8-Language Translation Parity Matrix for `auth.*`
All 8 files in `src/i18n/` must contain the following keys under `"auth"`:

| Key | ID | EN | JV | SU | JA | ZH | ES | AR |
|---|---|---|---|---|---|---|---|---|
| `incognitoModeActive` | Mode Anonim Aktif | Anonymous Mode Active | Mode Anonim Aktif | Mode Anonim Aktip | 匿名モード有効 | 匿名模式已开启 | Modo anónimo activo | الوضع المجهول مفعّل |
| `accountConnected` | Akun Terhubung | Account Connected | Akun Kasambung | Akun Nyambung | アカウント連携中 | 已关联账户 | Cuenta conectada | الحساب متصل |
| `switchToAnonymous` | Beralih ke Mode Anonim | Switch to Anonymous Mode | Pindhah menyang Mode Anonim | Pindah ka Mode Anonim | 匿名モードに切り替える | 切换至匿名模式 | Cambiar a modo anónimo | التبديل إلى الوضع المجهول |
| `switchToAccount` | Beralih ke Akun Terhubung | Switch to Connected Account | Pindhah menyang Akun Kasambung | Pindah ka Akun Nyambung | 連携アカウントに切り替える | 切换至关联账户 | Cambiar a cuenta conectada | التبديل إلى الحساب المتصل |
| `connectAccount` | Masuk dengan Akun | Sign in with Account | Mlebet nganggo Akun | Lebet nganggo Akun | アカウントでログイン | 使用账户登录 | Iniciar sesión con cuenta | تسجيل الدخول بالحساب |
| `modalTitle` | Masuk dengan Akun | Sign in with Account | Mlebet nganggo Akun | Lebet nganggo Akun | アカウントでログイン | 使用账户登录 | Iniciar sesión con cuenta | تسجيل الدخول بالحساب |
| `modalSubtitle` | Tautkan akun tanpa kata sandi menggunakan Magic Link OTP. | Link your account passwordlessly using Magic Link OTP. | Sambungake akun tanpa tembung sandi nganggo Magic Link OTP. | Sambungkeun akun tanpa kecap konci nganggo Magic Link OTP. | Magic Link OTPを使用してパスワードなしで連携します。 | 通过 Magic Link OTP 无密码关联您的账户。 | Vincule su cuenta sin contraseña con Magic Link OTP. | اربط حسابك بدون كلمة مرور عبر رابط OTP السحري. |
| `emailLabel` | Alamat Email | Email Address | Alamat Email | Alamat Surélék | メールアドレス | 电子邮箱 | Correo electrónico | البريد الإلكتروني |
| `emailPlaceholder` | nama@contoh.com | name@example.com | jeneng@conto.com | nami@conto.com | name@example.com | name@example.com | nombre@ejemplo.com | name@example.com |
| `emailRequired` | Email tidak boleh kosong. | Email cannot be empty. | Email mboten kepareng kosong. | Surélék teu kénging kosong. | メールアドレスを入力してください。 | 电子邮箱不能为空。 | El correo electrónico no puede estar vacío. | لا يمكن أن يكون البريد الإلكتروني فارغاً. |
| `emailInvalid` | Format email tidak valid. | Invalid email format. | Format email mboten leres. | Format surélék teu leres. | メールアドレスの形式が正しくありません。 | 电子邮箱格式无效。 | Formato de correo electrónico no válido. | صيغة البريد الإلكتروني غير صالحة. |
| `sendMagicLink` | Kirim Tautan Masuk | Send Magic Link | Kirim Tautan Mlebet | Kirim Tautan Lebet | ログインリンクを送信 | 发送登录链接 | Enviar enlace de acceso | إرسال رابط الدخول |
| `sending` | Mengirimkan... | Sending... | Ngirim... | Ngrimkeun... | 送信中... | 发送中... | Enviando... | جارٍ الإرسال... |
| `sentTitle` | Tautan Masuk Terkirim | Magic Link Sent | Tautan Mlebet Sampun Dikirim | Tautan Lebet Parantos Dikirim | ログインリンクを送信しました | 登录链接已发送 | Enlace de acceso enviado | تم إرسال رابط الدخول |
| `checkEmailTitle` | Periksa Kotak Masuk Anda | Check Your Inbox | Priksa Kothak Mlebet Panjenengan | Pariksa Koropak Anjeun | 受信トレイを確認してください | 请检查您的收件箱 | Revise su bandeja de entrada | تحقق من صندوق الوارد |
| `sentDesc` | Kami telah mengirimkan tautan masuk ajaib (Magic Link) ke | We have sent a magic sign-in link to | Kita sampun ngirim tautan mlebet ajaib menyang | Simkuring parantos ngirim tautan lebet ajaib ka | 次の宛先にマジックログインリンクを送信しました： | 我们已将登录链接发送至 | Hemos enviado un enlace de acceso mágico a | لقد أرسلنا رابط تسجيل الدخول السحري إلى |
| `clickToSignIn` | Klik tautan tersebut untuk masuk secara instan. | Click the link to sign in instantly. | Klik tautan kasebut kanggo mlebet sanalika. | Klik tautan kasebut pikeun lebet sacara instan. | リンクをクリックしてすぐにログインしてください。 | 点击该链接即可立即登录。 | Haga clic en el enlace para iniciar sesión al instante. | انقر على الرابط لتسجيل الدخول فوراً. |
| `cancelAndStayAnonymous` | Tetap sebagai Tamu Anonim | Stay as Anonymous Guest | Tetep minangka Tamu Anonim | Tetep salaku Sémah Anonim | 匿名のゲストのままにする | 保持为匿名访客 | Permanecer como invitado anónimo | البقاء كضيف مجهول |
| `continueInApp` | Lanjut Menggunakan Aplikasi | Continue Using App | Terus Nggunakake Aplikasi | Terus Nganggo Aplikasi | アプリの利用を続ける | 继续使用应用 | Continuar usando la aplicación | المتابعة في استخدام التطبيق |
| `privacyNote` | Anda dapat kembali ke Mode Anonim kapan saja setelah masuk. | You can return to Anonymous Mode at any time after signing in. | Sampeyan saged wangsul menyang Mode Anonim kapan kemawon sasampunipun mlebet. | Anjeun tiasa uih deui ka Mode Anonim iraha waé saatos lebet. | ログイン後もいつでも匿名モードに戻ることができます。 | 登录后您可以随时返回匿名模式。 | Puede volver al modo anónimo en cualquier momento tras iniciar sesión. | يمكنك العودة إلى الوضع المجهول في أي وقت بعد تسجيل الدخول. |
| `supabaseNotConfigured` | Layanan Supabase belum diatur. Mode lokal tetap aktif. | Supabase is not configured. Local mode remains active. | Layanan Supabase dereng dipuntata. Mode lokal tetep aktif. | Layanan Supabase can dikonfigurasi. Mode lokal tetep aktip. | Supabaseが未設定です。ローカルモードが有効です。 | Supabase 未配置。本地模式保持激活状态。 | Supabase no está configurado. El modo local permanece activo. | لم يتم تكوين Supabase. يظل الوضع المحلي مفعلاً. |

---

## 6. Verification Method

To independently reproduce and verify this investigation:
1. **Linter Gate**: Run `npm run lint` in project root. Expected output: `Found 0 warnings and 0 errors.`
2. **Typecheck Gate**: Run `npx tsc -b`. Expected output: Exit code 0 without any type mismatch.
3. **Vitest Gate**: Run `npm run test`. Expected output: All 44+ test files and 456+ tests pass 100%.
4. **i18n Parity Gate**: Run `npx vitest run src/test/i18nParity.test.ts`. Expected output: 100% key parity across all 8 languages with 0 missing and 0 extra keys.
5. **Build Gate**: Run `npm run build`. Expected output: Production bundle built successfully in `dist/` with PWA service worker precache generated.

---

### Invalidation Conditions
- If Supabase `@supabase/supabase-js` API changes its `signInWithOtp` signature.
- If `useLocalStorage` event system is altered or decoupled from `CustomEvent('local-storage')`.
- If new translation keys are added without 100% parity across all 8 language JSON files.
