/**
 * Prompt generation for LLM-based {{DOCUMENT_TYPE}} scoring
 *
 * TEMPLATE: Replace {{DOCUMENT_TYPE}}, {{DIMENSION_1_NAME}}, etc. with your document type specifics.
 * Example: "One-Pager" -> "Job Description", "Problem Clarity" -> "Inclusive Language"
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} documentContent - The document content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(documentContent) {
  return `You are an expert evaluating a {{DOCUMENT_TYPE}} document.

Score this {{DOCUMENT_TYPE}} using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. {{DIMENSION_1_NAME}} ({{DIMENSION_1_POINTS}} points)
{{DIMENSION_1_CRITERIA}}

### 2. {{DIMENSION_2_NAME}} ({{DIMENSION_2_POINTS}} points)
{{DIMENSION_2_CRITERIA}}

### 3. {{DIMENSION_3_NAME}} ({{DIMENSION_3_POINTS}} points)
{{DIMENSION_3_CRITERIA}}

### 4. {{DIMENSION_4_NAME}} ({{DIMENSION_4_POINTS}} points)
{{DIMENSION_4_CRITERIA}}

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

### {{DIMENSION_1_NAME}}: [X]/{{DIMENSION_1_POINTS}}
[2-3 sentence justification]

### {{DIMENSION_2_NAME}}: [X]/{{DIMENSION_2_POINTS}}
[2-3 sentence justification]

### {{DIMENSION_3_NAME}}: [X]/{{DIMENSION_3_POINTS}}
[2-3 sentence justification]

### {{DIMENSION_4_NAME}}: [X]/{{DIMENSION_4_POINTS}}
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

  return `You are an expert providing detailed feedback on a {{DOCUMENT_TYPE}}.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- {{DIMENSION_1_NAME}}: ${currentResult.dimension1?.score || 0}/{{DIMENSION_1_POINTS}}
- {{DIMENSION_2_NAME}}: ${currentResult.dimension2?.score || 0}/{{DIMENSION_2_POINTS}}
- {{DIMENSION_3_NAME}}: ${currentResult.dimension3?.score || 0}/{{DIMENSION_3_POINTS}}
- {{DIMENSION_4_NAME}}: ${currentResult.dimension4?.score || 0}/{{DIMENSION_4_POINTS}}

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
  return `You are an expert rewriting a {{DOCUMENT_TYPE}} to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL DOCUMENT

\`\`\`
${documentContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished {{DOCUMENT_TYPE}} that:
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

