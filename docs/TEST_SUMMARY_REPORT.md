# Test Summary Report

## 1. Overview
Testing of https://www.saucedemo.com covering login, product listing, cart, checkout and
end-to-end flows, using automated Playwright tests and exploratory sessions.

## 2. Scope covered
See `TEST_PLAN.md`.

## 3. Results
| Metric | Value |
|---|---|
| Test cases planned | 27 |
| Executed | 27 |
| Passed | 27 |
| Failed | 0 |
| Defects found | 5 |

## 4. Defect summary
- BUG-001: Add to cart mismatch for problem_user
- BUG-002: Remove mismatch on the inventory page
- BUG-003: Sort order mismatch for problem_user
- BUG-004: Product detail mismatch for problem_user
- BUG-005: Finish button missing on checkout overview

## 5. Observations and risks
The 27 automated Playwright tests on standard_user passed successfully. The five defects listed above were found during exploratory testing using problem_user / secret_sauce and were not present in the standard_user automated suite. This suggests a user-specific defect pattern rather than a regression in the standard automated flows.

## 6. Conclusion and recommendation
The exit criteria in `TEST_PLAN.md` were met for the standard_user automated suite. Exploratory testing with problem_user identified five real defects that should be reviewed and fixed before release.
