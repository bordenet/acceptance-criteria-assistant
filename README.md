# Acceptance Criteria Assistant

Write acceptance criteria with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/acceptance-criteria-assistant?style=social)](https://github.com/bordenet/acceptance-criteria-assistant)

**Try it**: [Assistant](https://bordenet.github.io/acceptance-criteria-assistant/) · [Validator](https://bordenet.github.io/acceptance-criteria-assistant/validator/)

> **What is Acceptance Criteria?** Acceptance criteria are specific, testable conditions that a feature must satisfy before being accepted. They define the boundaries of a user story, clarify requirements, and provide pass/fail checkpoints for QA. Good AC follows the "Given-When-Then" format and eliminates ambiguity.

[![CI](https://github.com/bordenet/acceptance-criteria-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/acceptance-criteria-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/acceptance-criteria-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/acceptance-criteria-assistant)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/acceptance-criteria-assistant/)
2. Enter user story, context, and edge cases
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You provide context. Claude drafts your acceptance criteria.

**Phase 2** — Gemini reviews the draft: What's missing? What's unclear? What's wrong?

**Phase 3** — Claude takes the original draft plus Gemini's critique and produces a final version.

---

## Scoring Methodology

The validator scores acceptance criteria on a 100-point scale across four dimensions. This scoring system is designed to detect common failure modes in AC authoring while remaining resistant to gaming through keyword stuffing.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Structure** | 25 pts | Enforces the Linear AC format (Summary, Criteria, Out of Scope) |
| **Clarity** | 30 pts | Measures actionability through verb density and metric presence |
| **Testability** | 25 pts | Penalizes vague language that prevents pass/fail determination |
| **Completeness** | 20 pts | Validates coverage of edge cases and error conditions |

### Why These Weights?

**Structure (25 pts)** receives moderate weight because format compliance is necessary but not sufficient. A well-structured AC with vague content is still unusable. The validator checks for:
- Summary section presence (10 pts)
- Checkbox format with `- [ ]` syntax (10 pts)
- Out of Scope section (5 pts)

**Clarity (30 pts)** is the highest-weighted category because unclear AC is the primary cause of implementation defects. The validator measures:
- **Action verb density**: Counts verbs like `implement`, `validate`, `render`, `fetch`. 5+ verbs = 15 pts, 3-4 = 10 pts, 1-2 = 5 pts.
- **Measurable metrics**: Numbers with units (ms, %, seconds). 3+ metrics = 15 pts, 1-2 = 8 pts.

**Testability (25 pts)** uses a penalty-based approach rather than positive detection. This is intentional—vague language is easier to detect than precise language. The validator penalizes:
- **Vague terms** (-5 to -15 pts): "works correctly", "handles properly", "intuitive", "seamless", "as expected"
- **User story syntax** (-5 pts): "As a [user], I want..." format is discouraged in favor of direct criteria
- **Gherkin syntax** (-5 pts): Given/When/Then is penalized to enforce Linear's checkbox format

**Completeness (20 pts)** validates that the AC covers the full problem space:
- Criterion count (8 pts): 3-7 checkboxes is optimal
- Error/edge cases (6 pts): Must mention error, fail, invalid, empty, timeout, edge case, boundary
- Section completeness (6 pts): All three sections present

### Adversarial Robustness

The scoring system is designed to resist common gaming strategies:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Keyword stuffing action verbs | Verb count is capped; diminishing returns above 5 |
| Adding fake metrics | Metrics must include units; raw numbers don't count |
| Avoiding vague terms by omission | Clarity score requires positive verb/metric presence |
| Padding with extra criteria | Criterion count is penalized outside 3-7 range |
| Single "and" compound criteria | Regex catches ANY "and" or "or" per phase1.md |
| User story with multi-word roles | Pattern catches "As an administrator I want" and "As the registered user" |
| Gherkin mid-sentence ("when clicked") | Pattern only triggers on line-start Gherkin, not mid-sentence |
| Tech stack in AC ("Use PostgreSQL") | Implementation pattern detects 30+ tech keywords (-5 pts) |
| Fake edge cases ("first time users") | Edge case pattern requires compound phrases like "edge case", "boundary condition" |
| Metrics without units ("500 connections") | Expanded unit list includes calls, connections, records, retries, etc. |

### Calibration Notes

The validator applies an additional **AI slop penalty** (-1 to -5 pts) for filler phrases, buzzwords, and excessive hedging. This addresses the tendency of LLMs to generate verbose, non-committal language that technically avoids vague terms but adds no value.

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/acceptance-criteria-assistant.git
cd acceptance-criteria-assistant
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

---

## Paired Architecture

Every project has a **paired architecture**:

- **assistant/** - 3-phase AI workflow for creating documents
- **validator/** - Document scoring and validation tool

---

## Project Structure

```
acceptance-criteria-assistant/
├── index.html              # Main entry point
├── js/                     # JavaScript modules
│   ├── app.js              # Application entry
│   ├── workflow.js         # Phase orchestration
│   ├── storage.js          # IndexedDB operations
│   └── ...
├── assistant/              # Assistant web app
│   ├── index.html
│   └── js/
├── validator/              # Validator web app
│   ├── index.html
│   └── js/
├── tests/                  # Jest test files
├── prompts/                # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── e2e/                    # Playwright E2E tests
```

---

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
