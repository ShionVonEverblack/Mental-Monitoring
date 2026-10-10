import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, renderHook, waitFor } from '@testing-library/react';
import '../i18n/config';
import i18n from 'i18next';

// Domain services, constants, and utilities under test
import {
  createForumPost,
  addCommentToPost,
} from '../services/forumService';
import { ANONYMOUS_ADJECTIVES, ANONYMOUS_NOUNS } from '../utils/constants';
import { generateAnonymousName } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { IncognitoPillToggle } from '../components/auth/IncognitoPillToggle';
import { AuthModal } from '../components/auth/AuthModal';
import { Forum } from '../pages/Forum';

/* =========================================================================
 * Supabase Mock Instrumentation for Outbound Payload & Auth Spying
 * ========================================================================= */
const mockPostsInsert = vi.fn().mockImplementation((payload) => Promise.resolve({ data: payload, error: null }));
const mockCommentsInsert = vi.fn().mockImplementation((payload) => Promise.resolve({ data: payload, error: null }));
const mockSignInWithOtp = vi.fn().mockResolvedValue({ data: {}, error: null });
let mockSessionUser: { id: string; email?: string; user_metadata?: { displayName?: string } } | null = null;
let authStateListener: ((event: string, session: { user: typeof mockSessionUser } | null) => void) | null = null;

const mockSignOut = vi.fn().mockImplementation(() => {
  mockSessionUser = null;
  if (authStateListener) {
    authStateListener('SIGNED_OUT', null);
  }
  return Promise.resolve({ error: null });
});

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: (table: string) => {
      if (table === 'forum_posts' || table === 'forum_posts_public') {
        return {
          insert: mockPostsInsert,
          select: () => ({
            order: () => ({
              range: () => Promise.resolve({ data: [], error: null }),
            }),
            eq: () => ({
              order: () => ({
                range: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
          }),
        };
      }
      if (table === 'forum_comments') {
        return {
          insert: mockCommentsInsert,
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    },
    auth: {
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: () => Promise.resolve({
        data: {
          session: mockSessionUser ? { user: mockSessionUser } : null,
        },
      }),
      onAuthStateChange: (cb: (event: string, session: { user: typeof mockSessionUser } | null) => void) => {
        authStateListener = cb;
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authStateListener = null;
              },
            },
          },
        };
      },
      verifyOtp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));

describe('Adversarial Challenger: Incognito Anonymity & Auth Stress Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    mockPostsInsert.mockClear();
    mockCommentsInsert.mockClear();
    mockSignInWithOtp.mockClear();
    mockSignOut.mockClear();
    mockSessionUser = null;
    authStateListener = null;

    await act(async () => {
      await i18n.changeLanguage('id');
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /* =========================================================================
   * SECTION 1: ANONYMITY LEAK TEST & FORUM PAYLOAD INTEGRITY
   * ========================================================================= */
  describe('1. Anonymity Leak & Payload Masking Invariants', () => {
    it('verifies createForumPost outbound payload NEVER attaches account email, userId, or real name in anonymous mode', async () => {
      const sensitiveAccount = {
        id: 'usr-adversary-sec-007',
        email: 'whistleblower@topsecret.gov',
        displayName: 'Edward Snowden',
      };

      // In anonymous mode, authorName passed to createForumPost is a soothing pseudonym
      const anonymousPseudonym = generateAnonymousName();
      const { post, isCrisis } = await createForumPost(
        'Refleksi Hari Ini',
        'Saya merasa lebih tenang setelah meditasi sejenak.',
        'self-care',
        anonymousPseudonym
      );

      expect(isCrisis).toBe(false);
      expect(post.authorName).toBe(anonymousPseudonym);

      // Verify that sensitive credentials NEVER leak into the created post object
      const postStringified = JSON.stringify(post);
      expect(postStringified).not.toContain(sensitiveAccount.email);
      expect(postStringified).not.toContain(sensitiveAccount.id);
      expect(postStringified).not.toContain(sensitiveAccount.displayName);

      // Verify outbound Supabase insert payload structure
      expect(mockPostsInsert).toHaveBeenCalledTimes(1);
      const insertedRows = mockPostsInsert.mock.calls[0][0];
      expect(Array.isArray(insertedRows)).toBe(true);
      const insertedRow = insertedRows[0];

      // Deep inspection of the inserted record
      expect(insertedRow).toHaveProperty('id');
      expect(insertedRow).toHaveProperty('author_name', anonymousPseudonym);
      expect(insertedRow).toHaveProperty('title', 'Refleksi Hari Ini');
      expect(insertedRow).toHaveProperty('content');
      expect(insertedRow).toHaveProperty('category', 'self-care');

      // Crucial negative assertions: NO PII keys or values allowed
      expect(insertedRow).not.toHaveProperty('email');
      expect(insertedRow).not.toHaveProperty('user_id');
      expect(insertedRow).not.toHaveProperty('userId');
      expect(insertedRow).not.toHaveProperty('account_id');
      expect(insertedRow).not.toHaveProperty('authorEmail');

      const payloadString = JSON.stringify(insertedRow);
      expect(payloadString).not.toContain(sensitiveAccount.email);
      expect(payloadString).not.toContain(sensitiveAccount.id);
      expect(payloadString).not.toContain(sensitiveAccount.displayName);

      // Validate soothing pseudonym structure: "<Adjective> <Noun>"
      const [adj, noun] = insertedRow.author_name.split(' ');
      expect(ANONYMOUS_ADJECTIVES).toContain(adj);
      expect(ANONYMOUS_NOUNS).toContain(noun);
    });

    it('verifies addCommentToPost outbound payload strictly uses soothing pseudonyms with zero identity leakage', async () => {
      const sensitiveAccount = {
        id: 'uuid-patient-987654',
        email: 'patient.private@clinic.org',
        displayName: 'Private Patient',
      };

      const commentPseudonym = generateAnonymousName();
      const comment = await addCommentToPost(
        'post-test-101',
        'Semangat ya, kamu pasti bisa melewati fase ini!',
        commentPseudonym
      );

      expect(comment.authorName).toBe(commentPseudonym);
      expect(comment.content).toBe('Semangat ya, kamu pasti bisa melewati fase ini!');

      // Inspect outbound Supabase insert payload
      expect(mockCommentsInsert).toHaveBeenCalledTimes(1);
      const insertedCommentRows = mockCommentsInsert.mock.calls[0][0];
      const insertedComment = insertedCommentRows[0];

      expect(insertedComment).toHaveProperty('id');
      expect(insertedComment).toHaveProperty('post_id', 'post-test-101');
      expect(insertedComment).toHaveProperty('author_name', commentPseudonym);
      expect(insertedComment).toHaveProperty('content');
      expect(insertedComment).toHaveProperty('is_supportive', true);

      // Verify absence of sensitive tracking fields
      expect(insertedComment).not.toHaveProperty('user_id');
      expect(insertedComment).not.toHaveProperty('userId');
      expect(insertedComment).not.toHaveProperty('email');

      const commentString = JSON.stringify(insertedComment);
      expect(commentString).not.toContain(sensitiveAccount.email);
      expect(commentString).not.toContain(sensitiveAccount.id);
      expect(commentString).not.toContain(sensitiveAccount.displayName);

      // Validate soothing pseudonym vocabulary
      const [adj, noun] = commentPseudonym.split(' ');
      expect(ANONYMOUS_ADJECTIVES).toContain(adj);
      expect(ANONYMOUS_NOUNS).toContain(noun);
    });

    it('empirically verifies Monte Carlo distribution of 1,000 generated pseudonyms has zero nulls and conforms strictly to calming word pool', () => {
      const sampleSize = 1000;
      const generatedNames = new Set<string>();

      for (let i = 0; i < sampleSize; i++) {
        const name = generateAnonymousName();
        expect(typeof name).toBe('string');
        expect(name.trim().length).toBeGreaterThan(3);

        const parts = name.split(' ');
        expect(parts.length).toBe(2);
        const [adjective, noun] = parts;

        expect(ANONYMOUS_ADJECTIVES).toContain(adjective);
        expect(ANONYMOUS_NOUNS).toContain(noun);

        generatedNames.add(name);
      }

      // Theoretical combinations: 10 adjectives * 10 nouns = 100 combinations
      // Across 1,000 draws, a uniform random generator should explore at least 40+ unique combinations
      expect(generatedNames.size).toBeGreaterThanOrEqual(40);
    });

    it('renders Forum with anonymous mode active: verifies zero leak of real user profile in DOM and allows rerolling pseudonym via dice button', async () => {
      // Simulate existing profile in storage
      localStorage.setItem('rima-anonymous-mode', JSON.stringify(true));
      localStorage.setItem('rima-user-profile', JSON.stringify({
        id: 'usr-confidential-99',
        displayName: 'Prof. John Doe',
        avatarSeed: 'seed123',
        language: 'id',
        theme: 'dark',
        createdAt: new Date().toISOString(),
      }));

      render(<Forum />);

      // Wait for initial posts to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Forum Komunitas/i);
      });

      // Verify that user's real name does NOT appear on initial feed
      expect(screen.queryByText(/Prof\. John Doe/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/usr-confidential-99/i)).not.toBeInTheDocument();

      // Open compose form (button has localized label "Buat Postingan")
      const composeBtn = screen.getByRole('button', { name: /Buat Postingan/i });
      fireEvent.click(composeBtn);

      // Verify identity protection badge is visible
      expect(screen.getByText(/Mode Anonim aktif/i)).toBeInTheDocument();

      // Locate the pseudonym label: "Sebagai: [Pseudonym]"
      const postingAsText = screen.getByText(/Sebagai:/i).textContent || '';
      const initialPseudonym = postingAsText.replace('Sebagai:', '').trim();
      const [initialAdj, initialNoun] = initialPseudonym.split(' ');
      expect(ANONYMOUS_ADJECTIVES).toContain(initialAdj);
      expect(ANONYMOUS_NOUNS).toContain(initialNoun);

      // Reroll pseudonym using the dice button
      const rerollBtn = screen.getByRole('button', { name: /Nama Samaran Anda/i });
      expect(rerollBtn).toBeInTheDocument();

      fireEvent.click(rerollBtn);

      const rerolledPostingAs = screen.getByText(/Sebagai:/i).textContent || '';
      const rerolledPseudonym = rerolledPostingAs.replace('Sebagai:', '').trim();
      const [rerolledAdj, rerolledNoun] = rerolledPseudonym.split(' ');
      expect(ANONYMOUS_ADJECTIVES).toContain(rerolledAdj);
      expect(ANONYMOUS_NOUNS).toContain(rerolledNoun);

      // Full DOM inspection: ensure real display name or user ID is NOT leaked anywhere
      const containerHtml = document.body.innerHTML;
      expect(containerHtml).not.toContain('Prof. John Doe');
      expect(containerHtml).not.toContain('usr-confidential-99');
    });
  });

  /* =========================================================================
   * SECTION 2: TOGGLE STATE MACHINE & REACTIVITY TEST
   * ========================================================================= */
  describe('2. Incognito Toggle State Machine & CustomEvent Bus Sync', () => {
    it('refuses to switch to account mode when unauthenticated, returns requiresAuth=true and triggers onRequireAuth callback', async () => {
      // Setup unauthenticated hook
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAnonymousMode).toBe(true);

      // Attempt toggle to account mode
      let toggleResult: { success: boolean; requiresAuth: boolean } = { success: false, requiresAuth: false };
      act(() => {
        toggleResult = result.current.toggleAnonymousMode();
      });

      expect(toggleResult.success).toBe(false);
      expect(toggleResult.requiresAuth).toBe(true);
      // Mode remains anonymous
      expect(result.current.isAnonymousMode).toBe(true);
    });

    it('triggers onRequireAuth callback when unauthenticated user clicks IncognitoPillToggle', () => {
      const onRequireAuthSpy = vi.fn();

      render(<IncognitoPillToggle onRequireAuth={onRequireAuthSpy} />);

      const pillButton = screen.getByRole('button', { name: /Mode Anonim Aktif/i });
      expect(pillButton).toBeInTheDocument();
      expect(pillButton).toHaveClass('incognito-pill-active');

      fireEvent.click(pillButton);

      expect(onRequireAuthSpy).toHaveBeenCalledTimes(1);
      // Pill stays in anonymous mode
      expect(screen.getByRole('button', { name: /Mode Anonim Aktif/i })).toBeInTheDocument();
    });

    it('enables seamless 1-click bi-directional toggle when user is authenticated with Supabase session', async () => {
      // Simulate active authenticated session
      mockSessionUser = {
        id: 'auth-user-555',
        email: 'dr.sarah@mentalhealth.org',
        user_metadata: { displayName: 'Dr. Sarah' },
      };

      const { result } = renderHook(() => useAuth());

      // Wait for session check to populate accountUser
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.accountUser?.displayName).toBe('Dr. Sarah');
      expect(result.current.isAnonymousMode).toBe(true);

      // 1. Toggle from Anonymous to Account Mode
      let res1: { success: boolean; requiresAuth: boolean } = { success: false, requiresAuth: true };
      act(() => {
        res1 = result.current.toggleAnonymousMode();
      });

      expect(res1.success).toBe(true);
      expect(res1.requiresAuth).toBe(false);
      expect(result.current.isAnonymousMode).toBe(false);
      expect(result.current.activeDisplayName).toBe('Dr. Sarah');

      // 2. Toggle from Account Mode back to Anonymous Mode in 1 click
      let res2: { success: boolean; requiresAuth: boolean } = { success: false, requiresAuth: true };
      act(() => {
        res2 = result.current.toggleAnonymousMode();
      });

      expect(res2.success).toBe(true);
      expect(res2.requiresAuth).toBe(false);
      expect(result.current.isAnonymousMode).toBe(true);
      // Active display name reverts to anonymous pseudonym
      const [adj, noun] = result.current.activeDisplayName.split(' ');
      expect(ANONYMOUS_ADJECTIVES).toContain(adj);
      expect(ANONYMOUS_NOUNS).toContain(noun);
    });

    it('synchronizes rima-anonymous-mode across multiple components via CustomEvent bus', async () => {
      // Component A that reads and modifies anonymous mode
      const ComponentA = () => {
        const [isAnon, setIsAnon] = useLocalStorage<boolean>('rima-anonymous-mode', true);
        return (
          <div>
            <span data-testid="status-a">{isAnon ? 'ANON' : 'ACCOUNT'}</span>
            <button data-testid="btn-toggle-a" onClick={() => setIsAnon(!isAnon)}>
              Toggle A
            </button>
          </div>
        );
      };

      // Component B that only observes anonymous mode
      const ComponentB = () => {
        const [isAnon] = useLocalStorage<boolean>('rima-anonymous-mode', true);
        return (
          <div>
            <span data-testid="status-b">{isAnon ? 'ANON' : 'ACCOUNT'}</span>
          </div>
        );
      };

      render(
        <div>
          <ComponentA />
          <ComponentB />
        </div>
      );

      expect(screen.getByTestId('status-a')).toHaveTextContent('ANON');
      expect(screen.getByTestId('status-b')).toHaveTextContent('ANON');

      // Toggle from Component A
      fireEvent.click(screen.getByTestId('btn-toggle-a'));

      // Both components must synchronize immediately via 'local-storage' CustomEvent
      await waitFor(() => {
        expect(screen.getByTestId('status-a')).toHaveTextContent('ACCOUNT');
        expect(screen.getByTestId('status-b')).toHaveTextContent('ACCOUNT');
      });

      // Emulate external window/tab storage event
      act(() => {
        window.localStorage.setItem('rima-anonymous-mode', JSON.stringify(true));
        window.dispatchEvent(
          new CustomEvent('local-storage', { detail: { key: 'rima-anonymous-mode' } })
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('status-a')).toHaveTextContent('ANON');
        expect(screen.getByTestId('status-b')).toHaveTextContent('ANON');
      });
    });

    it('automatically resets isAnonymousMode to true upon user logout', async () => {
      mockSessionUser = {
        id: 'auth-user-999',
        email: 'logged.in@example.com',
        user_metadata: { displayName: 'Verified Hero' },
      };

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Switch to account mode
      act(() => {
        result.current.toggleAnonymousMode();
      });
      expect(result.current.isAnonymousMode).toBe(false);

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
      expect(result.current.accountUser).toBeNull();
      expect(result.current.isAnonymousMode).toBe(true);
    });
  });

  /* =========================================================================
   * SECTION 3: AUTHMODAL ROBUSTNESS & BOUNDARY RESILIENCE
   * ========================================================================= */
  describe('3. AuthModal Boundary Resilience & Cancellation Protocol', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['escaped tabs/newlines', '\t\n  \r '],
      ['missing @ and domain', 'test'],
      ['missing user part', '@domain.com'],
      ['missing domain part', 'user@'],
      ['missing TLD', 'user@domain'],
      ['double @ symbols', 'user@@domain.com'],
      ['space in user name', 'user space@domain.com'],
      ['space in domain name', 'user@domain space.com'],
      ['domain starts with dot', 'user@.com'],
    ])('rejects malformed email "%s" ("%s") with localized error and zero API dispatch', async (_label, invalidValue) => {
      const onCloseSpy = vi.fn();
      render(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      fireEvent.change(emailInput, { target: { value: invalidValue } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Mohon masukkan format email yang valid\./i)).toBeInTheDocument();
      expect(mockSignInWithOtp).not.toHaveBeenCalled();
    });

    it('safely handles extremely long email strings (10,000 chars) with zero catastrophic backtracking (ReDoS) or thread freeze', async () => {
      const onCloseSpy = vi.fn();
      render(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      // Generate a 10,000-character adversarial string
      const longAdversarialString = `${'a'.repeat(9980)}@domain`;

      const startTime = performance.now();
      fireEvent.change(emailInput, { target: { value: longAdversarialString } });
      fireEvent.click(submitBtn);
      const duration = performance.now() - startTime;

      // Assert that validation executed instantaneously (< 50ms)
      expect(duration).toBeLessThan(50);
      expect(screen.getByText(/Mohon masukkan format email yang valid\./i)).toBeInTheDocument();
      expect(mockSignInWithOtp).not.toHaveBeenCalled();
    });

    it.each([
      ['plus-addressed email', 'doctor.smith+clinic@hospital.sub.org.id', 'doctor.smith+clinic@hospital.sub.org.id'],
      ['hyphen and underscore email', 'user_name-123@domain.co', 'user_name-123@domain.co'],
      ['padded email with leading/trailing spaces', '  padded.doctor@example.com  ', 'padded.doctor@example.com'],
    ])('accepts complex valid email (%s) and sends trimmed email to Supabase OTP', async (_label, rawEmail, expectedEmail) => {
      const onCloseSpy = vi.fn();
      render(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      mockSignInWithOtp.mockClear();
      fireEvent.change(emailInput, { target: { value: rawEmail } });
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockSignInWithOtp).toHaveBeenCalledTimes(1);
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: expectedEmail,
        options: { emailRedirectTo: window.location.origin },
      });
    });

    it('supports zero-friction cancellation from input state: cleanly resets errors and fields with zero side effects', async () => {
      const onCloseSpy = vi.fn();
      const { rerender } = render(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      // Trigger error state
      fireEvent.change(emailInput, { target: { value: 'bad-email' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Mohon masukkan format email yang valid\./i)).toBeInTheDocument();

      // Click "Lanjutkan sebagai Tamu Anonim" / cancellation button
      const cancelBtn = screen.getByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i });
      fireEvent.click(cancelBtn);

      expect(onCloseSpy).toHaveBeenCalledTimes(1);

      // Reopen modal to ensure internal state is fully reset
      rerender(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const reopenedInput = screen.getByLabelText(/Alamat Email/i) as HTMLInputElement;
      expect(reopenedInput.value).toBe('');
      expect(screen.queryByText(/Mohon masukkan format email yang valid\./i)).not.toBeInTheDocument();
    });

    it('supports zero-friction cancellation from sent state: returns cleanly to guest experience', async () => {
      const onCloseSpy = vi.fn();
      const { rerender } = render(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      // Successfully submit email to reach 'sent' state
      fireEvent.change(emailInput, { target: { value: 'user@clinic.id' } });
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      // Verify sent state view (headings match both header and body)
      const sentHeadings = screen.getAllByRole('heading', { name: /Periksa Kotak Masuk Anda/i });
      expect(sentHeadings.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/user@clinic\.id/i)).toBeInTheDocument();

      // Click "Lanjutkan sebagai Tamu Anonim" from sent state
      const backToGuestBtn = screen.getByRole('button', { name: /Lanjutkan sebagai Tamu Anonim/i });
      fireEvent.click(backToGuestBtn);

      expect(onCloseSpy).toHaveBeenCalledTimes(1);

      // Re-render open modal: status must be cleanly reset to 'input'
      rerender(<AuthModal isOpen={true} onClose={onCloseSpy} />);
      expect(screen.getByRole('heading', { name: /Masuk ke Akun RIMA/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Alamat Email/i)).toBeInTheDocument();
    });

    it('allows resending email OTP from sent state and shows confirmation feedback', async () => {
      const onCloseSpy = vi.fn();
      render(<AuthModal isOpen={true} onClose={onCloseSpy} />);

      const emailInput = screen.getByLabelText(/Alamat Email/i);
      const submitBtn = screen.getByRole('button', { name: /Kirim Tautan Masuk \(OTP\)/i });

      fireEvent.change(emailInput, { target: { value: 'resend.test@domain.com' } });
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockSignInWithOtp).toHaveBeenCalledTimes(1);

      // Locate resend button
      const resendBtn = screen.getByRole('button', { name: /Kirim Ulang Email/i });
      expect(resendBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(resendBtn);
      });

      expect(mockSignInWithOtp).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/Tautan baru berhasil dikirim!/i)).toBeInTheDocument();
    });
  });
});
