# SauceDemo QA Automation (Playwright + JavaScript)

End-to-end test automation and QA documentation for the public demo e-commerce site
[SauceDemo](https://www.saucedemo.com).

## Purpose
Demonstrate practical QA skills: test design, Page Object Model automation, data-driven testing,
regression and end-to-end coverage, failure screenshots, HTML reporting and CI with GitHub Actions.

## Application under test
SauceDemo, a public demo shop provided for practising test automation: https://www.saucedemo.com
Public demo credentials are listed on the login page (`standard_user` / `secret_sauce`).

## Technologies
Playwright Test, JavaScript (Node.js), Page Object Model, custom fixtures, data-driven tests,
GitHub Actions.

## Project structure
```
saucedemo-qa-automation/
├── .github/workflows/playwright.yml   CI pipeline
├── pages/                             Page Objects (Login, Inventory, Cart, Checkout)
├── fixtures/test-fixtures.js          Custom fixtures (page objects + logged-in session)
├── test-data/                         Users, products, checkout data
├── tests/                             Spec files (login, inventory, cart, checkout, e2e)
├── docs/                              Test plan, scenarios, test cases, reports, bug docs
├── playwright.config.js
└── package.json
```

## Installation (Windows 11 + VS Code)
1. Install Node.js LTS from https://nodejs.org (check with `node -v` in a terminal).
2. Open this folder in VS Code (File > Open Folder), then open a terminal (Ctrl + `).
3. Run:
   ```
   npm install
   npx playwright install chromium
   ```
   If PowerShell blocks `npm`, use the Command Prompt terminal instead.

## Running the tests
| Command | What it does |
|---|---|
| `npm test` | Run all 27 tests headless |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:smoke` | Run only `@smoke` tests |
| `npm run test:regression` | Run only `@regression` tests |
| `npx playwright test tests/cart.spec.js` | Run a single spec file |

## Viewing reports
After a run: `npm run report` opens the HTML report. Screenshots of failures and traces are
attached to failed tests in the report (`playwright-report/`, `test-results/`).

## CI
`.github/workflows/playwright.yml` runs the suite on every push and pull request and uploads the
HTML report as a build artifact (Actions tab > latest run > Artifacts).

## Test coverage (27 automated tests)
Login (8), product listing and sorting (5), cart (6), checkout (6), end-to-end journeys (2).
See `docs/test-cases.csv` for the full list.

## Documentation
`docs/PROJECT_OVERVIEW.md`, `TEST_PLAN.md`, `TEST_SCENARIOS.md`, `test-cases.csv`,
`BUG_REPORTS.md`, `TEST_EXECUTION_REPORT.md`, `TEST_SUMMARY_REPORT.md`.

## Known limitations
- Chromium only. The site is a demo with no backend, so no API or database testing here.
- SauceDemo has special users (`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`)
  that behave differently by design. They are covered only as exploratory charters, not automated.
- If SauceDemo changes its markup, selectors in `pages/` may need updating.
