/**
 * Workflow Module (TEMPLATE - CUSTOMIZE FOR YOUR DOMAIN)
 * Manages the 3-phase adversarial workflow
 * @module workflow
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * 1. Update generatePrompt() to map YOUR project fields
 * 2. Update fillPromptTemplate() variable replacements for YOUR fields
 * 3. Update exportAsMarkdown() format for YOUR document type
 * 4. Update getExportFilename() naming convention
 */

import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt as genPhase1,
  generatePhase2Prompt as genPhase2,
  generatePhase3Prompt as genPhase3
} from './prompts.js';
import { detectPromptPaste } from './core/workflow.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

// Re-export detectPromptPaste from core for backward compatibility
export { detectPromptPaste };

/**
 * Helper to get phase output, handling both flat and nested formats
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {string} Phase output content
 */
function getPhaseOutputInternal(project, phaseNum) {
  // Flat format (canonical) - check first
  const flatKey = `phase${phaseNum}_output`;
  if (project[flatKey]) {
    return project[flatKey];
  }
  // Nested format (legacy) - fallback
  if (project.phases) {
    if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
      return project.phases[phaseNum - 1].response || '';
    }
    if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
      return project.phases[phaseNum].response || '';
    }
  }
  return '';
}

/** @type {Object.<number, string>} Prompt templates cache - legacy, kept for backward compatibility */
let promptTemplates = {};

/**
 * Load default prompts from files - legacy function kept for backward compatibility
 * @returns {Promise<void>}
 */
export async function loadDefaultPrompts() {
  for (const phase of WORKFLOW_CONFIG.phases) {
    try {
      const response = await fetch(`prompts/phase${phase.number}.md`);
      if (response.ok) {
        promptTemplates[phase.number] = await response.text();
      }
    } catch (error) {
      console.warn(`Failed to load prompt for phase ${phase.number}:`, error);
    }
  }
}

export class Workflow {
  /** @type {import('./types.js').Project} */
  project;

  /** @type {number} */
  currentPhase;

  /**
     * @param {import('./types.js').Project} project
     */
  constructor(project) {
    this.project = project;
    // Clamp phase to valid range (1 minimum)
    const rawPhase = project.phase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
     * Get the current phase configuration
     * @returns {import('./types.js').PhaseConfig | undefined}
     */
  getCurrentPhase() {
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
     * Get the next phase configuration
     * @returns {import('./types.js').PhaseConfig | null}
     */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) return null;
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1) || null;
  }

  /**
     * Check if workflow is complete
     * @returns {boolean}
     */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
     * Advance to the next phase
     * @returns {boolean} True if advanced, false if already at final phase
     */
  advancePhase() {
    // Allow advancing up to phase 4 (complete state)
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
     * Go back to the previous phase
     * @returns {boolean} True if went back, false if already at first phase
     */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
     * Generate the prompt for the current phase
     * Uses prompts.js module for template loading and variable replacement
     *
     * ⚠️ CUSTOMIZATION REQUIRED:
     * Update formData to map YOUR project fields from projects.js/types.js
     *
     * @returns {Promise<string>}
     */
  async generatePrompt() {
    const p = this.project;
    // CUSTOMIZE: Map YOUR project fields here
    // These field names must match what you defined in projects.js createProject()
    const formData = {
      title: p.title,
      context: p.context,
      problems: p.problems,
      additionalContext: p.additionalContext
    };

    switch (this.currentPhase) {
    case 1:
      return await genPhase1(formData);
    case 2:
      return await genPhase2(formData, p.phase1_output || '[Phase 1 output not yet generated]');
    case 3:
      return await genPhase3(
        formData,
        p.phase1_output || '[Phase 1 output not yet generated]',
        p.phase2_output || '[Phase 2 output not yet generated]'
      );
    default:
      throw new Error(`Invalid phase: ${this.currentPhase}`);
    }
  }

  /**
     * Replace template variables with project data - legacy method kept for backward compatibility
     *
     * ⚠️ CUSTOMIZATION REQUIRED:
     * Update the variable replacements to match YOUR project fields
     *
     * @param {string} template
     * @returns {string}
     */
  replaceVariables(template) {
    let result = template;
    const p = this.project;

    // Helper to provide meaningful placeholder for empty values
    const val = (v, label) => v?.trim() || `[${label} not provided]`;
    const optVal = (v) => v?.trim() || '[Not provided]';

    // CUSTOMIZE: Replace these with YOUR project field mappings
    // Example for JD: jobTitle, companyName, roleLevel, etc.
    result = result.replace(/\{title\}/g, val(p.title, 'Title'));
    result = result.replace(/\{context\}/g, optVal(p.context));
    result = result.replace(/\{problems\}/g, optVal(p.problems));
    result = result.replace(/\{additionalContext\}/g, optVal(p.additionalContext));

    // Phase outputs for synthesis
    result = result.replace(/\{phase1_output\}/g, p.phase1_output || '[Phase 1 output not yet generated]');
    result = result.replace(/\{phase2_output\}/g, p.phase2_output || '[Phase 2 output not yet generated]');

    return result;
  }

  /**
     * Save the output for the current phase
     * @param {string} output
     * @returns {void}
     */
  savePhaseOutput(output) {
    const phaseKey = /** @type {'phase1_output' | 'phase2_output' | 'phase3_output'} */ (`phase${this.currentPhase}_output`);
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
  }

  /**
     * Get the output for a specific phase
     * @param {number} phaseNumber
     * @returns {string}
     */
  getPhaseOutput(phaseNumber) {
    return getPhaseOutputInternal(this.project, phaseNumber);
  }

  /**
     * Export the project as a Markdown document
     *
     * ⚠️ CUSTOMIZATION REQUIRED:
     * Update the attribution URL and document header format
     *
     * @returns {string}
     */
  exportAsMarkdown() {
    // CUSTOMIZE: Update attribution URL for your deployed app
    const attribution = '\n\n---\n\n*Generated with [Acceptance Criteria Assistant](https://bordenet.github.io/acceptance-criteria-assistant/)*';

    // CUSTOMIZE: Update document header format
    let md = `# ${this.project.title}\n\n`;
    md += `**Created**: ${new Date(this.project.createdAt).toLocaleDateString()}\n`;
    md += `**Last Updated**: ${new Date(this.project.updatedAt).toLocaleDateString()}\n\n`;

    // Include final output (Phase 3) as the main content
    const finalOutput = this.getPhaseOutput(3);
    if (finalOutput) {
      md += finalOutput;
    }

    md += attribution;
    return md;
  }

  /**
     * Get workflow progress as a percentage
     * @returns {number}
     */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }

  /**
     * Get the last completed phase with its response
     * @returns {{phase: number, response: string} | null}
     */
  getLastCompletedPhase() {
    // Check phases in reverse order to find the last one with output
    for (let i = WORKFLOW_CONFIG.phaseCount; i >= 1; i--) {
      const output = this.getPhaseOutput(i);
      if (output) {
        return { phase: i, response: output };
      }
    }
    return null;
  }
}

/**
 * Get metadata for a specific phase
 * @param {number} phaseNumber
 * @returns {import('./types.js').PhaseConfig | undefined}
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Generate the prompt for a specific phase
 * @param {import('./types.js').Project} project
 * @param {number} phaseNumber
 * @returns {Promise<string>}
 */
export async function generatePromptForPhase(project, phaseNumber) {
  const workflow = new Workflow(project);
  workflow.currentPhase = phaseNumber;
  return await workflow.generatePrompt();
}

/**
 * Export the final document as Markdown
 * @param {import('./types.js').Project} project
 * @returns {string}
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
}

/**
 * Get the final markdown content from a project
 * @param {import('./types.js').Project} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  const workflow = new Workflow(project);
  const lastPhase = workflow.getLastCompletedPhase();
  if (lastPhase && lastPhase.response) {
    return workflow.exportAsMarkdown();
  }
  return null;
}

/**
 * Generate export filename for a project
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * Update the default filename and suffix for your document type
 *
 * @param {import('./types.js').Project} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  // CUSTOMIZE: Update default name and suffix for your document type
  return `${(project.title || 'document').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
}
