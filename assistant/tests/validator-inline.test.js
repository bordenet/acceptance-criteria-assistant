/**
 * Tests for Acceptance Criteria Validator - Integration tests for assistant
 *
 * Note: Comprehensive validator tests are in validator/tests/validator.test.js
 * These tests verify that the assistant correctly imports from the canonical validator.
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  // Detection functions
  detectStructure,
  detectClarity,
  detectTestability,
  detectCompleteness,
  detectSections
} from '../../validator/js/validator.js';

describe('Acceptance Criteria Validator Integration', () => {
  describe('validateDocument', () => {
    test('should return totalScore for valid content', () => {
      const result = validateDocument(`## Summary
Implement user login.

## Acceptance Criteria
- [ ] Display login form
- [ ] Validate email format
`);
      expect(result.totalScore).toBeDefined();
      expect(typeof result.totalScore).toBe('number');
    });

    test('should return zero for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
    });

    test('should return zero for null content', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });
  });

  describe('getScoreColor', () => {
    test('should return Tailwind color class for high scores', () => {
      expect(getScoreColor(80)).toMatch(/text-/);
    });

    test('should return Tailwind color class for low scores', () => {
      expect(getScoreColor(20)).toMatch(/text-/);
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for scores >= 80', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(100)).toBe('Excellent');
    });

    test('should return Ready for scores 70-79', () => {
      expect(getScoreLabel(70)).toBe('Ready');
      expect(getScoreLabel(79)).toBe('Ready');
    });

    test('should return Needs Work for scores 50-69', () => {
      expect(getScoreLabel(50)).toBe('Needs Work');
      expect(getScoreLabel(69)).toBe('Needs Work');
    });

    test('should return Draft for scores 30-49', () => {
      expect(getScoreLabel(30)).toBe('Draft');
      expect(getScoreLabel(49)).toBe('Draft');
    });

    test('should return Incomplete for scores < 30', () => {
      expect(getScoreLabel(0)).toBe('Incomplete');
      expect(getScoreLabel(29)).toBe('Incomplete');
    });
  });
});

// ============================================================================
// Detection Functions Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectStructure', () => {
    test('should detect checkboxes', () => {
      const result = detectStructure('- [ ] User can login\n- [ ] User can logout');
      expect(result.hasCheckboxes).toBe(true);
      expect(result.checkboxCount).toBe(2);
    });

    test('should detect summary section', () => {
      const result = detectStructure('## Summary\nImplement login feature.');
      expect(result.hasSummary).toBe(true);
    });
  });

  describe('detectClarity', () => {
    test('should detect clear criteria', () => {
      const result = detectClarity('User can submit form with valid email');
      expect(result).toBeDefined();
    });
  });

  describe('detectTestability', () => {
    test('should detect testable criteria', () => {
      const result = detectTestability('Given user is logged in, when they click submit, then form is saved');
      expect(result).toBeDefined();
    });
  });

  describe('detectCompleteness', () => {
    test('should detect complete criteria', () => {
      const result = detectCompleteness('## Summary\nImplement login.\n## Acceptance Criteria\n- [ ] Display form');
      expect(result).toBeDefined();
    });
  });

  describe('detectSections', () => {
    test('should detect sections in content', () => {
      const result = detectSections('## Summary\nTest\n## Acceptance Criteria\nTest');
      expect(result).toBeDefined();
    });
  });
});
