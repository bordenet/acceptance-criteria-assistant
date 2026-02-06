/**
 * Inline Proposal Validator for Assistant UI
 * @module validator-inline
 *
 * Wraps the full validator to ensure consistent scoring between
 * the Assistant UI and the standalone Validator app.
 *
 * Scoring Dimensions:
 * 1. Structure (25 pts) - Document structure
 * 2. Clarity (30 pts) - Clarity and persuasiveness
 * 3. Business Value (25 pts) - Business value demonstration
 * 4. Completeness (20 pts) - Document completeness
 */

// Import the full validator to ensure scoring consistency
import {
  validateDocument as validateDocumentFull,
  scoreStructure,
  scoreClarity,
  scoreBusinessValue,
  scoreCompleteness
} from '../../validator/js/validator.js';

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

/**
 * Validate a document using the same algorithm as the full validator.
 * This ensures users see identical scores in the Assistant and Validator.
 *
 * @param {string} text - The document content (markdown)
 * @returns {Object} Validation result with totalScore and dimension breakdowns
 */
export function validateDocument(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      clarity: { score: 0, maxScore: 30, issues: ['No content to validate'] },
      businessValue: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'] }
    };
  }

  // Use the full validator's scoring logic
  const result = validateDocumentFull(text);

  // Return in the format expected by the assistant UI
  return {
    totalScore: result.totalScore,
    structure: result.structure,
    clarity: result.clarity,
    businessValue: result.businessValue,
    completeness: result.completeness,
    slopDetection: result.slopDetection || {
      penalty: 0,
      deduction: 0,
      issues: []
    }
  };
}

/**
 * Get score color based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

/**
 * Get score label based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} Human-readable label
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}

