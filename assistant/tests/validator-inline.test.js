/**
 * Tests for validator-inline.js - Linear Acceptance Criteria format
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  scoreStructure,
  scoreClarity,
  scoreTestability,
  scoreCompleteness,
  detectStructure,
  detectClarity,
  detectTestability,
  detectCompleteness
} from '../../shared/js/validator-inline.js';

describe('Inline Document Validator - Linear AC Format', () => {
  describe('validateDocument', () => {
    test('should return zero scores for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.structure.score).toBe(0);
      expect(result.clarity.score).toBe(0);
      expect(result.testability.score).toBe(0);
      expect(result.completeness.score).toBe(0);
    });

    test('should return low scores for short content', () => {
      const result = validateDocument('Too short');
      // Short content still gets testability points (25) since there's nothing vague to penalize
      // But structure, clarity, and completeness should be low
      expect(result.structure.score).toBeLessThan(15);
      expect(result.clarity.score).toBeLessThan(15);
      expect(result.completeness.score).toBeLessThan(15);
    });

    test('should return zero scores for null', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    test('should score a well-structured Linear AC', () => {
      const goodAC = `
## Summary
Implement user authentication flow for the mobile app.

## Acceptance Criteria
- [ ] Display login form with email and password fields
- [ ] Validate email format on blur (show error within 100ms)
- [ ] Show loading spinner during authentication (≤2s timeout)
- [ ] Navigate to dashboard on successful login
- [ ] Display error message for invalid credentials

## Out of Scope
- Password reset functionality
- Social login (Google, Apple)
- Biometric authentication
      `;
      const result = validateDocument(goodAC);
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.structure.score).toBeGreaterThan(15);
      expect(result.clarity.score).toBeGreaterThan(10);
    });

    test('should penalize vague language in testability', () => {
      const vagueAC = `
## Summary
Build a user-friendly login page.

## Acceptance Criteria
- [ ] Page works correctly on all devices
- [ ] Handle login properly with appropriate feedback
- [ ] Make it intuitive and seamless for users
- [ ] Ensure fast performance
- [ ] Provide good error handling

## Out of Scope
- None
      `;
      const result = validateDocument(vagueAC);
      // Testability should flag vague terms
      expect(result.testability.issues.some(i =>
        i.includes('vague') || i.includes('works correctly') || i.includes('properly')
      )).toBe(true);
    });

    test('should reward measurable metrics', () => {
      const measurableAC = `
## Summary
Optimize API response times for the search endpoint.

## Acceptance Criteria
- [ ] Implement caching to reduce response time to ≤200ms
- [ ] Handle up to 1000 concurrent requests
- [ ] Return results within 500ms for 95% of queries
- [ ] Limit maximum payload size to 5MB
- [ ] Display error message for timeout after 10 seconds

## Out of Scope
- Full-text search implementation
      `;
      const result = validateDocument(measurableAC);
      expect(result.clarity.score).toBeGreaterThan(10);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for scores >= 70', () => {
      expect(getScoreColor(70)).toBe('green');
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(100)).toBe('green');
    });

    test('should return yellow for scores 50-69', () => {
      expect(getScoreColor(50)).toBe('yellow');
      expect(getScoreColor(65)).toBe('yellow');
    });

    test('should return orange for scores 30-49', () => {
      expect(getScoreColor(30)).toBe('orange');
      expect(getScoreColor(45)).toBe('orange');
    });

    test('should return red for scores < 30', () => {
      expect(getScoreColor(0)).toBe('red');
      expect(getScoreColor(29)).toBe('red');
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
// Scoring Function Tests - Linear AC Format
// ============================================================================

describe('Scoring Functions', () => {
  describe('scoreStructure', () => {
    test('should return maxScore of 25', () => {
      const result = scoreStructure('## Summary\nTest');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for properly structured Linear AC', () => {
      const content = `
## Summary
Implement user login.

## Acceptance Criteria
- [ ] Display login form
- [ ] Validate email format
- [ ] Show error messages

## Out of Scope
- Password reset
      `;
      const result = scoreStructure(content);
      expect(result.score).toBeGreaterThan(15);
    });
  });

  describe('scoreClarity', () => {
    test('should return maxScore of 30', () => {
      const result = scoreClarity('Clear requirements');
      expect(result.maxScore).toBe(30);
    });

    test('should score higher for action verbs and metrics', () => {
      const content = `
- [ ] Implement form validation within 100ms
- [ ] Display error message to user
- [ ] Handle up to 1000 requests per second
- [ ] Build caching layer for responses
      `;
      const result = scoreClarity(content);
      expect(result.score).toBeGreaterThan(10);
    });
  });

  describe('scoreTestability', () => {
    test('should return maxScore of 25', () => {
      const result = scoreTestability('Specific criteria');
      expect(result.maxScore).toBe(25);
    });

    test('should score lower for vague language', () => {
      const vagueContent = `
- [ ] System works correctly
- [ ] Handle errors properly
- [ ] Make it intuitive and user-friendly
      `;
      const result = scoreTestability(vagueContent);
      expect(result.score).toBeLessThan(15);
      expect(result.issues.some(i => i.includes('vague'))).toBe(true);
    });

    test('should score full for specific language', () => {
      const specificContent = `
- [ ] Return HTTP 200 on success
- [ ] Display validation message in red
- [ ] Complete request within 500ms
      `;
      const result = scoreTestability(specificContent);
      expect(result.score).toBe(25);
    });
  });

  describe('scoreCompleteness', () => {
    test('should return maxScore of 20', () => {
      const result = scoreCompleteness('Complete plan');
      expect(result.maxScore).toBe(20);
    });

    test('should score for edge cases and error handling', () => {
      const content = `
## Summary
Handle file uploads.

## Acceptance Criteria
- [ ] Display error for invalid file type
- [ ] Handle empty file gracefully
- [ ] Show timeout message after 30 seconds
- [ ] Validate file size limit

## Out of Scope
- None
      `;
      const result = scoreCompleteness(content);
      expect(result.score).toBeGreaterThan(10);
    });
  });
});

// ============================================================================
// Detection Function Tests - Linear AC Format
// ============================================================================

describe('Detection Functions', () => {
  describe('detectStructure', () => {
    test('should detect summary section', () => {
      const content = '## Summary\nThis is an overview.';
      const result = detectStructure(content);
      expect(result.hasSummary).toBe(true);
    });

    test('should detect checkbox criteria', () => {
      const content = '- [ ] First criterion\n- [x] Completed criterion';
      const result = detectStructure(content);
      expect(result.hasCheckboxes).toBe(true);
      expect(result.checkboxCount).toBe(2);
    });

    test('should detect out of scope section', () => {
      const content = '## Out of Scope\n- Password reset';
      const result = detectStructure(content);
      expect(result.hasOutOfScope).toBe(true);
    });
  });

  describe('detectClarity', () => {
    test('should detect action verbs', () => {
      const content = 'Implement the solution, validate the input, display results.';
      const result = detectClarity(content);
      expect(result.hasActionVerbs).toBe(true);
      expect(result.actionVerbCount).toBeGreaterThan(0);
    });

    test('should detect measurable metrics', () => {
      const content = 'Complete within 200ms, handle 1000 users, limit to 5MB.';
      const result = detectClarity(content);
      expect(result.hasMetrics).toBe(true);
      expect(result.metricsCount).toBeGreaterThan(0);
    });
  });

  describe('detectTestability', () => {
    test('should detect vague terms', () => {
      const content = 'The system works correctly and handles properly.';
      const result = detectTestability(content);
      expect(result.vagueTermCount).toBeGreaterThan(0);
      expect(result.vagueTerms).toContain('works correctly');
    });

    test('should detect user story anti-pattern', () => {
      const content = 'As a user, I want to login so that I can access my account.';
      const result = detectTestability(content);
      expect(result.hasUserStory).toBe(true);
    });

    test('should detect Gherkin anti-pattern', () => {
      const content = 'Given the user is on the login page, When they enter credentials, Then they should see the dashboard.';
      const result = detectTestability(content);
      expect(result.hasGherkin).toBe(true);
    });
  });

  describe('detectCompleteness', () => {
    test('should detect error cases', () => {
      const content = 'Handle invalid input error, show timeout message, deny unauthorized access.';
      const result = detectCompleteness(content);
      expect(result.hasErrorCases).toBe(true);
    });

    test('should detect edge cases', () => {
      const content = 'Handle empty state, limit maximum items, support zero results.';
      const result = detectCompleteness(content);
      expect(result.hasEdgeCases).toBe(true);
    });

    test('should count checkbox criteria', () => {
      const content = '- [ ] First\n- [ ] Second\n- [ ] Third';
      const result = detectCompleteness(content);
      expect(result.criterionCount).toBe(3);
    });
  });
});
