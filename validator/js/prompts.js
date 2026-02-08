/**
 * Prompt generation for LLM-based Acceptance Criteria scoring
 * ALIGNED WITH validator.js JavaScript scoring logic for Linear AC format
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} documentContent - The document content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(documentContent) {
  return `You are an expert evaluating Linear Acceptance Criteria.

Score this Acceptance Criteria using the following rubric (0-100 points total).
This rubric is EXACTLY aligned with the JavaScript validator - score consistently.

## SCORING RUBRIC (Linear AC Format)

### 1. Structure (25 points)
Score based on presence of required sections:
- **Summary section** (+10 pts): Has "## Summary" or equivalent header
- **Checkbox criteria** (+10 pts): Uses "- [ ]" format, 3+ criteria = full points, 1-2 = 5 pts
- **Out of Scope section** (+5 pts): Has "## Out of Scope" or equivalent header

### 2. Clarity (30 points)
Score based on testable language:
- **Action verbs** (+15 pts max): Count of verbs like implement, create, display, validate, handle, render, fetch, save, delete, navigate, authenticate
  - 5+ verbs = 15 pts, 3-4 = 10 pts, 1-2 = 5 pts, 0 = 0 pts
- **Measurable metrics** (+15 pts max): Numbers with units (ms, %, seconds, items, etc.)
  - 3+ metrics = 15 pts, 1-2 = 8 pts, 0 = 0 pts

### 3. Testability (25 points)
Start at 25, DEDUCT for issues:
- **Vague terms** (-5 to -15 pts): "works correctly", "handles properly", "appropriate", "intuitive", "seamless", "fast", "as expected", "user-friendly"
  - 0 vague terms = no deduction, 1-2 = -5 pts, 3+ = -15 pts
- **User story syntax** (-5 pts): "As a [user], I want..."
- **Gherkin syntax** (-5 pts): Given/When/Then patterns
- Minimum score is 0

### 4. Completeness (20 points)
- **Criterion count** (+8 pts): 3-7 checkboxes = 8 pts, otherwise 4 pts
- **Error/edge cases** (+6 pts): Mentions error, fail, invalid, empty, timeout, edge case, boundary, maximum, minimum
  - Both error AND edge = 6 pts, one or other = 3 pts
- **Section completeness** (+6 pts): All 3 sections present = 6 pts, 2 = 3 pts

## CALIBRATION GUIDANCE
- Be HARSH. Most AC documents score 40-60. Only exceptional ones score 80+.
- Score of 70+ means ready for development.
- Penalize vague language heavily - acceptance criteria MUST be binary verifiable.
- AI slop penalty: additional -1 to -5 pts for filler phrases, buzzwords, excessive hedging.

## DOCUMENT TO EVALUATE

\`\`\`
${documentContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Structure: [X]/25
[2-3 sentence justification - mention Summary, checkboxes, Out of Scope]

### Clarity: [X]/30
[2-3 sentence justification - mention action verb count, metric count]

### Testability: [X]/25
[2-3 sentence justification - list any vague terms or anti-patterns found]

### Completeness: [X]/20
[2-3 sentence justification - mention criterion count, error/edge coverage]

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
    ...(currentResult.structure?.issues || []),
    ...(currentResult.clarity?.issues || []),
    ...(currentResult.testability?.issues || []),
    ...(currentResult.completeness?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are an expert helping improve Linear Acceptance Criteria.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Structure: ${currentResult.structure?.score || 0}/25
- Clarity: ${currentResult.clarity?.score || 0}/30
- Testability: ${currentResult.testability?.score || 0}/25
- Completeness: ${currentResult.completeness?.score || 0}/20

Key issues detected:
${issuesList || '- None detected by automated scan'}

## DOCUMENT TO CRITIQUE

\`\`\`
${documentContent}
\`\`\`

## YOUR TASK

Help the author improve this Acceptance Criteria by asking clarifying questions.

## REQUIRED OUTPUT FORMAT

**Score Summary:** ${currentResult.totalScore}/100

**Top 3 Issues:**
1. [Most critical gap - be specific]
2. [Second most critical gap]
3. [Third most critical gap]

**Questions to Improve Your Acceptance Criteria:**
1. **[Question about missing/weak area]**
   _Why this matters:_ [How answering this improves the score]

2. **[Question about another gap]**
   _Why this matters:_ [Score impact]

3. **[Question about testability/edge cases]**
   _Why this matters:_ [Score impact]

(Provide 3-5 questions total, focused on the weakest dimensions)

**Quick Wins (fix these now):**
- [Specific fix that doesn't require user input]
- [Another immediate improvement]

<output_rules>
- Start directly with "**Score Summary:**" (no preamble)
- Do NOT include a revised document
- Only provide questions and quick wins
- Focus questions on: testability, edge cases, measurable outcomes
</output_rules>`;
}

/**
 * Generate rewrite prompt
 * @param {string} documentContent - The document content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(documentContent, currentResult) {
  return `You are an expert rewriting Linear Acceptance Criteria to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL DOCUMENT

\`\`\`
${documentContent}
\`\`\`

## REWRITE REQUIREMENTS (Linear AC Format)

Create complete, polished Acceptance Criteria that:
1. Has three sections: ## Summary, ## Acceptance Criteria, ## Out of Scope
2. Uses checkbox format: "- [ ] [criterion]"
3. Has 3-7 checkbox criteria (sweet spot)
4. Uses action verbs: implement, create, display, validate, handle, render, etc.
5. Includes measurable metrics with units (ms, %, seconds, items)
6. Avoids vague terms: "works correctly", "handles properly", "appropriate", "intuitive"
7. No user story syntax ("As a...") or Gherkin (Given/When/Then)
8. Covers error states and edge cases

<output_rules>
- Output ONLY the rewritten acceptance criteria
- NO preambles ("Here's the rewritten...")
- NO sign-offs ("Let me know if...")
- NO markdown code fences wrapping the output
- Ready to paste directly into Linear
</output_rules>`;
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

