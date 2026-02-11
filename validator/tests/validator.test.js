/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import {
  validateDocument,
  getGrade,
  getScoreColor,
  detectStructure,
  detectClarity,
  detectTestability,
  detectCompleteness,
  detectSections,
  scoreStructure,
  scoreClarity,
  scoreTestability,
  scoreCompleteness
} from '../js/validator.js';

describe('validateDocument', () => {
  it('should return totalScore property', () => {
    const result = validateDocument('Hello world');
    expect(result).toHaveProperty('totalScore');
    expect(typeof result.totalScore).toBe('number');
  });

  it('should return all four dimension scores', () => {
    const result = validateDocument('Some test content');
    expect(result).toHaveProperty('structure');
    expect(result).toHaveProperty('clarity');
    expect(result).toHaveProperty('testability');
    expect(result).toHaveProperty('completeness');

    // Each dimension should have score, maxScore, issues, strengths
    expect(result.structure).toHaveProperty('score');
    expect(result.structure).toHaveProperty('maxScore');
    expect(result.structure).toHaveProperty('issues');
    expect(result.structure).toHaveProperty('strengths');

    // Also verify dimension mappings for app.js compatibility
    expect(result).toHaveProperty('dimension1');
    expect(result).toHaveProperty('dimension2');
    expect(result).toHaveProperty('dimension3');
    expect(result).toHaveProperty('dimension4');
  });

  it('should return low total score for minimal content', () => {
    const result = validateDocument('Hello world');
    expect(result.totalScore).toBeLessThan(50);
  });

  it('should handle empty input', () => {
    const result = validateDocument('');
    expect(result.totalScore).toBe(0);
    expect(result.structure.issues).toContain('No content to validate');
  });

  it('should handle null input', () => {
    const result = validateDocument(null);
    expect(result.totalScore).toBe(0);
  });

  it('should return score that sums dimensions', () => {
    const result = validateDocument('# Section 1\n\nSome quality content here.');
    const sumOfDimensions =
      result.structure.score +
      result.clarity.score +
      result.testability.score +
      result.completeness.score;
    // Note: totalScore may be less than sum due to slop deduction
    expect(result.totalScore).toBeLessThanOrEqual(sumOfDimensions);
  });

  it('should cap total score at 100', () => {
    // Create a document with lots of content
    const maxDoc = `# Section 1

This is a comprehensive document with multiple sections.

## Section 2

More detailed content with quality indicators.

## Section 3

Additional quality and metric measures.

## Section 4

Final section with more keywords and content.
`.repeat(3);

    const result = validateDocument(maxDoc);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});

describe('getGrade', () => {
  it('should return A for scores >= 90', () => {
    expect(getGrade(90)).toBe('A');
    expect(getGrade(95)).toBe('A');
    expect(getGrade(100)).toBe('A');
  });

  it('should return B for scores 80-89', () => {
    expect(getGrade(80)).toBe('B');
    expect(getGrade(85)).toBe('B');
    expect(getGrade(89)).toBe('B');
  });

  it('should return C for scores 70-79', () => {
    expect(getGrade(70)).toBe('C');
    expect(getGrade(75)).toBe('C');
  });

  it('should return D for scores 60-69', () => {
    expect(getGrade(60)).toBe('D');
    expect(getGrade(65)).toBe('D');
  });

  it('should return F for scores < 60', () => {
    expect(getGrade(59)).toBe('F');
    expect(getGrade(30)).toBe('F');
    expect(getGrade(0)).toBe('F');
  });
});

describe('getScoreColor', () => {
  it('should return green for high scores', () => {
    expect(getScoreColor(80)).toBe('text-green-400');
    expect(getScoreColor(100)).toBe('text-green-400');
  });

  it('should return yellow for medium scores', () => {
    expect(getScoreColor(60)).toBe('text-yellow-400');
    expect(getScoreColor(79)).toBe('text-yellow-400');
  });

  it('should return orange for low-medium scores', () => {
    expect(getScoreColor(40)).toBe('text-orange-400');
    expect(getScoreColor(59)).toBe('text-orange-400');
  });

  it('should return red for low scores', () => {
    expect(getScoreColor(0)).toBe('text-red-400');
    expect(getScoreColor(39)).toBe('text-red-400');
  });
});

describe('detectStructure', () => {
  it('should detect summary section', () => {
    const result = detectStructure('# Summary\n\nThis is a summary.');
    expect(result.hasSummary).toBe(true);
  });

  it('should detect checkbox criteria', () => {
    const result = detectStructure('- [ ] First criterion\n- [x] Second criterion');
    expect(result.checkboxCount).toBe(2);
  });

  it('should detect out of scope section', () => {
    const result = detectStructure('# Out of Scope\n\n- Not doing this');
    expect(result.hasOutOfScope).toBe(true);
  });
});

describe('detectClarity', () => {
  it('should detect action verbs', () => {
    const result = detectClarity('Implement the feature. Create a button. Display the result.');
    expect(result.actionVerbCount).toBeGreaterThanOrEqual(3);
  });

  it('should detect measurable metrics', () => {
    const result = detectClarity('Response time under 200ms. Load at least 100 items.');
    expect(result.metricsCount).toBeGreaterThanOrEqual(2);
  });
});

describe('detectTestability', () => {
  it('should detect vague terms', () => {
    const result = detectTestability('The system should work correctly and handle properly.');
    expect(result.vagueTermCount).toBeGreaterThan(0);
    expect(result.hasIssues).toBe(true);
  });

  it('should detect user story anti-pattern', () => {
    const result = detectTestability('As a user, I want to login so that I can access my account.');
    expect(result.hasUserStoryAntiPattern).toBe(true);
  });

  it('should detect Gherkin anti-pattern', () => {
    const result = detectTestability('Given I am on the login page\nWhen I enter credentials\nThen I should be logged in');
    expect(result.hasGherkinAntiPattern).toBe(true);
  });

  it('should detect compound criteria with or', () => {
    const result = detectTestability('- [ ] User can login or register');
    expect(result.hasCompoundCriteria).toBe(true);
  });

  it('should detect compound criteria with multiple ands', () => {
    const result = detectTestability('- [ ] User can login and view dashboard and update profile');
    expect(result.hasCompoundCriteria).toBe(true);
  });

  it('should return clean for good criteria', () => {
    const result = detectTestability('- [ ] Display login button\n- [ ] Validate email format');
    expect(result.hasIssues).toBe(false);
  });
});

describe('detectCompleteness', () => {
  it('should count criteria', () => {
    const result = detectCompleteness('- [ ] First\n- [ ] Second\n- [ ] Third');
    expect(result.criterionCount).toBe(3);
  });

  it('should detect error cases', () => {
    const result = detectCompleteness('Handle error when network fails. Show error message.');
    expect(result.hasErrorCases).toBe(true);
  });

  it('should detect edge cases', () => {
    const result = detectCompleteness('Handle edge case when list is empty.');
    expect(result.hasEdgeCases).toBe(true);
  });
});

describe('detectSections', () => {
  it('should find all required sections', () => {
    const doc = '# Summary\n\nSummary text\n\n# Acceptance Criteria\n\n- [ ] Criterion\n\n# Out of Scope\n\n- Not this';
    const result = detectSections(doc);
    expect(result.found.length).toBe(3);
    expect(result.missing.length).toBe(0);
  });

  it('should report missing sections', () => {
    const result = detectSections('Just some text without sections');
    expect(result.missing.length).toBe(3);
  });
});

describe('detectSections - Plain Text Heading Detection', () => {
  // Tests for ^(#+\s*)? regex pattern that allows plain text headings (Word/Google Docs imports)

  test('detects Summary section without markdown prefix', () => {
    const text = 'Summary\nThis feature allows users to do X.';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Summary')).toBe(true);
  });

  test('detects Acceptance Criteria section without markdown prefix', () => {
    const text = 'Acceptance Criteria\n- [ ] User can click button\n- [ ] System responds within 2s';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Acceptance Criteria')).toBe(true);
  });

  test('detects Out of Scope section without markdown prefix', () => {
    const text = 'Out of Scope\n- Mobile app support\n- Admin dashboard';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Out of Scope')).toBe(true);
  });

  test('handles mixed markdown and plain text headings', () => {
    const text = '# Summary\nBrief description.\n\nAcceptance Criteria\n- [ ] Test case';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Summary')).toBe(true);
    expect(result.found.some((s) => s.name === 'Acceptance Criteria')).toBe(true);
  });

  test('handles Word/Google Docs pasted content without markdown', () => {
    const text = `Summary
This feature enables users to schedule appointments.

Acceptance Criteria
- [ ] User can select a date
- [ ] User can select a time slot
- [ ] System sends confirmation email

Out of Scope
- Recurring appointments
- Calendar integration`;
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Summary')).toBe(true);
    expect(result.found.some((s) => s.name === 'Acceptance Criteria')).toBe(true);
    expect(result.found.some((s) => s.name === 'Out of Scope')).toBe(true);
  });
});

describe('scoreStructure', () => {
  it('should give full points for complete structure', () => {
    const doc = '# Summary\n\nSummary text\n\n- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] Criterion 3\n\n# Out of Scope\n\n- Not this';
    const result = scoreStructure(doc);
    expect(result.score).toBe(25);
    expect(result.issues.length).toBe(0);
  });

  it('should deduct for missing summary', () => {
    const doc = '- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] Criterion 3\n\n# Out of Scope\n\n- Not this';
    const result = scoreStructure(doc);
    expect(result.score).toBeLessThan(25);
    expect(result.issues.some(i => i.includes('Summary'))).toBe(true);
  });

  it('should give partial points for 1-2 checkboxes', () => {
    const doc = '# Summary\n\nText\n\n- [ ] Only one criterion';
    const result = scoreStructure(doc);
    expect(result.score).toBe(15); // 10 for summary + 5 for partial checkboxes
  });

  it('should deduct for missing checkboxes', () => {
    const doc = '# Summary\n\nText without any checkboxes';
    const result = scoreStructure(doc);
    expect(result.issues.some(i => i.includes('checkbox'))).toBe(true);
  });
});

describe('scoreClarity', () => {
  it('should give full points for clear criteria', () => {
    const doc = 'Implement login. Create button. Display result. Validate input. Handle errors. Response under 200ms. Load 100 items. Process 50 requests.';
    const result = scoreClarity(doc);
    expect(result.score).toBe(30);
  });

  it('should give partial points for some action verbs', () => {
    const doc = 'Implement login. Create button. Display result.';
    const result = scoreClarity(doc);
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThan(30);
  });

  it('should give partial points for some metrics', () => {
    const doc = 'Response under 200ms.';
    const result = scoreClarity(doc);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should deduct for no action verbs', () => {
    const doc = 'The system should be good.';
    const result = scoreClarity(doc);
    expect(result.issues.some(i => i.includes('action verbs'))).toBe(true);
  });

  it('should deduct for no metrics', () => {
    const doc = 'Implement login feature.';
    const result = scoreClarity(doc);
    expect(result.issues.some(i => i.includes('metric'))).toBe(true);
  });
});

describe('scoreTestability', () => {
  it('should give full points for testable criteria', () => {
    const doc = '- [ ] Display login button\n- [ ] Validate email format';
    const result = scoreTestability(doc);
    expect(result.score).toBe(25);
    expect(result.strengths.some(s => s.includes('binary verifiable'))).toBe(true);
  });

  it('should deduct for vague terms', () => {
    const doc = 'The system should work correctly and handle properly.';
    const result = scoreTestability(doc);
    expect(result.score).toBeLessThan(25);
    expect(result.issues.some(i => i.includes('vague'))).toBe(true);
  });

  it('should deduct for many vague terms', () => {
    const doc = 'Works correctly. Handles properly. Appropriate response. Intuitive design. User-friendly interface.';
    const result = scoreTestability(doc);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('should deduct for user story syntax', () => {
    const doc = 'As a user, I want to login so that I can access my account.';
    const result = scoreTestability(doc);
    expect(result.score).toBeLessThan(25);
    expect(result.issues.some(i => i.includes('user story'))).toBe(true);
  });

  it('should deduct for Gherkin syntax', () => {
    const doc = 'Given I am on the login page\nWhen I enter credentials\nThen I should be logged in';
    const result = scoreTestability(doc);
    expect(result.score).toBeLessThan(25);
    expect(result.issues.some(i => i.includes('Given/When/Then'))).toBe(true);
  });

  it('should deduct for compound criteria', () => {
    const doc = '- [ ] User can login or register';
    const result = scoreTestability(doc);
    expect(result.score).toBeLessThan(25);
    expect(result.issues.some(i => i.includes('compound'))).toBe(true);
  });
});

describe('scoreCompleteness', () => {
  it('should give full points for complete criteria', () => {
    const doc = '# Summary\n\nText\n\n# Acceptance Criteria\n\n- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] Criterion 3\n- [ ] Handle error when network fails\n- [ ] Handle edge case when list is empty\n\n# Out of Scope\n\n- Not this';
    const result = scoreCompleteness(doc);
    expect(result.score).toBe(20);
  });

  it('should give partial points for too many criteria', () => {
    const doc = '- [ ] C1\n- [ ] C2\n- [ ] C3\n- [ ] C4\n- [ ] C5\n- [ ] C6\n- [ ] C7\n- [ ] C8\n- [ ] C9\n- [ ] C10';
    const result = scoreCompleteness(doc);
    expect(result.issues.some(i => i.includes('Too many'))).toBe(true);
  });

  it('should give partial points for too few criteria', () => {
    const doc = '- [ ] Only one criterion';
    const result = scoreCompleteness(doc);
    expect(result.issues.some(i => i.includes('Add more criteria'))).toBe(true);
  });

  it('should deduct for no criteria', () => {
    const doc = 'Just text without any checkboxes';
    const result = scoreCompleteness(doc);
    expect(result.issues.some(i => i.includes('No checkbox'))).toBe(true);
  });

  it('should give partial points for only error cases', () => {
    const doc = '- [ ] Handle error when network fails';
    const result = scoreCompleteness(doc);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should give partial points for only edge cases', () => {
    const doc = '- [ ] Handle edge case when list is empty';
    const result = scoreCompleteness(doc);
    expect(result.score).toBeGreaterThan(0);
  });
});

