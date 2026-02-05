/**
 * Prompts Module Tests
 */

import { jest } from '@jest/globals';
import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  getPhaseMetadata,
  preloadPromptTemplates
} from '../js/prompts.js';

// Mock fetch for loading prompt templates
// Uses AC-specific template variables
global.fetch = jest.fn(async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1: Issue {{ISSUE_TITLE}}. Task: {{WHAT_NEEDS_TO_BE_DONE}}. Context: {{RELATED_CONTEXT}}.',
    'prompts/phase2.md': 'Phase 2: Review AC for {{ISSUE_TITLE}}. Previous output: {{PHASE1_OUTPUT}}',
    'prompts/phase3.md': 'Phase 3: Final AC for {{ISSUE_TITLE}}. Phase 1: {{PHASE1_OUTPUT}}. Phase 2: {{PHASE2_OUTPUT}}'
  };

  return {
    ok: true,
    text: async () => templates[url] || 'Default template'
  };
});

describe('WORKFLOW_CONFIG', () => {
  test('should have 3 phases', () => {
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
  });

  test('should have correct phase structure', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(phase.name).toBeDefined();
      expect(phase.aiModel).toBeDefined();
      expect(phase.description).toBeDefined();
      expect(phase.icon).toBeDefined();
      expect(phase.aiUrl).toBeDefined();
    });
  });

  test('should use Claude for Phase 1 and 3, Gemini for Phase 2', () => {
    expect(WORKFLOW_CONFIG.phases[0].aiModel).toBe('Claude');
    expect(WORKFLOW_CONFIG.phases[1].aiModel).toBe('Gemini');
    expect(WORKFLOW_CONFIG.phases[2].aiModel).toBe('Claude');
  });
});

describe('getPhaseMetadata', () => {
  test('should return correct metadata for each phase', () => {
    const phase1 = getPhaseMetadata(1);
    expect(phase1.name).toBe('Draft AC');
    expect(phase1.icon).toBe('📝');

    const phase2 = getPhaseMetadata(2);
    expect(phase2.name).toBe('Adversarial Review');
    expect(phase2.icon).toBe('🔍');

    const phase3 = getPhaseMetadata(3);
    expect(phase3.name).toBe('Final AC');
    expect(phase3.icon).toBe('✅');
  });

  test('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(0)).toBeUndefined();
    expect(getPhaseMetadata(4)).toBeUndefined();
    expect(getPhaseMetadata(-1)).toBeUndefined();
  });
});

describe('preloadPromptTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should preload all phase templates', async () => {
    await preloadPromptTemplates();

    expect(global.fetch).toHaveBeenCalledWith('prompts/phase1.md');
    expect(global.fetch).toHaveBeenCalledWith('prompts/phase2.md');
    expect(global.fetch).toHaveBeenCalledWith('prompts/phase3.md');
  });
});

describe('generatePhase1Prompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate prompt with all form data', async () => {
    // Uses AC-specific field names
    const formData = {
      issueTitle: 'Add bulk delete to admin panel',
      whatNeedsToBeDone: 'Users need to select multiple items and delete them at once',
      relatedContext: 'See PRD-123 for full requirements'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Add bulk delete to admin panel');
    expect(prompt).toContain('Users need to select multiple items and delete them at once');
    expect(prompt).toContain('See PRD-123 for full requirements');
  });

  test('should handle missing form data with placeholders', async () => {
    const formData = {
      issueTitle: 'Test Issue'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Issue');
    expect(prompt).toContain('[Not provided]');
  });
});

describe('generatePhase2Prompt', () => {
  test('should include phase 1 output', async () => {
    // Uses AC-specific field names
    const formData = {
      issueTitle: 'Test Issue'
    };

    const prompt = await generatePhase2Prompt(formData, 'Phase 1 generated content');

    expect(prompt).toContain('Phase 1 generated content');
    expect(prompt).toContain('Test Issue');
  });
});

describe('generatePhase3Prompt', () => {
  test('should include both phase 1 and phase 2 outputs', async () => {
    // Uses AC-specific field names
    const formData = {
      issueTitle: 'Final Test Issue'
    };

    const prompt = await generatePhase3Prompt(formData, 'Phase 1 content', 'Phase 2 critique');

    expect(prompt).toContain('Final Test Issue');
    expect(prompt).toContain('Phase 1 content');
    expect(prompt).toContain('Phase 2 critique');
  });
});

