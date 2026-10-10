import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluatePHQ9,
  evaluateGAD7,
  evaluateWHO5,
  saveAssessmentResult,
  getAssessmentHistory,
} from '../assessmentService';
import type { AssessmentResult } from '../../types';

describe('Assessment Service (PHQ-9, GAD-7 & WHO-5)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('PHQ-9 Scoring & Evaluation', () => {
    it('evaluates minimal depression correctly (score 0-4)', () => {
      const answers = { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
      const { score, eval: res } = evaluatePHQ9(answers);
      expect(score).toBe(2);
      expect(res.severity).toBe('minimal');
      expect(res.isCrisisTriggered).toBe(false);
    });

    it('evaluates mild depression correctly (score 5-9)', () => {
      const answers = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0 };
      const { score, eval: res } = evaluatePHQ9(answers);
      expect(score).toBe(6);
      expect(res.severity).toBe('mild');
      expect(res.isCrisisTriggered).toBe(false);
    });

    it('evaluates moderate depression correctly (score 10-14)', () => {
      const answers = { 1: 2, 2: 2, 3: 1, 4: 2, 5: 1, 6: 2, 7: 1, 8: 1, 9: 0 };
      const { score, eval: res } = evaluatePHQ9(answers);
      expect(score).toBe(12);
      expect(res.severity).toBe('moderate');
      expect(res.isCrisisTriggered).toBe(false);
    });

    it('evaluates moderately severe depression correctly (score 15-19)', () => {
      const answers = { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 0 };
      const { score, eval: res } = evaluatePHQ9(answers);
      expect(score).toBe(16);
      expect(res.severity).toBe('moderately_severe');
      expect(res.isCrisisTriggered).toBe(false);
    });

    it('evaluates severe depression correctly (score >= 20)', () => {
      const answers = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 2, 8: 2, 9: 0 };
      const { score, eval: res } = evaluatePHQ9(answers);
      expect(score).toBe(20);
      expect(res.severity).toBe('severe');
    });

    it('triggers crisis safety protocol when Item 9 is >= 1 regardless of total score', () => {
      // Total score is low (only 1), but Item 9 has score 1
      const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1 };
      const { score, eval: res } = evaluatePHQ9(answers);
      expect(score).toBe(1);
      expect(res.severity).toBe('minimal');
      expect(res.isCrisisTriggered).toBe(true); // Must trigger safety interceptor!
    });
  });

  describe('GAD-7 Scoring & Evaluation', () => {
    it('evaluates minimal anxiety correctly (score 0-4)', () => {
      const answers = { 1: 0, 2: 1, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0 };
      const { score, eval: res } = evaluateGAD7(answers);
      expect(score).toBe(2);
      expect(res.severity).toBe('minimal');
    });

    it('evaluates mild anxiety correctly (score 5-9)', () => {
      const answers = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 };
      const { score, eval: res } = evaluateGAD7(answers);
      expect(score).toBe(7);
      expect(res.severity).toBe('mild');
    });

    it('evaluates moderate anxiety correctly (score 10-14)', () => {
      const answers = { 1: 2, 2: 2, 3: 2, 4: 1, 5: 2, 6: 1, 7: 1 };
      const { score, eval: res } = evaluateGAD7(answers);
      expect(score).toBe(11);
      expect(res.severity).toBe('moderate');
    });

    it('evaluates severe anxiety correctly (score >= 15)', () => {
      const answers = { 1: 3, 2: 3, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2 };
      const { score, eval: res } = evaluateGAD7(answers);
      expect(score).toBe(16);
      expect(res.severity).toBe('severe');
    });
  });

  describe('WHO-5 Scoring & Evaluation', () => {
    it('evaluates high/optimal well-being correctly (percentage >= 70%)', () => {
      const answers = { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 }; // raw: 20, pct: 80%
      const { score, percentageScore, eval: res } = evaluateWHO5(answers);
      expect(score).toBe(20);
      expect(percentageScore).toBe(80);
      expect(res.severity).toBe('minimal');
      expect(res.suggestPhq9).toBe(false);
    });

    it('evaluates moderate well-being correctly (percentage 50-69%)', () => {
      const answers = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 }; // raw: 15, pct: 60%
      const { score, percentageScore, eval: res } = evaluateWHO5(answers);
      expect(score).toBe(15);
      expect(percentageScore).toBe(60);
      expect(res.severity).toBe('mild');
      expect(res.suggestPhq9).toBe(false);
    });

    it('evaluates low well-being correctly and triggers gentle PHQ-9 suggestion (percentage 29-49%)', () => {
      const answers = { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 }; // raw: 10, pct: 40%
      const { score, percentageScore, eval: res } = evaluateWHO5(answers);
      expect(score).toBe(10);
      expect(percentageScore).toBe(40);
      expect(res.severity).toBe('moderate');
      expect(res.suggestPhq9).toBe(true);
    });

    it('evaluates very low well-being correctly (percentage <= 28%)', () => {
      const answers = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 }; // raw: 5, pct: 20%
      const { score, percentageScore, eval: res } = evaluateWHO5(answers);
      expect(score).toBe(5);
      expect(percentageScore).toBe(20);
      expect(res.severity).toBe('severe');
      expect(res.suggestPhq9).toBe(true);
    });
  });

  describe('Local Storage Persistence', () => {
    it('saves assessment result and reads back history', () => {
      const dummy: AssessmentResult = {
        id: 'test-1',
        type: 'phq9',
        score: 12,
        maxScore: 27,
        severity: 'moderate',
        answers: { 1: 2, 2: 2 },
        createdAt: new Date().toISOString(),
      };

      saveAssessmentResult(dummy);
      const history = getAssessmentHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('test-1');
      expect(history[0].score).toBe(12);
    });

    it('recovers safely when localStorage contains malformed non-array data', () => {
      localStorage.setItem('rima-assessments', JSON.stringify({ corrupted: 'not-array' }));
      expect(getAssessmentHistory()).toEqual([]);

      const dummy: AssessmentResult = {
        id: 'test-2',
        type: 'gad7',
        score: 8,
        maxScore: 21,
        severity: 'mild',
        answers: { 1: 1 },
        createdAt: new Date().toISOString(),
      };

      expect(() => saveAssessmentResult(dummy)).not.toThrow();
      expect(getAssessmentHistory().length).toBe(1);
    });
  });
});
