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
