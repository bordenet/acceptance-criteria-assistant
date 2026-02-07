/**
 * Acceptance Criteria Validator - Scoring Logic
 *
 * Scoring Dimensions (aligned with Linear AC format):
 * 1. Structure (25 pts) - Summary, AC checklist, Out of Scope sections
 * 2. Clarity (30 pts) - Testable criteria, action verbs, measurable metrics
 * 3. Testability (25 pts) - Binary verifiable, no vague terms, specific thresholds
 * 4. Completeness (20 pts) - Criterion count, edge cases, error states
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Constants - LINEAR ACCEPTANCE CRITERIA FORMAT
// ============================================================================

/**
 * Required sections for Linear acceptance criteria - simple checklist format
 */
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*summary/im, name: 'Summary', weight: 3 },
  { pattern: /^#+\s*acceptance\s+criteria/im, name: 'Acceptance Criteria', weight: 4 },
  { pattern: /^#+\s*out\s+of\s+scope/im, name: 'Out of Scope', weight: 2 }
];

// Structure patterns - Linear AC organization
const STRUCTURE_PATTERNS = {
  sectionPattern: /^#+\s*summary/im,
  checkboxPattern: /^-\s*\[\s*[x ]?\s*\]/gim,
  outOfScopePattern: /^#+\s*out\s+of\s+scope/im,
};

// Clarity patterns - action verbs and measurable metrics
const CLARITY_PATTERNS = {
  // Action verbs that indicate testable behavior
  actionVerbs: /\b(implement|create|build|render|handle|display|show|hide|enable|disable|validate|submit|load|save|delete|update|fetch|send|receive|trigger|navigate|redirect|authenticate|authorize)\b/gi,
  // Measurable metrics with units
  metricsPattern: /(?:≤|≥|<|>|=|under|within|less than|more than|at least|at most)?\s*\d+(?:\.\d+)?\s*(ms|milliseconds?|seconds?|s|%|percent|kb|mb|gb|px|items?|users?|requests?|errors?|days?|hours?|minutes?)/gi,
  // Specific thresholds
  thresholdPattern: /\b(exactly|at least|at most|maximum|minimum|up to|no more than|no less than)\s+\d+/gi,
};

// Testability patterns - vague terms to flag
const TESTABILITY_PATTERNS = {
  // Vague terms that make criteria untestable (BANNED)
  vagueTerms: /\b(works?\s+correctly|handles?\s+properly|appropriate(ly)?|intuitive(ly)?|user[- ]friendly|seamless(ly)?|fast|slow|good|bad|nice|better|worse|adequate(ly)?|sufficient(ly)?|reasonable|reasonably|acceptable|properly|correctly|as\s+expected|as\s+needed)\b/gi,
  // Anti-patterns: user story syntax
  userStoryPattern: /\bas\s+a\s+\w+,?\s+i\s+want/i,
  // Anti-patterns: Gherkin syntax
  gherkinPattern: /\b(given|when|then)\s+/i,
  // Compound criteria (should be split)
  compoundPattern: /\band\b.*\band\b|\bor\b/i,
};

// Completeness patterns - edge cases and error states
const COMPLETENESS_PATTERNS = {
  // Error/edge case indicators
  errorCasePattern: /\b(error|fail|invalid|empty|null|undefined|missing|timeout|offline|denied|unauthorized|forbidden|not found|exception)\b/gi,
  // Edge case indicators
  edgeCasePattern: /\b(edge case|boundary|limit|maximum|minimum|empty state|no results|first|last|only one|zero|none)\b/gi,
  // Permissions/auth indicators
  permissionPattern: /\b(permission|role|admin|user|guest|authenticated|logged in|logged out)\b/gi,
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect structure in Linear AC format
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectStructure(text) {
  const hasSummary = STRUCTURE_PATTERNS.sectionPattern.test(text);
  const checkboxMatches = text.match(STRUCTURE_PATTERNS.checkboxPattern) || [];
  const hasOutOfScope = STRUCTURE_PATTERNS.outOfScopePattern.test(text);

  return {
    hasSummary,
    hasCheckboxes: checkboxMatches.length > 0,
    checkboxCount: checkboxMatches.length,
    hasOutOfScope,
    indicators: [
      hasSummary && 'Summary section found',
      checkboxMatches.length > 0 && `${checkboxMatches.length} checkbox criteria`,
      hasOutOfScope && 'Out of Scope section found'
    ].filter(Boolean)
  };
}

/**
 * Detect clarity - action verbs and measurable metrics
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectClarity(text) {
  const actionVerbMatches = text.match(CLARITY_PATTERNS.actionVerbs) || [];
  const metricsMatches = text.match(CLARITY_PATTERNS.metricsPattern) || [];
  const thresholdMatches = text.match(CLARITY_PATTERNS.thresholdPattern) || [];

  return {
    hasActionVerbs: actionVerbMatches.length > 0,
    actionVerbCount: actionVerbMatches.length,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    hasThresholds: thresholdMatches.length > 0,
    indicators: [
      actionVerbMatches.length > 0 && `${actionVerbMatches.length} action verbs`,
      metricsMatches.length > 0 && `${metricsMatches.length} measurable metrics`,
      thresholdMatches.length > 0 && 'Specific thresholds present'
    ].filter(Boolean)
  };
}

/**
 * Detect testability issues - vague terms and anti-patterns
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectTestability(text) {
  const vagueMatches = text.match(TESTABILITY_PATTERNS.vagueTerms) || [];
  const hasUserStory = TESTABILITY_PATTERNS.userStoryPattern.test(text);
  const hasGherkin = TESTABILITY_PATTERNS.gherkinPattern.test(text);
  const hasCompound = TESTABILITY_PATTERNS.compoundPattern.test(text);

  return {
    vagueTermCount: vagueMatches.length,
    vagueTerms: [...new Set(vagueMatches.map(m => m.toLowerCase()))],
    hasUserStory,
    hasGherkin,
    hasCompound,
    issues: [
      vagueMatches.length > 0 && `${vagueMatches.length} vague terms found`,
      hasUserStory && 'User story syntax detected (As a...)',
      hasGherkin && 'Gherkin syntax detected (Given/When/Then)',
      hasCompound && 'Compound criteria detected (split into separate items)'
    ].filter(Boolean)
  };
}

/**
 * Detect completeness - edge cases and error states
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectCompleteness(text) {
  const errorCaseMatches = text.match(COMPLETENESS_PATTERNS.errorCasePattern) || [];
  const edgeCaseMatches = text.match(COMPLETENESS_PATTERNS.edgeCasePattern) || [];
  const permissionMatches = text.match(COMPLETENESS_PATTERNS.permissionPattern) || [];
  const checkboxMatches = text.match(STRUCTURE_PATTERNS.checkboxPattern) || [];

  return {
    hasErrorCases: errorCaseMatches.length > 0,
    errorCaseCount: errorCaseMatches.length,
    hasEdgeCases: edgeCaseMatches.length > 0,
    edgeCaseCount: edgeCaseMatches.length,
    hasPermissions: permissionMatches.length > 0,
    criterionCount: checkboxMatches.length,
    indicators: [
      errorCaseMatches.length > 0 && `${errorCaseMatches.length} error cases covered`,
      edgeCaseMatches.length > 0 && `${edgeCaseMatches.length} edge cases covered`,
      permissionMatches.length > 0 && 'Permission/auth cases covered'
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
 * Score Structure (25 pts max) - Linear AC format
 * - Summary section present: +10
 * - Acceptance Criteria section with checkboxes: +10
 * - Out of Scope section: +5
 */
export function scoreStructure(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const detection = detectStructure(text);

  // Summary section (10 pts)
  if (detection.hasSummary) {
    score += 10;
    strengths.push('Summary section present');
  } else {
    issues.push('Missing ## Summary section');
  }

  // Acceptance Criteria with checkboxes (10 pts)
  if (detection.hasCheckboxes && detection.checkboxCount >= 3) {
    score += 10;
    strengths.push(`${detection.checkboxCount} checkbox criteria found`);
  } else if (detection.hasCheckboxes) {
    score += 5;
    issues.push(`Only ${detection.checkboxCount} criteria - aim for 3-7`);
  } else {
    issues.push('Missing checkbox criteria (- [ ] format)');
  }

  // Out of Scope section (5 pts)
  if (detection.hasOutOfScope) {
    score += 5;
    strengths.push('Out of Scope section present');
  } else {
    issues.push('Missing ## Out of Scope section');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Clarity (30 pts max) - Action verbs and measurable metrics
 * - Action verbs (implement, create, build, etc.): +15 max
 * - Measurable metrics with units: +15 max
 */
export function scoreClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  const detection = detectClarity(text);

  // Action verbs (15 pts max)
  if (detection.actionVerbCount >= 5) {
    score += 15;
    strengths.push(`${detection.actionVerbCount} action verbs - excellent specificity`);
  } else if (detection.actionVerbCount >= 3) {
    score += 10;
    strengths.push(`${detection.actionVerbCount} action verbs found`);
  } else if (detection.actionVerbCount >= 1) {
    score += 5;
    issues.push('Add more action verbs (implement, create, display, validate, etc.)');
  } else {
    issues.push('Missing action verbs - criteria should describe specific actions');
  }

  // Measurable metrics (15 pts max)
  if (detection.metricsCount >= 3) {
    score += 15;
    strengths.push(`${detection.metricsCount} measurable metrics with units`);
  } else if (detection.metricsCount >= 1) {
    score += 8;
    issues.push('Add more measurable thresholds (e.g., "≤200ms", "up to 100 items")');
  } else {
    issues.push('No measurable metrics - add specific numbers with units');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Testability (25 pts max) - No vague terms, no anti-patterns
 * - No vague terms: +15 max (deduct for each vague term)
 * - No anti-patterns (user stories, Gherkin): +10
 */
export function scoreTestability(text) {
  const issues = [];
  const strengths = [];
  let score = 25; // Start at max, deduct for issues
  const maxScore = 25;

  const detection = detectTestability(text);

  // Vague terms penalty (up to -15)
  if (detection.vagueTermCount === 0) {
    strengths.push('No vague terms - all criteria are specific');
  } else {
    const penalty = Math.min(15, detection.vagueTermCount * 3);
    score -= penalty;
    issues.push(`${detection.vagueTermCount} vague terms: ${detection.vagueTerms.slice(0, 3).join(', ')}${detection.vagueTerms.length > 3 ? '...' : ''}`);
  }

  // Anti-pattern penalties (up to -10)
  if (detection.hasUserStory) {
    score -= 5;
    issues.push('User story syntax detected - use plain language instead');
  }
  if (detection.hasGherkin) {
    score -= 5;
    issues.push('Gherkin syntax detected - use plain checkbox format');
  }
  if (detection.hasCompound) {
    score -= 3;
    issues.push('Compound criteria detected - split into separate items');
  }

  if (!detection.hasUserStory && !detection.hasGherkin && !detection.hasCompound) {
    strengths.push('Clean format - no anti-patterns');
  }

  return { score: Math.max(0, Math.min(score, maxScore)), maxScore, issues, strengths };
}

/**
 * Score Completeness (20 pts max) - Criterion count, edge cases, error states
 * - Criterion count 3-7: +8
 * - Error/edge cases covered: +6
 * - Section completeness: +6
 */
export function scoreCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  const detection = detectCompleteness(text);
  const sections = detectSections(text);

  // Criterion count (8 pts)
  if (detection.criterionCount >= 3 && detection.criterionCount <= 7) {
    score += 8;
    strengths.push(`${detection.criterionCount} criteria - ideal count`);
  } else if (detection.criterionCount > 7) {
    score += 4;
    issues.push(`${detection.criterionCount} criteria - consider splitting issue (aim for 3-7)`);
  } else if (detection.criterionCount > 0) {
    score += 4;
    issues.push(`Only ${detection.criterionCount} criteria - add more for completeness`);
  } else {
    issues.push('No checkbox criteria found');
  }

  // Error/edge cases (6 pts)
  if (detection.hasErrorCases && detection.hasEdgeCases) {
    score += 6;
    strengths.push('Error and edge cases covered');
  } else if (detection.hasErrorCases || detection.hasEdgeCases) {
    score += 3;
    issues.push(detection.hasErrorCases ? 'Add edge case criteria' : 'Add error case criteria');
  } else {
    issues.push('Missing error/edge case criteria');
  }

  // Section completeness (6 pts)
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.9) {
    score += 6;
    strengths.push(`All ${sections.found.length} sections present`);
  } else if (sectionPercentage >= 0.5) {
    score += 3;
    issues.push(`Missing: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push(`Only ${sections.found.length}/${REQUIRED_SECTIONS.length} sections`);
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a Linear acceptance criteria document
 * @param {string} text - Document content
 * @returns {Object} Complete validation results
 */
export function validateDocument(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      clarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      testability: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const structure = scoreStructure(text);
  const clarity = scoreClarity(text);
  const testability = scoreTestability(text);
  const completeness = scoreCompleteness(text);

  // AI slop detection - acceptance criteria must be precise and testable
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (max -5)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  // Include slop deduction in completeness category so categories sum to total
  const adjustedCompleteness = {
    ...completeness,
    score: Math.max(0, completeness.score - slopDeduction),
    issues: slopDeduction > 0
      ? [...completeness.issues, `AI patterns detected (-${slopDeduction})`]
      : completeness.issues
  };

  const totalScore = Math.max(0,
    structure.score + clarity.score + testability.score + adjustedCompleteness.score
  );

  return {
    totalScore,
    structure,
    clarity,
    testability,
    completeness: adjustedCompleteness,
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
