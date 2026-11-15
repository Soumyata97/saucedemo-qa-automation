# Test Plan: SauceDemo

## 1. Introduction
Test plan for functional, regression and end-to-end testing of https://www.saucedemo.com.

## 2. Scope
**In scope:** login and logout, access protection, product listing and sorting, shopping cart,
checkout form validation and order completion.
**Out of scope:** performance and load testing, security testing, mobile and cross-browser testing,
API and database testing (the demo exposes none).

## 3. Test items
Login page, Products (inventory) page, Cart page, Checkout (information, overview, complete).

## 4. Test approach
| Type | Approach |
|---|---|
| Functional | Positive and negative cases per feature |
| Regression | Automated suite, tagged `@regression` |
| Smoke | Critical path subset, tagged `@smoke` |
| End-to-end | Full purchase journeys |
| Exploratory | Time-boxed charters (see `TEST_SCENARIOS.md`) |
| Data-driven | Invalid login and checkout validation inputs |

## 5. Test environment
Windows 11, Node.js LTS, Playwright (Chromium), VS Code, GitHub Actions (ubuntu-latest) for CI.

## 6. Test data
Public demo accounts (`standard_user`, `locked_out_user`), shared password listed on the login page.
Customer data for checkout is fictitious.

## 7. Entry criteria
Site reachable, dependencies installed, browsers installed.

## 8. Exit criteria
All planned tests executed, every failure analysed and either fixed (test issue) or logged as a defect,
summary report completed.

## 9. Defect management
Defects are logged using the format in `BUG_REPORTS.md` with severity and priority. Only genuine
defects observed during execution are recorded.

## 10. Risks
Third-party demo site may change or be unavailable; data is shared and public; tests depend on UI selectors.

## 11. Deliverables
Test plan, scenarios, test cases, automation code, execution report, bug reports, summary report.
