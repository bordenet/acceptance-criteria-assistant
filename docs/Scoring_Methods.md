# Acceptance Criteria Assistant Scoring Methods

This document describes the scoring methodology used by the Acceptance Criteria Validator.

## Overview

The validator scores acceptance criteria documents on a **100-point scale** across four dimensions. The scoring emphasizes testability, with deductions for vague language and anti-patterns (user stories, Gherkin, compound criteria).

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Structure** | 25 | Summary section, checkboxes, out-of-scope |
| **Clarity** | 30 | Action verbs, measurable metrics |
| **Testability** | 25 | No vague terms, no anti-patterns (deduction-based) |
| **Completeness** | 20 | Criterion count, error/edge cases |

## Dimension Details

### 1. Structure (25 pts)

**Scoring Breakdown:**
- Summary section present: 10 pts
- Checkbox format used: 10 pts (5+ checkboxes) or 5 pts (1-4)
- Out-of-scope section present: 5 pts

**Detection Patterns:**
```javascript
sectionPattern: /^#+\s*summary/im
checkboxPattern: /^-\s*\[\s*[x ]?\s*\]/gim
outOfScopePattern: /^#+\s*out\s+of\s+scope/im
```

### 2. Clarity (30 pts)

**Scoring Breakdown:**
- Action verbs (5+): 15 pts
- Action verbs (3-4): 10 pts
- Action verbs (1-2): 5 pts
- Measurable metrics with units: 15 pts

**Action Verb Detection:**
```javascript
actionVerbs: /\b(implement|create|build|render|handle|display|show|hide|enable|disable|validate|submit|load|save|delete|update|fetch|send|receive|trigger|navigate|redirect|authenticate|authorize)\b/gi
```

**Metrics Pattern (with units):**
```javascript
metricsPattern: /(?:≤|≥|<|>|=|under|within)?\s*\d+(?:\.\d+)?\s*(ms|milliseconds?|seconds?|s|%|percent|kb|mb|gb|px|items?|users?|requests?|errors?|days?|hours?|minutes?|calls?|connections?|retries?|attempts?)/gi
```

### 3. Testability (25 pts) — Deduction-Based

**Starts at 25 pts, deductions applied:**

| Issue | Penalty | Detection |
|-------|---------|-----------|
| Vague terms (1-2) | -5 pts | "works correctly", "handles properly" |
| Vague terms (3-5) | -10 pts | "appropriate", "intuitive", "seamless" |
| Vague terms (6+) | -15 pts | "fast", "good", "as expected" |
| User story pattern | -5 pts | "As a [role], I want..." |
| Gherkin syntax | -5 pts | "Given... When... Then..." |
| Compound criteria | -3 pts | "X and Y and Z" in single criterion |
| Implementation details | -2 pts | "use SQL", "call API", etc. |

**Vague Terms Detected:**
```javascript
vagueTerms: /\b(works?\s+correctly|handles?\s+properly|appropriate(ly)?|intuitive(ly)?|user[- ]friendly|seamless(ly)?|fast|slow|good|bad|nice|better|worse|adequate(ly)?|sufficient(ly)?|reasonable|acceptable|as\s+expected|as\s+needed)\b/gi
```

**Anti-Patterns:**
```javascript
// User story (catches multi-word roles)
userStoryPattern: /\bas\s+(?:a|an|the)\s+[\w\s]+?,?\s*i\s+want/i

// Gherkin
gherkinPattern: /\b(given|when|then)\b.*\b(given|when|then)\b/i

// Compound
compoundPattern: /\band\b.*\band\b/i
```

### 4. Completeness (20 pts)

**Scoring Breakdown:**
- Criterion count 3-7: 8 pts (ideal range)
- Criterion count 1-2 or 8-10: 4 pts
- Criterion count 11+: 2 pts (too many = scope creep)
- Error cases covered: 6 pts
- Edge cases covered: 6 pts

**Error/Edge Case Detection:**
```javascript
errorCasePattern: /\b(error|fail|invalid|empty|null|undefined|missing|timeout|offline|denied|unauthorized|forbidden|not found|exception)\b/gi

// Tightened to avoid false positives
edgeCasePattern: /\b(edge\s+case|boundary\s+condition|boundary\s+value|upper\s+limit|lower\s+limit|maximum\s+value|minimum\s+value|empty\s+state|no\s+results|only\s+one|zero\s+items?|overflow|underflow|race\s+condition|concurrent|simultaneous)\b/gi
```

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "Works correctly under all conditions" | Vague term detection flags "works correctly" |
| User story format to inflate length | User story anti-pattern penalty applies |
| Gherkin BDD format | Gherkin anti-pattern penalty applies |
| "Fast response time" without number | Missing threshold = vague term |
| 20+ checkbox criteria | Excessive count signals scope creep |

## Calibration Notes

### Testability Is King
Acceptance criteria exist to be tested. Every criterion must be independently verifiable by QA. Vague language like "handles properly" cannot be tested.

### Anti-Pattern Philosophy
User stories and Gherkin are valid formats—but not for acceptance criteria. ACs are the test specification, not the requirement narrative.

### Goldilocks Criterion Count
- Too few (1-2): Likely missing edge cases
- Just right (3-7): Focused, testable scope
- Too many (11+): Scope creep, needs decomposition

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | QA-ready - clear, testable, complete |
| 60-79 | B | Good - minor clarity improvements |
| 40-59 | C | Fair - vague language or missing cases |
| 20-39 | D | Poor - anti-patterns or untestable |
| 0-19 | F | Not AC - rewrite from scratch |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

