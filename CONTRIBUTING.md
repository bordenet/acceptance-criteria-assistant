# Contributing to Acceptance Criteria Assistant

Thank you for your interest in contributing!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/acceptance-criteria-assistant.git`
3. Install dependencies: `npm install`
4. Pre-commit hooks are automatically installed via npm install

## Code Quality Standards

All contributions must meet these standards:

### Linting
- **ESLint**: Code must pass ESLint checks
- Run: `npm run lint`
- Auto-fix: `npm run lint:fix`

### Testing
- **Jest**: All tests must pass
- **Coverage**: New code must maintain 50%+ coverage
- Run: `npm test`
- Coverage: `npm run test:coverage`

### Pre-Commit Hooks

Pre-commit hooks automatically enforce these standards. They run on every commit.

To run manually:
```bash
pre-commit run --all-files
```

## Testing

### Writing Tests

- Place assistant tests in `assistant/tests/` directory
- Place validator tests in `validator/tests/` directory
- Name test files `*.test.js`
- Use Jest and ES6 modules
- Mock browser APIs (IndexedDB, etc.) using fake-indexeddb
- Aim for high coverage of new code

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- assistant/tests/specific.test.js
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Ensure pre-commit hooks pass: `pre-commit run --all-files`
6. Commit your changes (pre-commit hooks will run automatically)
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

### PR Requirements

- [ ] All tests pass
- [ ] Code coverage maintained or improved (50%+)
- [ ] Pre-commit hooks pass
- [ ] Code is documented (JSDoc comments for public APIs)
- [ ] No console errors or warnings

## Code Style

- Follow ESLint rules (see `eslint.config.js`)
- Use ES6 modules (`import`/`export`)
- Use 2-space indentation
- Use single quotes for strings
- Add semicolons
- Write descriptive variable and function names
- Keep functions focused and small
- Add JSDoc comments for public APIs

## Project Structure

This project uses a **paired architecture** with both assistant and validator tools:

- `index.html` - Root entry (mirrors assistant/index.html)
- `js/` - Root JS (mirrors assistant/js/)
- `css/` - Root styles (mirrors assistant/css/)
- `assistant/` - Document creation tool
  - `index.html` - Assistant UI
  - `js/` - Application logic (app.js, workflow.js, storage.js, etc.)
  - `css/` - Styles
  - `tests/` - Jest unit tests
- `validator/` - Document validation tool
  - `index.html` - Validator UI
  - `js/` - Validation logic (app.js, validator.js)
  - `css/` - Styles
  - `tests/` - Jest unit tests
  - `testdata/` - Test fixtures
- `e2e/` - Playwright E2E tests

## Deployment

The project can be deployed to GitHub Pages.

```bash
# Deploy to docs/ directory
./scripts/deploy-web.sh

# Preview deployment (dry-run)
./scripts/deploy-web.sh --dry-run
```

After deployment, commit and push the `docs/` directory changes.

## Questions?

Open an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

