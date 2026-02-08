# ADVERSARIAL REVIEW: acceptance-criteria-assistant

## CONTEXT

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for an Acceptance Criteria assistant tool. This tool generates **Linear-native** acceptance criteria in checkbox format.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates initial AC draft
2. **Phase 2 (Gemini)** - Reviews for testability and completeness
3. **Phase 3 (Claude)** - Synthesizes final AC
4. **LLM Scoring (prompts.js)** - Sends AC to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL: LINEAR PHILOSOPHY

Linear's official guidance is clear:
- Use **Issues**, not Stories
- Write **plain language**, not user stories
- Acceptance criteria = **checklist items** (`- [ ]` syntax)
- **DO NOT** use Gherkin syntax (Given/When/Then)
- **DO NOT** use user story syntax (As a... I want...)

---

## CURRENT TAXONOMY (4 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight Description |
|-----------|------------|--------------|-------------------|
| Structure | 25 pts | 25 pts | Summary, AC checklist, Out of Scope |
| Clarity | 30 pts | 30 pts | Action verbs, measurable metrics |
| Testability | 25 pts | 25 pts | Binary verifiable, no vague terms |
| Completeness | 20 pts | 20 pts | Criterion count, edge cases, errors |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (114 lines)

**Key Elements:**
- Linear-native format: checkbox items, not Gherkin
- Output: Summary, Acceptance Criteria (3-7 items), Out of Scope
- Each criterion must be: Testable, Specific, Independent, Necessary
- Banned: vague terms, implementation details, compound criteria
- Ideal count: 3-7 criteria

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (189 lines)

**Scoring Rubric:**

### 1. Structure (25 points)
- Summary section (+10 pts)
- Checkbox criteria (+10 pts): 3+ = full, 1-2 = 5 pts
- Out of Scope section (+5 pts)

### 2. Clarity (30 points)
- Action verbs (+15 pts): implement, create, display, validate, etc.
- Measurable metrics (+15 pts): numbers with units (ms, %, seconds)

### 3. Testability (25 points)
- Start at 25, DEDUCT for vague terms
- Vague terms (-5 to -15): "works correctly", "handles properly", "appropriate"
- User story syntax (-5 pts)
- Gherkin syntax (-5 pts)

### 4. Completeness (20 points)
- Criterion count (+8 pts): 3-7 = full
- Error/edge cases (+6 pts)
- Section completeness (+6 pts)

---

## COMPONENT 5: validator.js (JavaScript Scoring Logic)

See: `validator/js/validator.js` (488 lines)

**Key Patterns:**

### REQUIRED_SECTIONS
```javascript
{ pattern: /^#+\s*summary/im, name: 'Summary', weight: 3 }
{ pattern: /^#+\s*acceptance\s+criteria/im, name: 'Acceptance Criteria', weight: 4 }
{ pattern: /^#+\s*out\s+of\s+scope/im, name: 'Out of Scope', weight: 2 }
```

### TESTABILITY_PATTERNS (Banned Terms)
```javascript
vagueTerms: /\b(works?\s+correctly|handles?\s+properly|appropriate(ly)?|intuitive(ly)?|user[- ]friendly|seamless(ly)?|fast|slow|good|bad|as\s+expected)\b/gi
userStoryPattern: /\bas\s+a\s+\w+,?\s+i\s+want/i
gherkinPattern: /\b(given|when|then)\s+/i
```

### CLARITY_PATTERNS
```javascript
actionVerbs: /\b(implement|create|build|render|handle|display|show|hide|enable|disable|validate|submit|load|save|delete|update|fetch|send)\b/gi
metricsPattern: /\d+(?:\.\d+)?\s*(ms|milliseconds?|seconds?|%|percent|items?|users?)/gi
```

---

# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. TAXONOMY ALIGNMENT
Do phase1.md's sections match validator.js patterns?

| Phase1.md Section | validator.js Pattern | Match? |
|-------------------|---------------------|--------|
| Summary | `/^#+\s*summary/im` | ? |
| Acceptance Criteria | `/^#+\s*acceptance\s+criteria/im` | ? |
| Out of Scope | `/^#+\s*out\s+of\s+scope/im` | ? |

### 2. CHECKBOX FORMAT
Phase1.md specifies `- [ ]` format. Does validator.js:
- ✅ Detect checkboxes with `/^-\s*\[\s*[x ]?\s*\]/gim`?
- ✅ Count them for scoring?

### 3. ANTI-PATTERN DETECTION
Phase1.md bans user stories and Gherkin. Does validator.js:
- ✅ Detect "As a [user], I want..."?
- ✅ Detect "Given/When/Then"?
- ✅ Penalize in score?

### 4. VAGUE TERM DETECTION
prompts.js lists vague terms. Does validator.js pattern match ALL of them?

| prompts.js Lists | validator.js Detects | Gap? |
|------------------|---------------------|------|
| works correctly | `works?\s+correctly` | ? |
| handles properly | `handles?\s+properly` | ? |
| intuitive | `intuitive(ly)?` | ? |
| seamless | `seamless(ly)?` | ? |
| fast | `fast` | ? |
| as expected | `as\s+expected` | ? |

### 5. ACTION VERB ALIGNMENT
prompts.js lists: implement, create, display, validate, handle, render, fetch, save, delete, navigate, authenticate

Does validator.js detect all of these?

### 6. SLOP DETECTION
Does validator.js import and apply slop penalties?

```bash
grep -n "getSlopPenalty\|calculateSlopScore\|slop" validator.js
```

---

## DELIVERABLES

### 1. CRITICAL FAILURES
For each issue: Issue, Severity, Evidence, Fix

### 2. ALIGNMENT TABLE
| Component | Dimension | Weight | Aligned? | Issue |

### 3. GAMING VULNERABILITIES
- Keyword stuffing opportunities
- Pattern matching exploits

### 4. RECOMMENDED FIXES (P0/P1/P2)

---

**VERIFY CLAIMS. Evidence before assertions.**

