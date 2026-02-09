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
  // Measurable metrics with units - expanded to include common technical units
  metricsPattern: /(?:≤|≥|<|>|=|under|within|less than|more than|at least|at most)?\s*\d+(?:\.\d+)?\s*(ms|milliseconds?|seconds?|s|%|percent|kb|mb|gb|tb|px|items?|users?|requests?|errors?|days?|hours?|minutes?|calls?|connections?|records?|retries?|attempts?|rows?|entries?|results?|pages?|clicks?|taps?|events?)/gi,
  // Specific thresholds
  thresholdPattern: /\b(exactly|at least|at most|maximum|minimum|up to|no more than|no less than)\s+\d+/gi,
};

// Testability patterns - vague terms to flag
const TESTABILITY_PATTERNS = {
  // Vague terms that make criteria untestable (BANNED)
  vagueTerms: /\b(works?\s+correctly|handles?\s+properly|appropriate(ly)?|intuitive(ly)?|user[- ]friendly|seamless(ly)?|fast|slow|good|bad|nice|better|worse|adequate(ly)?|sufficient(ly)?|reasonable|reasonably|acceptable|properly|correctly|as\s+expected|as\s+needed)\b/gi,
  // Anti-patterns: user story syntax - catches "As a/an/the [role], I want"
  // Fixed to catch multi-word roles like "As an administrator I want" or "As the registered user, I want"
  userStoryPattern: /\bas\s+(?:a|an|the)\s+[\w\s]+?,?\s*i\s+want/i,
  // Anti-patterns: Gherkin syntax - catches:
  // 1. Traditional Gherkin: lines starting with Given/When/Then
  // 2. Checkbox Gherkin: "- [ ] Given a user..."
  // Avoids false positives on "when the button is clicked" mid-sentence
  gherkinPattern: /(?:^|\n)\s*(?:-\s*\[\s*[x ]?\s*\]\s*)?(given|when|then)\s+/im,
  // Compound criteria (should be split) - catches ANY "and" or "or" per phase1.md
  compoundPattern: /\b(and|or)\b/i,
  // Implementation details - tech stack keywords that belong in technical design, not AC
  implementationPattern: /\b(postgres(?:ql)?|mysql|mongodb|redis|sql|react|vue|angular|svelte|tailwind|css|scss|sass|aws|lambda|s3|ec2|gcp|azure|docker|kubernetes|k8s|api\s+endpoint|microservice|graphql|rest\s+api|webpack|vite|npm|yarn)\b/gi,
};

// Completeness patterns - edge cases and error states
const COMPLETENESS_PATTERNS = {
  // Error/edge case indicators
  errorCasePattern: /\b(error|fail|invalid|empty|null|undefined|missing|timeout|offline|denied|unauthorized|forbidden|not found|exception)\b/gi,
  // Edge case indicators - tightened to avoid false positives on "first time", "none of"
  // Removed standalone "first", "last", "none" - too many false positives
  edgeCasePattern: /\b(edge\s+case|boundary\s+condition|boundary\s+value|upper\s+limit|lower\s+limit|maximum\s+value|minimum\s+value|empty\s+state|no\s+results|only\s+one|zero\s+items?|overflow|underflow|race\s+condition|concurrent|simultaneous)\b/gi,
  // Permissions/auth indicators
  permissionPattern: /\b(permission|role|admin|user|guest|authenticated|logged in|logged out)\b/gi,
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect structure in Linear AC format (Summary, AC checkboxes, Out of Scope)
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
      thresholdMatches.length > 0 && 'Specific thresholds defined'
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
  const implementationMatches = text.match(TESTABILITY_PATTERNS.implementationPattern) || [];

  return {
    vagueTermCount: vagueMatches.length,
    vagueTerms: [...new Set(vagueMatches.map(m => m.toLowerCase()))],
    hasUserStoryAntiPattern: hasUserStory,
    hasGherkinAntiPattern: hasGherkin,
    hasCompoundCriteria: hasCompound,
    hasImplementationDetails: implementationMatches.length > 0,
    implementationTerms: [...new Set(implementationMatches.map(m => m.toLowerCase()))],
    hasIssues: vagueMatches.length > 0 || hasUserStory || hasGherkin || implementationMatches.length > 0,
    indicators: [
      vagueMatches.length > 0 && `${vagueMatches.length} vague terms found`,
      hasUserStory && 'User story syntax detected (use checkboxes instead)',
      hasGherkin && 'Gherkin syntax detected (use simple checkboxes)',
      hasCompound && 'Compound criteria found (split into separate items)',
      implementationMatches.length > 0 && `Implementation details found: ${implementationMatches.slice(0, 3).join(', ')}`
    ].filter(Boolean)
  };
}

/**
 * Detect completeness - criterion count, error cases, edge cases
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectCompleteness(text) {
  const checkboxMatches = text.match(STRUCTURE_PATTERNS.checkboxPattern) || [];
  const errorCaseMatches = text.match(COMPLETENESS_PATTERNS.errorCasePattern) || [];
  const edgeCaseMatches = text.match(COMPLETENESS_PATTERNS.edgeCasePattern) || [];
  const permissionMatches = text.match(COMPLETENESS_PATTERNS.permissionPattern) || [];

  return {
    criterionCount: checkboxMatches.length,
    hasErrorCases: errorCaseMatches.length > 0,
    errorCaseCount: errorCaseMatches.length,
    hasEdgeCases: edgeCaseMatches.length > 0,
    edgeCaseCount: edgeCaseMatches.length,
    hasPermissions: permissionMatches.length > 0,
    indicators: [
      checkboxMatches.length >= 3 && checkboxMatches.length <= 7 && 'Good criterion count (3-7)',
      checkboxMatches.length < 3 && 'Too few criteria (add more)',
      checkboxMatches.length > 7 && 'Too many criteria (consider splitting)',
      errorCaseMatches.length > 0 && 'Error cases covered',
      edgeCaseMatches.length > 0 && 'Edge cases addressed'
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
 * Score Structure (25 pts max) - Summary, AC checkboxes, Out of Scope
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
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
    issues.push('Add a Summary section describing the feature/change');
  }

  // Checkbox criteria (10 pts)
  if (detection.checkboxCount >= 3) {
    score += 10;
    strengths.push(`${detection.checkboxCount} checkbox criteria found`);
  } else if (detection.checkboxCount > 0) {
    score += 5;
    issues.push('Add more checkbox criteria (recommend 3-7)');
  } else {
    issues.push('Missing checkbox criteria - use "- [ ]" format');
  }

  // Out of Scope section (5 pts)
  if (detection.hasOutOfScope) {
    score += 5;
    strengths.push('Out of Scope section present');
  } else {
    issues.push('Add Out of Scope section to set clear boundaries');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Clarity (30 pts max) - Action verbs and measurable metrics
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
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
    strengths.push(`${detection.actionVerbCount} action verbs for testable behavior`);
  } else if (detection.actionVerbCount >= 3) {
    score += 10;
    strengths.push(`${detection.actionVerbCount} action verbs found`);
  } else if (detection.actionVerbCount > 0) {
    score += 5;
    issues.push('Add more action verbs (implement, create, display, validate, etc.)');
  } else {
    issues.push('Missing action verbs - criteria should describe testable behavior');
  }

  // Measurable metrics (15 pts max)
  if (detection.metricsCount >= 3) {
    score += 15;
    strengths.push(`${detection.metricsCount} measurable metrics with units`);
  } else if (detection.metricsCount >= 1) {
    score += 8;
    issues.push('Add more measurable metrics (time limits, percentages, counts)');
  } else {
    issues.push('No measurable metrics - add specific numbers with units');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Testability (25 pts max) - No vague terms, no anti-patterns
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreTestability(text) {
  const issues = [];
  const strengths = [];
  let score = 25; // Start with full score, deduct for issues
  const maxScore = 25;

  const detection = detectTestability(text);

  // Deduct for vague terms (up to -15 pts)
  if (detection.vagueTermCount === 0) {
    strengths.push('No vague terms - criteria are specific');
  } else if (detection.vagueTermCount <= 2) {
    score -= 5;
    issues.push(`Remove vague terms: ${detection.vagueTerms.slice(0, 2).join(', ')}`);
  } else {
    score -= 15;
    issues.push(`${detection.vagueTermCount} vague terms found: ${detection.vagueTerms.slice(0, 3).join(', ')}`);
  }

  // Deduct for user story anti-pattern (-5 pts)
  if (detection.hasUserStoryAntiPattern) {
    score -= 5;
    issues.push('Remove user story syntax - use simple checkboxes instead');
  }

  // Deduct for Gherkin anti-pattern (-5 pts)
  if (detection.hasGherkinAntiPattern) {
    score -= 5;
    issues.push('Remove Given/When/Then syntax - use simple checkboxes');
  }

  // Deduct for compound criteria (-3 pts) - from adversarial review
  if (detection.hasCompoundCriteria) {
    score -= 3;
    issues.push('Split compound criteria (and/or) into separate items');
  }

  // Deduct for implementation details (-5 pts) - from adversarial review
  // AC should describe WHAT, not HOW (tech stack belongs in technical design)
  if (detection.hasImplementationDetails) {
    score -= 5;
    issues.push(`Remove implementation details: ${detection.implementationTerms.slice(0, 3).join(', ')}`);
  }

  // Positive indicator if clean
  if (!detection.hasIssues && !detection.hasCompoundCriteria) {
    strengths.push('All criteria are binary verifiable');
  }

  return { score: Math.max(0, Math.min(score, maxScore)), maxScore, issues, strengths };
}

/**
 * Score Completeness (20 pts max) - Criterion count, error/edge cases
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

  // Criterion count (8 pts) - ideal is 3-7
  if (detection.criterionCount >= 3 && detection.criterionCount <= 7) {
    score += 8;
    strengths.push(`${detection.criterionCount} criteria (ideal range 3-7)`);
  } else if (detection.criterionCount > 7) {
    score += 4;
    issues.push('Too many criteria - consider splitting into smaller stories');
  } else if (detection.criterionCount > 0) {
    score += 4;
    issues.push('Add more criteria (recommend 3-7 per story)');
  } else {
    issues.push('No checkbox criteria found');
  }

  // Error/edge cases covered (6 pts)
  if (detection.hasErrorCases && detection.hasEdgeCases) {
    score += 6;
    strengths.push('Error states and edge cases addressed');
  } else if (detection.hasErrorCases || detection.hasEdgeCases) {
    score += 3;
    issues.push('Consider adding more error/edge case handling');
  } else {
    issues.push('Add error handling and edge case criteria');
  }

  // Section completeness (6 pts)
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.9) {
    score += 6;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} sections present`);
  } else if (sectionPercentage >= 0.6) {
    score += 3;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push('Add required sections: Summary, Acceptance Criteria, Out of Scope');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a document and return comprehensive scoring results
 * @param {string} text - Document content
 * @returns {Object} Complete validation results with dimension mappings for app.js
 */
export function validateDocument(text) {
  const emptyResult = { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] };

  if (!text || typeof text !== 'string') {
    const structure = { ...emptyResult, maxScore: 25 };
    const clarity = { ...emptyResult, maxScore: 30 };
    const testability = { ...emptyResult, maxScore: 25 };
    const completeness = { ...emptyResult, maxScore: 20 };

    return {
      totalScore: 0,
      structure,
      clarity,
      testability,
      completeness,
      // Alias for project-view.js compatibility (expects businessValue, we have testability)
      businessValue: testability,
      // Dimension mappings for app.js compatibility
      dimension1: structure,
      dimension2: clarity,
      dimension3: testability,
      dimension4: completeness
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
    // Apply penalty to total score (aligned with inline validator)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    structure.score + clarity.score + testability.score + completeness.score - slopDeduction
  );

  return {
    totalScore,
    structure,
    clarity,
    testability,
    completeness,
    // Alias for project-view.js compatibility (expects businessValue, we have testability)
    businessValue: testability,
    // Dimension mappings for app.js compatibility
    dimension1: structure,
    dimension2: clarity,
    dimension3: testability,
    dimension4: completeness,
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
export function getScoreColor(score, maxScore = 100) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-green-400';
  if (percentage >= 60) return 'text-yellow-400';
  if (percentage >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get human-readable label for score
 * @param {number} score - Score value (0-100)
 * @returns {string} Label for the score
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}
