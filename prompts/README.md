# Hello-World Prompt Templates

These are **boilerplate prompts with built-in AI slop detection** that provide a high-quality starting point for new genesis-derived projects.

## Files

| File | Phase | AI | Purpose |
|------|-------|-----|---------|
| `phase1.md` | Initial Draft | Claude Sonnet 4.5 | Generate first draft with anti-slop rules |
| `phase2.md` | Review | Gemini 2.5 Pro | Challenge assumptions, flag AI slop |
| `phase3.md` | Synthesis | Claude Sonnet 4.5 | Combine best of both, final slop sweep |

## AI Slop Prevention

All three prompts include comprehensive rules to prevent common AI output issues:

### Rule Categories

1. **Banned Vague Language** - "improve", "enhance", "optimize" require quantification
2. **Banned Filler Phrases** - "It's important to note", "Let's explore", etc.
3. **Banned Buzzwords** - "leverage", "synergy", "cutting-edge", etc.
4. **Banned Hedges** - "could potentially", "generally speaking", etc.
5. **Specificity Requirements** - Baseline + Target + Timeline for all metrics

### Pattern Source

These rules are derived from:
- The `detecting-ai-slop` skill in `~/.codex/skills/detecting-ai-slop/`
- The evolved "Mutations" in `product-requirements-assistant/prompts/`

## Customization

### Required Replacements

| Variable | Replace With |
|----------|--------------|
| `acceptance criteria` | Your document type (PRD, One-Pager, ADR, etc.) |
| `{{TITLE}}` | Form field for document title |
| `{{PROBLEMS}}` | Form field for problems/context |
| `{{CONTEXT}}` | Form field for additional context |
| `Acceptance Criteria Assistant` | Your project name |
| `{{GITHUB_PAGES_URL}}` | Your GitHub Pages URL |

### Add Domain-Specific Rules

Each document type may need additional rules:

- **PRD**: "Focus on Why and What, not How"
- **ADR**: "Include explicit alternatives comparison"
- **One-Pager**: "Maximum 500-700 words"
- **PR-FAQ**: "Quotes must include 2+ specific metrics"

## Usage

```bash
# Copy prompts to your new project
mkdir -p prompts
cp genesis/examples/hello-world/prompts/*.md prompts/

# Customize for your document type
sed -i '' 's/acceptance criteria/PRD/g' prompts/*.md
sed -i '' 's/Acceptance Criteria Assistant/My PRD Assistant/g' prompts/*.md
```

## Reference Implementations

See these working examples for domain-specific customizations:

| Project | Document Type | Key Additions |
|---------|---------------|---------------|
| `product-requirements-assistant` | PRD | Mutations 1-5, specificity checklist |
| `architecture-decision-record` | ADR | Vague vs Specific examples, alternatives |
| `pr-faq-assistant` | PR-FAQ | Quote scoring, metric requirements |
| `one-pager` | One-Pager | Word limits, Cost of Doing Nothing |

## Quality Validation

New projects should include JavaScript validators that check for:

1. **Section presence** - Required sections exist
2. **Metric format** - Baseline/Target/Timeline present
3. **Vague language** - Flag banned terms
4. **Completeness** - All sections filled

See `product-requirements-assistant/validator/` for a reference implementation.

