/**
 * Prompt generation for LLM-based Acceptance Criteria scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} documentContent - The document content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(documentContent) {
  return `You are an expert evaluating an Acceptance Criteria document.

Score this Acceptance Criteria using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Structure (25 points)
- Document organization and formatting
- Clear heading hierarchy
- Proper use of bullets and tables

### 2. Clarity (30 points)
- Precision and avoidance of vague qualifiers
- Measurability with specific metrics
- Actionable language with clear verbs

### 3. Business Value (25 points)
- ROI and cost-benefit analysis
- Stakeholder value articulation
- Success criteria definition

### 4. Completeness (20 points)
- Adequate length and depth
- Next steps and action items
- Risk identification and mitigation

## CALIBRATION GUIDANCE
- Be HARSH. Most documents score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for stakeholder review.
- Deduct points for vague language, missing sections, or unclear structure.
- Reward specificity, clarity, and completeness.

## DOCUMENT TO EVALUATE

\`\`\`
${documentContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Structure: [X]/25
[2-3 sentence justification]

### Clarity: [X]/30
[2-3 sentence justification]

### Business Value: [X]/25
[2-3 sentence justification]

### Completeness: [X]/20
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} documentContent - The document content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(documentContent, currentResult) {
  const issuesList = [
    ...(currentResult.dimension1?.issues || []),
    ...(currentResult.dimension2?.issues || []),
    ...(currentResult.dimension3?.issues || []),
    ...(currentResult.dimension4?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are an expert providing detailed feedback on Acceptance Criteria.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Structure: ${currentResult.dimension1?.score || 0}/25
- Clarity: ${currentResult.dimension2?.score || 0}/30
- Business Value: ${currentResult.dimension3?.score || 0}/25
- Completeness: ${currentResult.dimension4?.score || 0}/20

Key issues detected:
${issuesList || '- None detected by automated scan'}

## DOCUMENT TO CRITIQUE

\`\`\`
${documentContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall document quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Revised Document** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Make it ready for stakeholder review.`;
}

/**
 * Generate rewrite prompt
 * @param {string} documentContent - The document content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(documentContent, currentResult) {
  return `You are an expert rewriting Acceptance Criteria to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL DOCUMENT

\`\`\`
${documentContent}
\`\`\`

## REWRITE REQUIREMENTS

Create complete, polished Acceptance Criteria that:
1. Scores 85+ across all dimensions
2. Has all required sections clearly organized
3. Uses clear, specific language
4. Avoids vague qualifiers and jargon
5. Is concise and stakeholder-focused

Output ONLY the rewritten document in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}

