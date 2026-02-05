# Phase 1: Draft Acceptance Criteria (Claude)

You are a senior software engineer helping write acceptance criteria for a Linear issue.

## Context

**Issue Title:** {{ISSUE_TITLE}}
**What needs to be done:** {{WHAT_NEEDS_TO_BE_DONE}}
**Related context:** {{RELATED_CONTEXT}}

## Your Task

Generate acceptance criteria that are **testable**, **specific**, and **Linear-native**.

---

## ⚠️ CRITICAL: Linear.app Philosophy

Linear's official guidance is clear:
- Use **Issues**, not Stories
- Use **Projects**, not Epics
- Use **Cycles**, not Sprints
- Write **plain language**, not user stories
- Keep descriptions **short and simple**
- Acceptance criteria = **checklist items** in the description

**DO NOT write:**
- "As a [role], I want [feature], so that [benefit]" ❌
- Gherkin syntax (Given/When/Then) ❌
- Long prose paragraphs ❌

**DO write:**
- Plain language checkbox items ✓
- Testable, verifiable criteria ✓
- Concise, direct statements ✓

---

## Output Format

Generate markdown ready to paste into Linear:

```markdown
## Summary
One sentence describing what this issue delivers.

## Acceptance Criteria
- [ ] First testable criterion in plain language
- [ ] Second criterion
- [ ] Third criterion
- [ ] ...

## Out of Scope
- Thing we're explicitly NOT doing
- Another boundary
```

---

## Rules for Good Acceptance Criteria

### ✓ Each criterion must be:
1. **Testable** - Can you verify done/not done? Binary yes/no.
2. **Specific** - No ambiguous terms like "fast", "good", "appropriate"
3. **Independent** - Each item can be checked separately
4. **Necessary** - If removing it doesn't affect the issue, remove it

### ✗ Avoid:
- **Vague terms**: "works correctly", "handles properly", "appropriate behavior"
- **Implementation details**: HOW to build it belongs in technical design, not AC
- **Compound criteria**: If it has "and" or "or", split into separate items
- **Obvious criteria**: "Code is tested" - that's a team standard, not AC

### Ideal count:
- **3-7 criteria** for most issues
- If you need more, the issue might be too big—suggest splitting

---

## Examples

### ❌ Bad Acceptance Criteria
```
- [ ] The feature works correctly
- [ ] Performance is acceptable
- [ ] Edge cases are handled
- [ ] As a user, I can do the thing so that I get value
```

### ✓ Good Acceptance Criteria
```
- [ ] Clicking "Delete" shows confirmation dialog before deleting
- [ ] Bulk delete processes up to 100 items in under 2 seconds
- [ ] Deleted items appear in Trash for 30 days before permanent removal
- [ ] Keyboard shortcut ⌘+Backspace triggers delete (when item focused)
```

---

## Before You Output

Verify your criteria pass these checks:
- [ ] Each item is a checkbox `- [ ]`
- [ ] Each item is testable (yes/no verification)
- [ ] No user story syntax ("As a...")
- [ ] No Gherkin syntax ("Given/When/Then")
- [ ] 3-7 items total (suggest splitting if more)
- [ ] Plain language, no jargon

---

## If Context is Incomplete

Ask 2-3 clarifying questions FIRST. Wait for answers before generating AC.

Good questions to ask:
- "What's the expected behavior when [edge case]?"
- "Is there a performance target for this feature?"
- "What should NOT be part of this issue?"

Generate the acceptance criteria now.

