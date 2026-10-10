import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  evaluateCssrs,
  saveCssrsResult,
  getCssrsHistory,
  getLatestCssrsResult,
  CSSRS_STORAGE_KEY,
  CSSRS_QUESTIONS,
} from '../cssrsService';
import type { CssrsAnswers } from '../../types';

describe('cssrsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('CSSRS_QUESTIONS', () => {
    it('defines 7 question items including conditional questions', () => {
      expect(CSSRS_QUESTIONS).toHaveLength(7);
      expect(CSSRS_QUESTIONS.map(q => q.id)).toEqual([
        'q1',
        'q2',
        'q3',
        'q4',
        'q5',
        'q6',
        'q6Recent',
      ]);
      expect(CSSRS_QUESTIONS.find(q => q.id === 'q3')?.isConditional).toBe(true);
      expect(CSSRS_QUESTIONS.find(q => q.id === 'q4')?.isConditional).toBe(true);
      expect(CSSRS_QUESTIONS.find(q => q.id === 'q5')?.isConditional).toBe(true);
      expect(CSSRS_QUESTIONS.find(q => q.id === 'q6Recent')?.isConditional).toBe(true);
    });
  });

  describe('evaluateCssrs triage logic', () => {
    it('returns "none" risk level when all questions are false', () => {
      const answers: CssrsAnswers = {
        q1: false,
        q2: false,
        q6: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('none');
      expect(res.actionRecommendation).toBe('stable');
    });

    it('returns "low" risk level when q1 is true but q2 and q6 are false (passive ideation only)', () => {
      const answers: CssrsAnswers = {
        q1: true,
        q2: false,
        q6: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('low');
      expect(res.actionRecommendation).toBe('coping_and_safety_plan');
    });

    it('returns "moderate" risk level when q2 is true without intent, plan, or recent behavior', () => {
      const answers: CssrsAnswers = {
        q1: true,
        q2: true,
        q3: false,
        q4: false,
        q5: false,
        q6: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('moderate');
      expect(res.actionRecommendation).toBe('urgent_hotline_support');
    });

    it('returns "moderate" risk level when q3 is true (methods without intent)', () => {
      const answers: CssrsAnswers = {
        q1: true,
        q2: true,
        q3: true,
        q4: false,
        q5: false,
        q6: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('moderate');
      expect(res.actionRecommendation).toBe('urgent_hotline_support');
    });

    it('returns "moderate" risk level when q6 is true but q6Recent is false (past behavior > 3 months)', () => {
      const answers: CssrsAnswers = {
        q1: false,
        q2: false,
        q6: true,
        q6Recent: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('moderate');
      expect(res.actionRecommendation).toBe('urgent_hotline_support');
    });

    it('returns "high" risk level when q4 is true (intent without plan)', () => {
      const answers: CssrsAnswers = {
        q1: true,
        q2: true,
        q3: true,
        q4: true,
        q5: false,
        q6: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('high');
      expect(res.actionRecommendation).toBe('imminent_emergency_intervention');
    });

    it('returns "high" risk level when q5 is true (intent with specific plan)', () => {
      const answers: CssrsAnswers = {
        q1: true,
        q2: true,
        q3: true,
        q4: true,
        q5: true,
        q6: false,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('high');
      expect(res.actionRecommendation).toBe('imminent_emergency_intervention');
    });

    it('returns "high" risk level when q6 and q6Recent are true (behavior in past 3 months)', () => {
      const answers: CssrsAnswers = {
        q1: false,
        q2: false,
        q6: true,
        q6Recent: true,
      };
      const res = evaluateCssrs(answers);
      expect(res.riskLevel).toBe('high');
      expect(res.actionRecommendation).toBe('imminent_emergency_intervention');
    });
  });

  describe('persistence functions', () => {
    it('saves C-SSRS evaluation and retrieves history in descending order', () => {
      const answers: CssrsAnswers = { q1: true, q2: false, q6: false };
      const evaluation = evaluateCssrs(answers);

      const saved = saveCssrsResult({
        answers,
        evaluation,
        source: 'phq9_item9',
      });

      expect(saved.id).toMatch(/^cssrs-/);
      expect(saved.createdAt).toBeDefined();

      const history = getCssrsHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(saved.id);
      expect(history[0].source).toBe('phq9_item9');

      const latest = getLatestCssrsResult();
      expect(latest?.id).toBe(saved.id);
    });

    it('handles localStorage errors gracefully and recovers from non-array corrupted storage', () => {
      localStorage.setItem(CSSRS_STORAGE_KEY, 'invalid-json');
      expect(getCssrsHistory()).toEqual([]);
      expect(getLatestCssrsResult()).toBeNull();

      localStorage.setItem(CSSRS_STORAGE_KEY, JSON.stringify({ notAnArray: true }));
      expect(getCssrsHistory()).toEqual([]);

      const listener = vi.fn();
      window.addEventListener('local-storage', listener);

      const saved = saveCssrsResult({
        answers: { q1: false, q2: false, q6: false },
        evaluation: evaluateCssrs({ q1: false, q2: false, q6: false }),
        source: 'manual',
      });

      expect(saved.id).toBeDefined();
      expect(listener).toHaveBeenCalled();
      window.removeEventListener('local-storage', listener);
    });
  });
});
