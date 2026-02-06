/**
 * Tests for validator/js/prompts.js
 * Tests prompt generation functions for LLM-based Acceptance Criteria scoring
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
  cleanAIResponse
} from '../js/prompts.js';

describe('prompts.js', () => {
  const sampleContent = `# User Story: Login Feature
## As a user, I want to log in to my account so that I can access my dashboard
## Acceptance Criteria
- Given I am on the login page, when I enter valid credentials, then I am redirected to the dashboard
- Given I am on the login page, when I enter invalid credentials, then I see an error message
- Given I am logged in, when I close and reopen the browser, then I remain logged in for 30 days`;

  describe('generateLLMScoringPrompt', () => {
    test('should generate a prompt containing the content', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain(sampleContent);
    });

    test('should include scoring rubric sections', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('SCORING RUBRIC');
      expect(prompt).toContain('/100');
    });

    test('should include calibration guidance', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('CALIBRATION');
    });
  });

  describe('generateCritiquePrompt', () => {
    const mockResult = {
      totalScore: 65,
      completeness: { score: 18, issues: ['Missing edge cases'] },
      clarity: { score: 20, issues: [] },
      testability: { score: 15, issues: ['Not measurable'] }
    };

    test('should generate a prompt containing the content', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current validation results', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain('65');
    });

    test('should handle missing result fields gracefully', () => {
      const minimalResult = { totalScore: 50 };
      const prompt = generateCritiquePrompt(sampleContent, minimalResult);
      expect(prompt).toContain('50');
    });
  });

  describe('generateRewritePrompt', () => {
    const mockResult = { totalScore: 45 };

    test('should generate a prompt containing the content', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current score', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain('45');
    });
  });

  describe('cleanAIResponse', () => {
    test('should remove common prefixes', () => {
      const response = "Here's the evaluation:\nSome content";
      expect(cleanAIResponse(response)).toBe('Some content');
    });

    test('should extract content from markdown code blocks', () => {
      const response = '```markdown\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should handle code blocks without language specifier', () => {
      const response = '```\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should trim whitespace', () => {
      const response = '  Some content with spaces  ';
      expect(cleanAIResponse(response)).toBe('Some content with spaces');
    });

    test('should handle responses without prefixes or code blocks', () => {
      const response = 'Plain response text';
      expect(cleanAIResponse(response)).toBe('Plain response text');
    });
  });
});

