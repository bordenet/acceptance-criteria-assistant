/**
 * Inline Proposal Validator for Assistant UI
 * @module validator-inline
 *
 * This is a lightweight validation module for inline proposal scoring
 * directly in the assistant after Phase 3 completion.
 */

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// Required sections detection patterns
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(executive\s+summary|overview|introduction|purpose)/im, name: 'Executive Summary', weight: 3 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(problem|challenge|opportunity|background|context)/im, name: 'Problem Statement', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(solution|approach|proposal|recommendation)/im, name: 'Proposed Solution', weight: 3 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(benefit|value|impact|outcome|result)/im, name: 'Benefits/Value', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(implementation|timeline|roadmap|plan|next\s+step)/im, name: 'Implementation Plan', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(risk|concern|assumption|constraint)/im, name: 'Risks/Assumptions', weight: 1 }
];

// Vague language patterns to penalize
const VAGUE_QUALIFIERS = [
  'easy to use', 'user-friendly', 'fast', 'quick', 'responsive',
  'good performance', 'high quality', 'scalable', 'flexible',
  'intuitive', 'seamless', 'robust', 'efficient', 'optimal',
  'minimal', 'sufficient', 'reasonable', 'appropriate', 'adequate'
];

/**
 * Score document structure (25 pts max)
 */
function scoreDocumentStructure(text) {
  let score = 0;
  const issues = [];

  // Check required sections (13 pts max)
  let sectionScore = 0;
  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      sectionScore += section.weight;
    } else {
      issues.push(`Missing: ${section.name}`);
    }
  }
  score += Math.min(13, sectionScore);

  // Organization (7 pts) - check for consistent heading hierarchy
  const headings = text.match(/^#+\s+/gm) || [];
  if (headings.length >= 5) score += 4;
  else if (headings.length >= 3) score += 2;

  const hasH1 = /^#\s+/m.test(text);
  const hasH2 = /^##\s+/m.test(text);
  if (hasH1 && hasH2) score += 3;
  else if (hasH1 || hasH2) score += 1;

  // Formatting (5 pts) - bullets and structure
  const hasBullets = /^[\s]*[-*]\s+/m.test(text);
  const hasTables = /\|.*\|/.test(text);
  if (hasBullets) score += 3;
  if (hasTables) score += 2;

  return { score: Math.min(25, score), maxScore: 25, issues };
}

/**
 * Score clarity and persuasiveness (30 pts max)
 */
function scoreClarity(text) {
  let score = 0;
  const issues = [];
  const lowerText = text.toLowerCase();

  // Precision (10 pts) - penalize vague qualifiers
  let vagueCount = 0;
  for (const qualifier of VAGUE_QUALIFIERS) {
    if (lowerText.includes(qualifier)) vagueCount++;
  }
  if (vagueCount === 0) score += 10;
  else if (vagueCount <= 2) score += 7;
  else if (vagueCount <= 5) score += 4;
  else {
    score += 2;
    issues.push(`Found ${vagueCount} vague qualifiers`);
  }

  // Measurability (10 pts) - specific metrics and numbers
  const measurablePattern = /(?:≤|≥|<|>|=)?\s*\d+(?:\.\d+)?\s*(ms|%|percent|\$|dollar|day|week|month|hour|user|item)/gi;
  const measurableCount = (text.match(measurablePattern) || []).length;
  if (measurableCount >= 5) score += 10;
  else if (measurableCount >= 3) score += 7;
  else if (measurableCount >= 1) score += 4;
  else issues.push('Add specific metrics and numbers');

  // Actionable language (10 pts)
  const actionVerbs = /\b(implement|create|build|develop|establish|launch|deploy|integrate|automate|reduce|increase|improve)\b/gi;
  const actionCount = (text.match(actionVerbs) || []).length;
  if (actionCount >= 5) score += 10;
  else if (actionCount >= 3) score += 6;
  else if (actionCount >= 1) score += 3;
  else issues.push('Use more action verbs');

  return { score: Math.min(30, score), maxScore: 30, issues };
}

/**
 * Score business value (25 pts max)
 */
function scoreBusinessValue(text) {
  let score = 0;
  const issues = [];

  // ROI/Cost-benefit (8 pts)
  const hasROI = /\b(roi|return.on.investment|cost.benefit|payback|savings?|revenue|budget)\b/i.test(text);
  const hasCost = /\$\d|cost|expense|investment/i.test(text);
  if (hasROI && hasCost) score += 8;
  else if (hasROI || hasCost) score += 4;
  else issues.push('No ROI or cost analysis');

  // Stakeholder value (9 pts)
  const hasCustomerValue = /\b(customer|user|client)\b.*\b(value|benefit|improve|satisfaction)\b/i.test(text);
  const hasBusinessValue = /\b(business|company|organization|revenue|profit|growth)\b/i.test(text);
  if (hasCustomerValue && hasBusinessValue) score += 9;
  else if (hasCustomerValue || hasBusinessValue) score += 5;
  else issues.push('Address stakeholder benefits');

  // Success criteria (8 pts)
  const hasSuccess = /\b(success|metric|kpi|measure|goal|target|objective)\b/i.test(text);
  const hasTimeline = /\b(timeline|milestone|deadline|quarter|q[1-4]|by\s+\d{4})\b/i.test(text);
  if (hasSuccess && hasTimeline) score += 8;
  else if (hasSuccess || hasTimeline) score += 4;
  else issues.push('Define success criteria');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

/**
 * Score completeness (20 pts max)
 */
function scoreCompleteness(text) {
  let score = 0;
  const issues = [];

  // Length adequacy (6 pts)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 500) score += 6;
  else if (wordCount >= 300) score += 4;
  else if (wordCount >= 150) score += 2;
  else issues.push('Content is too brief');

  // Next steps (7 pts)
  const hasNextSteps = /\b(next\s+step|action\s+item|to.?do|recommendation|call.to.action)\b/i.test(text);
  const hasOwner = /\b(owner|responsible|assigned|team|who)\b/i.test(text);
  if (hasNextSteps && hasOwner) score += 7;
  else if (hasNextSteps) score += 4;
  else issues.push('Add next steps or action items');

  // Risk mitigation (7 pts)
  const hasRisks = /\b(risk|concern|challenge|obstacle)\b/i.test(text);
  const hasMitigation = /\b(mitigat|address|solv|handl|contingency|fallback)\b/i.test(text);
  if (hasRisks && hasMitigation) score += 7;
  else if (hasRisks) score += 3;
  else issues.push('Identify risks and mitigations');

  return { score: Math.min(20, score), maxScore: 20, issues };
}

/**
 * Validate a document and return comprehensive scoring results
 * @param {string} text - Document content
 * @returns {Object} Complete validation results
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

  const structure = scoreDocumentStructure(text);
  const clarity = scoreClarity(text);
  const businessValue = scoreBusinessValue(text);
  const completeness = scoreCompleteness(text);

  // AI slop detection
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    structure.score + clarity.score + businessValue.score + completeness.score - slopDeduction
  );

  return {
    totalScore,
    structure,
    clarity,
    businessValue,
    completeness,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
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

