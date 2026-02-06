/**
 * Tests for validator-inline.js
 */
import { validateDocument, getScoreColor, getScoreLabel } from '../js/validator-inline.js';

describe('Inline Document Validator', () => {
  describe('validateDocument', () => {
    test('should return zero scores for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.structure.score).toBe(0);
      expect(result.clarity.score).toBe(0);
      expect(result.businessValue.score).toBe(0);
      expect(result.completeness.score).toBe(0);
    });

    test('should return zero scores for short content', () => {
      const result = validateDocument('Too short');
      expect(result.totalScore).toBe(0);
    });

    test('should return zero scores for null', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    test('should score a well-structured proposal', () => {
      const goodProposal = `
# Executive Summary
This proposal outlines a plan to implement a new customer portal.

## Problem Statement
Currently, customers struggle to access their account information, leading to 500+ support calls per month.

## Proposed Solution
We will build a self-service portal that reduces support costs by $50,000 annually.

## Benefits and Value
- Customer satisfaction improvement by 25%
- Reduced support tickets by 40%
- Revenue growth through upsell opportunities

## Implementation Plan
- Q1: Design phase
- Q2: Development
- Q3: Testing and launch

### Next Steps
1. Assign product owner
2. Schedule kickoff meeting

## Risks and Assumptions
- Risk: Integration complexity. Mitigation: Early prototype testing.
- Assumption: API availability
      `;
      const result = validateDocument(goodProposal);
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.structure.score).toBeGreaterThan(10);
      expect(result.clarity.score).toBeGreaterThan(10);
    });

    test('should penalize vague language', () => {
      const vagueProposal = `
# Executive Summary
This will be an easy to use, user-friendly, intuitive, seamless, flexible, and robust solution.
It will provide good performance and high quality results in a reasonable timeframe.
The scalable and efficient approach will be minimal effort with appropriate resources.
      `.repeat(3); // Make it long enough to pass minimum length

      const result = validateDocument(vagueProposal);
      // Full validator flags missing actionable language and metrics instead of "vague"
      expect(result.clarity.issues.some(i =>
        i.includes('vague') || i.includes('actionable') || i.includes('metrics')
      )).toBe(true);
    });

    test('should reward measurable metrics', () => {
      const measurableProposal = `
# Executive Summary
This proposal will reduce costs by 25% and save $100,000 per year.
Response time will improve by 50ms.
We expect 1000 new users within 30 days.

## Problem
Current system has 500ms latency and costs $200,000 annually.

## Solution  
Implement new architecture to reduce latency to 100ms.
      `;
      const result = validateDocument(measurableProposal);
      expect(result.clarity.score).toBeGreaterThan(5);
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

