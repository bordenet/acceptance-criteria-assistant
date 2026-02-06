/**
 * Acceptance Criteria Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Structure (25 pts) - Document organization and formatting
 * 2. Clarity (30 pts) - Precision, measurability, actionable language
 * 3. Business Value (25 pts) - ROI, stakeholder value, success criteria
 * 4. Completeness (20 pts) - Length, next steps, risk mitigation
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Constants - CUSTOMIZE THESE FOR YOUR DOCUMENT TYPE
// ============================================================================

/**
 * Required sections for acceptance criteria documents - must match validator-inline.js for consistent scoring
 */
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(executive\s+summary|overview|introduction|purpose)/im, name: 'Executive Summary', weight: 3 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(problem|challenge|opportunity|background|context)/im, name: 'Problem Statement', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(solution|approach|proposal|recommendation)/im, name: 'Proposed Solution', weight: 3 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(benefit|value|impact|outcome|result)/im, name: 'Benefits/Value', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(implementation|timeline|roadmap|plan|next\s+step)/im, name: 'Implementation Plan', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(risk|concern|assumption|constraint)/im, name: 'Risks/Assumptions', weight: 1 }
];

// Structure patterns - document organization
const STRUCTURE_PATTERNS = {
  sectionPattern: /^#+\s*(executive\s+summary|overview|introduction|purpose)/im,
  contentPattern: /\b(summary|overview|introduction|purpose|objective|goal)\b/gi,
  qualityPattern: /\b(quality|metric|measure|success|outcome)\b/gi,
};

// Clarity patterns - precision and measurability
const CLARITY_PATTERNS = {
  sectionPattern: /^#+\s*(problem|challenge|solution|approach)/im,
  contentPattern: /\b(implement|create|build|develop|establish|launch|deploy|integrate|automate|reduce|increase|improve)\b/gi,
  qualityPattern: /(?:≤|≥|<|>|=)?\s*\d+(?:\.\d+)?\s*(ms|%|percent|\$|dollar|day|week|month|hour|user|item)/gi,
};

// Business value patterns - ROI and stakeholder value
const BUSINESS_VALUE_PATTERNS = {
  sectionPattern: /^#+\s*(benefit|value|impact|outcome|result)/im,
  contentPattern: /\b(roi|return|value|benefit|savings|revenue|cost|profit|efficiency|productivity)\b/gi,
  qualityPattern: /\b(stakeholder|customer|user|business|team|organization)\b/gi,
};

// Completeness patterns - thoroughness
const COMPLETENESS_PATTERNS = {
  sectionPattern: /^#+\s*(implementation|timeline|roadmap|plan|next\s+step|risk)/im,
  contentPattern: /\b(timeline|milestone|phase|deadline|deliverable|risk|assumption|constraint)\b/gi,
  qualityPattern: /\b(complete|comprehensive|thorough|full|detailed)\b/gi,
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect structure content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectStructure(text) {
  const hasSection = STRUCTURE_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(STRUCTURE_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(STRUCTURE_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Executive summary section found',
      contentMatches.length > 0 && `${contentMatches.length} structure indicators`,
      qualityMatches.length > 0 && 'Quality indicators present'
    ].filter(Boolean)
  };
}

/**
 * Detect clarity content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectClarity(text) {
  const hasSection = CLARITY_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(CLARITY_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(CLARITY_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Problem/solution section found',
      contentMatches.length > 0 && `${contentMatches.length} action verbs`,
      qualityMatches.length > 0 && 'Measurable metrics present'
    ].filter(Boolean)
  };
}

/**
 * Detect business value content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectBusinessValue(text) {
  const hasSection = BUSINESS_VALUE_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(BUSINESS_VALUE_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(BUSINESS_VALUE_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Benefits/value section found',
      contentMatches.length > 0 && `${contentMatches.length} value indicators`,
      qualityMatches.length > 0 && 'Stakeholder focus present'
    ].filter(Boolean)
  };
}

/**
 * Detect completeness content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectCompleteness(text) {
  const hasSection = COMPLETENESS_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(COMPLETENESS_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(COMPLETENESS_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Implementation/risk section found',
      contentMatches.length > 0 && `${contentMatches.length} completeness indicators`,
      qualityMatches.length > 0 && 'Thoroughness indicators present'
    ].filter(Boolean)
  };
}

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score Structure (25 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStructure(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const detection = detectStructure(text);

  if (detection.hasSection && detection.hasContent) {
    score += 20;
    strengths.push('Strong structure with executive summary');
  } else if (detection.hasContent) {
    score += 10;
    issues.push('Structure content present but lacks dedicated summary section');
  } else {
    issues.push('Missing executive summary or overview section');
  }

  if (detection.hasQuality) {
    score += 5;
    strengths.push('Quality indicators present');
  } else {
    issues.push('Add quality metrics to strengthen structure');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Clarity (30 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  const detection = detectClarity(text);

  if (detection.hasSection && detection.hasContent) {
    score += 15;
    strengths.push('Clear problem/solution with actionable language');
  } else if (detection.hasContent) {
    score += 8;
    issues.push('Action verbs present but lacks dedicated problem/solution sections');
  } else {
    issues.push('Missing actionable language - use specific action verbs');
  }

  if (detection.hasQuality) {
    score += 15;
    strengths.push('Measurable metrics and numbers present');
  } else {
    issues.push('Add specific metrics and numbers for measurability');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Business Value (25 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreBusinessValue(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const detection = detectBusinessValue(text);

  if (detection.hasSection && detection.hasContent) {
    score += 15;
    strengths.push('Strong business value proposition with dedicated section');
  } else if (detection.hasContent) {
    score += 8;
    issues.push('Value indicators present but lacks dedicated benefits section');
  } else {
    issues.push('Missing business value - add ROI, benefits, or value proposition');
  }

  if (detection.hasQuality) {
    score += 10;
    strengths.push('Stakeholder focus present');
  } else {
    issues.push('Add stakeholder perspective to strengthen value proposition');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Completeness (20 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  const detection = detectCompleteness(text);
  const sections = detectSections(text);

  // Section completeness
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 10;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.70) {
    score += 5;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  if (detection.hasQuality) {
    score += 10;
    strengths.push('Thorough implementation details present');
  } else {
    issues.push('Add implementation details and risk considerations');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a document and return comprehensive scoring results
 * @param {string} text - Document content
 * @returns {Object} Complete validation results
 */
export function validateDocument(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      clarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      businessValue: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const structure = scoreStructure(text);
  const clarity = scoreClarity(text);
  const businessValue = scoreBusinessValue(text);
  const completeness = scoreCompleteness(text);

  // AI slop detection - acceptance criteria must be precise and testable
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (aligned with inline validator)
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
 * Get letter grade from numeric score
 * @param {number} score - Numeric score 0-100
 * @returns {string} Letter grade
 */
export function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get Tailwind color class for score
 * @param {number} score - Numeric score 0-100
 * @param {number} maxScore - Maximum possible score (default 100)
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}
