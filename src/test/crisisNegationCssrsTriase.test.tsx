import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n/config';
import { detectCrisis, evaluateCssrsRiskTier } from '../services/crisisDetectionService';
import { processChatbotMessage } from '../services/chatbotEngine';
import { ChatbotDrawer } from '../components/chatbot/ChatbotDrawer';
import { Journal } from '../pages/Journal';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RIMA Crisis Interceptor, Negation Guard & C-SSRS Triase (P1 Step 2)', () => {
  beforeEach(async () => {
    localStorage.clear();
    mockNavigate.mockReset();
    await i18n.changeLanguage('id');
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. NEGATION GUARD & RECOVERY CONTEXT
  // ──────────────────────────────────────────────────────────────────────────

  describe('1. Zero-Trust Negation Guard & Recovery Expressions', () => {
    it('accurately identifies pure negation and recovery expressions as safe (Zero False Positive)', () => {
      const recoverySamples = [
        'aku sudah tidak ingin menyakiti diri lagi',
        'bukan mau bunuh diri, saya hanya lelah fisik',
        "I don't want to die anymore, feeling much better",
        'aku tidak ingin menyakiti diri lagi',
        'sudah sembuh dan tidak mau bundir lagi',
        'clean from self harm for over 3 months',
        'wis ora gelem bunuh diri maneh',
        'tos teu hayang nyiksa diri deui',
        'もう死にたくない、前を向いて生きていきます。',
        '我不想自杀了，感谢大家对我的支持和陪伴。',
        'ya no quiero morir, me siento mejor',
        'لا أريد الموت الحمد لله',
      ];

      for (const sample of recoverySamples) {
        const result = detectCrisis(sample);
        expect(
          result.isDetected,
          `Expected "${sample}" NOT to trigger crisis detection`
        ).toBe(false);
        expect(result.severity).toBe('none');
        expect(result.cssrsTier).toBe('none');
        expect(result.isRecovery).toBe(true);
      }
    });

    it('ensures Chatbot responds with warm positive reinforcement to recovery without emergency lockout', () => {
      const response = processChatbotMessage('aku sudah tidak ingin menyakiti diri lagi', 'id');

      expect(response.stage).toBe('RECOVERY_AFFIRMATION');
      expect(response.isEmergency).toBe(false);
      expect(response.text).toContain('Penguatan Pemulihan & Welas Asih Diri');
      expect(response.text).toContain('bersyukur');
      expect(response.actionRoute).toBe('/self-compassion');
    });

    it('ensures Journal saves recovery entry quietly without popping the crisis modal', () => {
      render(
        <MemoryRouter>
          <Journal />
        </MemoryRouter>
      );

      const freeReflectBtn = screen.getByText(/Tulis Bebas/i).closest('button');
      fireEvent.click(freeReflectBtn!);

      const titleInput = screen.getByPlaceholderText(/Judul jurnal/i);
      const contentTextarea = screen.getByPlaceholderText(/Mulai menulis/i);

      fireEvent.change(titleInput, { target: { value: 'Kemajuan Saya' } });
      fireEvent.change(contentTextarea, { target: { value: 'Hari ini saya sangat bersyukur, aku sudah tidak ingin menyakiti diri lagi.' } });

      const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
      fireEvent.click(saveBtn);

      expect(screen.queryByText(/Kami Memperhatikan/i)).toBeNull();
      expect(screen.getByText('Kemajuan Saya')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. COMPOUND CONTRAST SENTENCES & SENSITIVITY PRESERVATION
  // ──────────────────────────────────────────────────────────────────────────

  describe('2. Contrast Compound Sentences & 100% Active Crisis Sensitivity', () => {
    it('detects active crisis when past negation contrasts with present active intent', () => {
      const contrastSamples = [
        'Dulu aku bilang tidak mau bunuh diri, tapi malam ini aku ingin mengakhiri semuanya',
        'tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup',
        "I promised I wouldn't kill myself, but tonight I want to end it all",
        'kemarin sempat merasa membaik, namun malam ini saya mau mati saja',
        'tadinya sudah tenang, tapi sekarang aku pegang silet malam ini',
      ];

      for (const sample of contrastSamples) {
        const result = detectCrisis(sample);
        expect(
          result.isDetected,
          `Expected "${sample}" to trigger active crisis intervention`
        ).toBe(true);
        expect(['moderate', 'severe']).toContain(result.severity);
        expect(['tier2_active_no_plan', 'tier3_acute_imminent']).toContain(result.cssrsTier);
        expect(result.isRecovery).toBe(false);
      }
    });

    it('never suppresses inherent distress keywords that contain negation words ("tidak mau hidup lagi", "gamau hidup")', () => {
      const inherentDistressSamples = [
        'aku tidak mau hidup lagi',
        'rasanya capek banget dan gamau hidup',
        'sudah tidak ada harapan lagi dalam hidupku',
        'saya merasa tidak berguna dan hanya menjadi beban bagi semua',
      ];

      for (const sample of inherentDistressSamples) {
        const result = detectCrisis(sample);
        expect(result.isDetected, `Inherent distress "${sample}" must trigger`).toBe(true);
        expect(result.isRecovery).toBe(false);
      }
    });

    it('intercepts double negatives that conceal active suicidal ideation as active crisis', () => {
      const doubleNegSamples = [
        'bukan berarti aku tidak ingin bunuh diri',
        'tidak berarti aku tidak mau mati',
        "it's not that I don't want to die",
      ];

      for (const sample of doubleNegSamples) {
        const result = detectCrisis(sample);
        expect(result.isDetected, `Double negation "${sample}" must be detected as active crisis`).toBe(true);
        expect(result.isRecovery).toBe(false);
        expect(['tier2_active_no_plan', 'tier3_acute_imminent']).toContain(result.cssrsTier);
      }
    });

    it('resolves historical past crisis followed by recovery as safe recovery affirmation', () => {
      const pastRecoverySamples = [
        'dulu aku mau bunuh diri, tapi sekarang aku sudah pulih',
        "I used to want to kill myself, but now I'm clean and feeling better",
        'tahun lalu aku pernah mencoba bunuh diri, namun sekarang aku bersyukur masih hidup',
        'dulu aku sempat mau bunuh diri sekarang sudah tidak lagi',
      ];

      for (const sample of pastRecoverySamples) {
        const result = detectCrisis(sample);
        expect(result.isDetected, `Past crisis "${sample}" should not trigger emergency lockout`).toBe(false);
        expect(result.isRecovery).toBe(true);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. C-SSRS TIERED TRIAGE & EMERGENCY OVERRIDE
  // ──────────────────────────────────────────────────────────────────────────

  describe('3. C-SSRS Tiered Triage & De-escalation Protocol', () => {
    it('classifies passive hopelessness as Tier 1', () => {
      const res = evaluateCssrsRiskTier('Rasanya putus asa, tidak ada harapan dan lelah hidup');
      expect(res.isDetected).toBe(true);
      expect(res.tier).toBe('tier1_passive');
    });

    it('classifies active suicidal ideation without lethal method/timing as Tier 2', () => {
      const res = evaluateCssrsRiskTier('Saya ingin bunuh diri dan mengakhiri hidup');
      expect(res.isDetected).toBe(true);
      expect(res.tier).toBe('tier2_active_no_plan');
      expect(res.severity).toBe('severe');
    });

    it('classifies acute crisis with lethal means and temporal intent as Tier 3', () => {
      const res = evaluateCssrsRiskTier('Saya sudah siapkan obat tidur banyak untuk malam ini selamat tinggal');
      expect(res.isDetected).toBe(true);
      expect(res.tier).toBe('tier3_acute_imminent');
      expect(res.severity).toBe('severe');
    });

    it('halts open chatbot generative response and provides emergency de-escalation for active crisis', () => {
      const response = processChatbotMessage('Saya ingin bunuh diri sekarang', 'id');

      expect(response.stage).toBe('CRISIS_OVERRIDE');
      expect(response.isEmergency).toBe(true);
      expect(response.text).toContain('Bantuan Darurat & Keselamatan Segera');
      expect(response.text).toContain('119');
      expect(response.text).toContain('SEJIWA');
      expect(response.text).toContain('Stanley-Brown');
      expect(response.text).toContain('Somatik');
      expect(response.actionRoute).toBe('/professional-help');
    });

    it('triggers CRISIS_OVERRIDE for regional slang and relapse contrast crisis', () => {
      const slangResp = processChatbotMessage('aku wis wegah urip', 'jv');
      expect(slangResp.stage).toBe('CRISIS_OVERRIDE');
      expect(slangResp.isEmergency).toBe(true);

      const relapseResp = processChatbotMessage('Dulu aku sempat sembuh, tapi kemarin aku mau bunuh diri lagi', 'id');
      expect(relapseResp.stage).toBe('CRISIS_OVERRIDE');
      expect(relapseResp.isEmergency).toBe(true);
    });

    it('triggers CRISIS_OVERRIDE in Chatbot and crisis modal in Journal for obfuscated crisis expressions', () => {
      const leetChatbot = processChatbotMessage('aku mau bund1r', 'id');
      expect(leetChatbot.stage).toBe('CRISIS_OVERRIDE');
      expect(leetChatbot.isEmergency).toBe(true);

      const punctChatbot = processChatbotMessage('aku mau b.u.n.u.h d.i.r.i', 'id');
      expect(punctChatbot.stage).toBe('CRISIS_OVERRIDE');
      expect(punctChatbot.isEmergency).toBe(true);

      // Journal test with obfuscated crisis input
      render(
        <MemoryRouter>
          <Journal />
        </MemoryRouter>
      );

      const freeReflectBtn = screen.getByText(/Tulis Bebas/i).closest('button');
      fireEvent.click(freeReflectBtn!);

      const titleInput = screen.getByPlaceholderText(/Judul jurnal/i);
      const contentTextarea = screen.getByPlaceholderText(/Mulai menulis/i);

      fireEvent.change(titleInput, { target: { value: 'Curahan Tersembunyi' } });
      fireEvent.change(contentTextarea, { target: { value: 'Rasanya gelap sekali, aku mau b u n d 1 r malam ini' } });

      const saveBtn = screen.getByRole('button', { name: /^Simpan$/i });
      fireEvent.click(saveBtn);

      expect(screen.getByText(/Kami Memperhatikan/i)).toBeInTheDocument();
    });

    it('provides FastActionSafetyCard, 119 Ext 8, and grounding in ChatbotDrawer UI', async () => {
      vi.useFakeTimers();
      render(
        <MemoryRouter>
          <ChatbotDrawer isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText(/Ketik pertanyaan atau ceritakan perasaanmu/i);
      const sendBtn = screen.getByLabelText(/Kirim pesan/i);

      fireEvent.change(input, { target: { value: 'Saya ingin bunuh diri malam ini' } });
      fireEvent.click(sendBtn);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 1-click dialer link
      const call119 = screen.getByRole('link', { name: /SEJIWA 119 Ext 8/i });
      expect(call119).toHaveAttribute('href', 'tel:119,8');

      // Fast-Action Safety Card modal button
      const safetyCardBtn = screen.getByRole('button', { name: /Bantuan Cepat Darurat/i });
      expect(safetyCardBtn).toBeInTheDocument();

      fireEvent.click(safetyCardBtn);

      // FastActionSafetyCard dialog appears with proper aria and phone links
      expect(screen.getByRole('dialog', { name: /Kamu Tidak Sendirian/i })).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. LATENCY PERFORMANCE BENCHMARK (<5ms)
  // ──────────────────────────────────────────────────────────────────────────

  describe('4. Deterministic Latency Performance Benchmark (<5ms)', () => {
    it('processes inputs deterministically in strictly under 5 milliseconds', () => {
      const inputs = [
        'Dulu aku bilang tidak mau bunuh diri, tapi malam ini aku ingin mengakhiri semuanya',
        'aku sudah tidak ingin menyakiti diri lagi dan ingin menjalani hidup dengan tenang',
        'tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup',
        'aku pegang silet dan malam ini selamat tinggal semuanya',
        'Hari ini cuaca cerah dan saya merasa bersemangat menyelesaikan tugas kuliah.',
        'もう死にたくない、前を向いて生きていきます。',
        '我不想自杀了，感谢大家对我的支持和陪伴。',
      ];

      for (const text of inputs) {
        const start = performance.now();
        const res = detectCrisis(text);
        const duration = performance.now() - start;

        expect(res).toBeDefined();
        expect(
          duration,
          `Execution time (${duration.toFixed(3)}ms) must be strictly < 5ms`
        ).toBeLessThan(5);
      }
    });
  });
});
