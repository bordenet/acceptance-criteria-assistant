/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { validateDocument, getGrade, getScoreColor } from '../js/validator.js';

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

