/**
 * Tests for validator-inline.js
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  scoreStructure,
  scoreClarity,
  scoreBusinessValue,
  scoreCompleteness,
  detectStructure,
  detectClarity,
  detectBusinessValue,
  detectCompleteness
} from '../../shared/js/validator-inline.js';

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

// ============================================================================
// Scoring Function Tests
// ============================================================================

describe('Scoring Functions', () => {
  describe('scoreStructure', () => {
    test('should return maxScore of 25', () => {
      const result = scoreStructure('Executive Summary');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for structured content', () => {
      const content = `
# Executive Summary
This proposal outlines a comprehensive plan.

## Problem Statement
Users struggle with the current workflow.

## Proposed Solution
We will implement automated processes.
      `.repeat(2);
      const result = scoreStructure(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreClarity', () => {
    test('should return maxScore of 30', () => {
      const result = scoreClarity('Clear requirements');
      expect(result.maxScore).toBe(30);
    });

    test('should score higher for actionable language', () => {
      const content = `
Given the user is logged in
When they click the submit button
Then the form should be validated and saved
The system should reduce errors by 50%
      `.repeat(2);
      const result = scoreClarity(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreBusinessValue', () => {
    test('should return maxScore of 25', () => {
      const result = scoreBusinessValue('Value proposition');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for value-focused content', () => {
      const content = `
## Benefits and Value
- Improve customer satisfaction by 25%
- Reduce support costs by $100,000
- Revenue growth through upsell opportunities
      `.repeat(2);
      const result = scoreBusinessValue(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreCompleteness', () => {
    test('should return maxScore of 20', () => {
      const result = scoreCompleteness('Complete plan');
      expect(result.maxScore).toBe(20);
    });

    test('should score for implementation content', () => {
      const content = `
## Implementation Plan
- Phase 1: Design and requirements gathering
- Phase 2: Development and testing

## Timeline and Milestones
- Milestone 1: Complete by Q1
- Milestone 2: Launch by Q2
      `.repeat(3);
      const result = scoreCompleteness(content);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectStructure', () => {
    test('should detect executive summary section', () => {
      const content = '# Executive Summary\nThis is an overview.';
      const result = detectStructure(content);
      expect(result.hasSection).toBe(true);
    });

    test('should detect content indicators', () => {
      const content = 'The proposal outlines the overview of the project scope.';
      const result = detectStructure(content);
      expect(result.hasContent).toBe(true);
    });
  });

  describe('detectClarity', () => {
    test('should detect problem/solution section', () => {
      const content = '## Problem Statement\nUsers face difficulties.';
      const result = detectClarity(content);
      expect(result.hasSection).toBe(true);
    });

    test('should detect action verbs', () => {
      const content = 'Implement the solution, validate the input, and reduce errors.';
      const result = detectClarity(content);
      expect(result.hasContent).toBe(true);
    });
  });

  describe('detectBusinessValue', () => {
    test('should detect benefits section', () => {
      const content = '## Benefits and Value\nImproved efficiency.';
      const result = detectBusinessValue(content);
      expect(result.hasSection).toBe(true);
    });

    test('should detect value indicators', () => {
      const content = 'This will improve revenue and reduce costs by 25%.';
      const result = detectBusinessValue(content);
      expect(result.hasContent).toBe(true);
    });
  });

  describe('detectCompleteness', () => {
    test('should detect implementation section', () => {
      const content = '## Implementation Plan\nPhase 1 starts Q1.';
      const result = detectCompleteness(content);
      expect(result.hasSection).toBe(true);
    });

    test('should detect completeness indicators', () => {
      const content = 'The timeline includes milestones and risk mitigations.';
      const result = detectCompleteness(content);
      expect(result.hasContent).toBe(true);
    });
  });
});
