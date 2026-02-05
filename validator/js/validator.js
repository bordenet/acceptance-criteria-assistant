/**
 * Acceptance Criteria Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Structure (25 pts) - Document organization and formatting
 * 2. Clarity (30 pts) - Precision, measurability, actionable language
 * 3. Business Value (25 pts) - ROI, stakeholder value, success criteria
 * 4. Completeness (20 pts) - Length, next steps, risk mitigation
 */

// ============================================================================
// Constants - CUSTOMIZE THESE FOR YOUR DOCUMENT TYPE
// ============================================================================

/**
 * Required sections for a complete document
 * Customize patterns and weights for your document type
 */
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(section.?1|heading.?1)/im, name: 'Section 1', weight: 2 },
  { pattern: /^#+\s*(section.?2|heading.?2)/im, name: 'Section 2', weight: 2 },
  { pattern: /^#+\s*(section.?3|heading.?3)/im, name: 'Section 3', weight: 2 },
  { pattern: /^#+\s*(section.?4|heading.?4)/im, name: 'Section 4', weight: 1 },
  { pattern: /^#+\s*(section.?5|heading.?5)/im, name: 'Section 5', weight: 1 },
];

// Dimension 1 patterns - CUSTOMIZE
const DIMENSION_1_PATTERNS = {
  sectionPattern: /^#+\s*(dimension.?1|section.?1)/im,
  contentPattern: /\b(keyword1|keyword2|keyword3)\b/gi,
  qualityPattern: /\b(quality|metric|measure)\b/gi,
};

// Dimension 2 patterns - CUSTOMIZE
const DIMENSION_2_PATTERNS = {
  sectionPattern: /^#+\s*(dimension.?2|section.?2)/im,
  contentPattern: /\b(keyword4|keyword5|keyword6)\b/gi,
  qualityPattern: /\b(quality|metric|measure)\b/gi,
};

// Dimension 3 patterns - CUSTOMIZE
const DIMENSION_3_PATTERNS = {
  sectionPattern: /^#+\s*(dimension.?3|section.?3)/im,
  contentPattern: /\b(keyword7|keyword8|keyword9)\b/gi,
  qualityPattern: /\b(quality|metric|measure)\b/gi,
};

// Dimension 4 patterns - CUSTOMIZE
const DIMENSION_4_PATTERNS = {
  sectionPattern: /^#+\s*(dimension.?4|section.?4)/im,
  contentPattern: /\b(keyword10|keyword11|keyword12)\b/gi,
  qualityPattern: /\b(quality|metric|measure)\b/gi,
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect dimension 1 content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectDimension1(text) {
  const hasSection = DIMENSION_1_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(DIMENSION_1_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(DIMENSION_1_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Dedicated section found',
      contentMatches.length > 0 && `${contentMatches.length} content matches`,
      qualityMatches.length > 0 && 'Quality indicators present'
    ].filter(Boolean)
  };
}

/**
 * Detect dimension 2 content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectDimension2(text) {
  const hasSection = DIMENSION_2_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(DIMENSION_2_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(DIMENSION_2_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Dedicated section found',
      contentMatches.length > 0 && `${contentMatches.length} content matches`,
      qualityMatches.length > 0 && 'Quality indicators present'
    ].filter(Boolean)
  };
}

/**
 * Detect dimension 3 content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectDimension3(text) {
  const hasSection = DIMENSION_3_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(DIMENSION_3_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(DIMENSION_3_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Dedicated section found',
      contentMatches.length > 0 && `${contentMatches.length} content matches`,
      qualityMatches.length > 0 && 'Quality indicators present'
    ].filter(Boolean)
  };
}

/**
 * Detect dimension 4 content in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectDimension4(text) {
  const hasSection = DIMENSION_4_PATTERNS.sectionPattern.test(text);
  const contentMatches = text.match(DIMENSION_4_PATTERNS.contentPattern) || [];
  const qualityMatches = text.match(DIMENSION_4_PATTERNS.qualityPattern) || [];

  return {
    hasSection,
    hasContent: contentMatches.length > 0,
    contentCount: contentMatches.length,
    hasQuality: qualityMatches.length > 0,
    indicators: [
      hasSection && 'Dedicated section found',
      contentMatches.length > 0 && `${contentMatches.length} content matches`,
      qualityMatches.length > 0 && 'Quality indicators present'
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
export function scoreDimension1(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const detection = detectDimension1(text);

  if (detection.hasSection && detection.hasContent) {
    score += 20;
    strengths.push('Strong dimension 1 content with dedicated section');
  } else if (detection.hasContent) {
    score += 10;
    issues.push('Dimension 1 content present but lacks dedicated section');
  } else {
    issues.push('Dimension 1 content missing or insufficient');
  }

  if (detection.hasQuality) {
    score += 10;
    strengths.push('Quality indicators present');
  } else {
    issues.push('Add quality indicators to strengthen this dimension');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Clarity (30 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDimension2(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  const detection = detectDimension2(text);

  if (detection.hasSection && detection.hasContent) {
    score += 15;
    strengths.push('Strong dimension 2 content with dedicated section');
  } else if (detection.hasContent) {
    score += 8;
    issues.push('Dimension 2 content present but lacks dedicated section');
  } else {
    issues.push('Dimension 2 content missing or insufficient');
  }

  if (detection.hasQuality) {
    score += 10;
    strengths.push('Quality indicators present');
  } else {
    issues.push('Add quality indicators to strengthen this dimension');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Business Value (25 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDimension3(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const detection = detectDimension3(text);

  if (detection.hasSection && detection.hasContent) {
    score += 15;
    strengths.push('Strong dimension 3 content with dedicated section');
  } else if (detection.hasContent) {
    score += 8;
    issues.push('Dimension 3 content present but lacks dedicated section');
  } else {
    issues.push('Dimension 3 content missing or insufficient');
  }

  if (detection.hasQuality) {
    score += 10;
    strengths.push('Quality indicators present');
  } else {
    issues.push('Add quality indicators to strengthen this dimension');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Completeness (20 pts max)
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDimension4(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  const detection = detectDimension4(text);
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
    strengths.push('Quality indicators present');
  } else {
    issues.push('Add quality indicators to strengthen this dimension');
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
      dimension1: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      dimension2: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension3: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension4: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const dimension1 = scoreDimension1(text);
  const dimension2 = scoreDimension2(text);
  const dimension3 = scoreDimension3(text);
  const dimension4 = scoreDimension4(text);

  const totalScore = dimension1.score + dimension2.score + dimension3.score + dimension4.score;

  return {
    totalScore,
    dimension1,
    dimension2,
    dimension3,
    dimension4
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
