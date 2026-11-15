# Bug Reports

## Bug report template (Jira-style)

### BUG-001: Add to cart mismatch for problem_user

| Field | Value |
|---|---|
| ID | BUG-001 |
| Title | Add to cart mismatch for problem_user |
| Environment | Windows 11, Chromium 159.0.8154.6 (Chrome for Testing), Playwright v1.65.1, https://www.saucedemo.com, 2026-09-15 |
| Reporter | Soumyata Shakya |
| Severity | Major — cart item state becomes inconsistent across multiple products, which breaks trusted add-to-cart behavior. |
| Priority | High — this prevents reliable cart updates and affects purchase flows. |
| Status | Open |
| Related test case | TC-CART-01, TC-CART-02 |

**Preconditions**
- Logged in as standard_user / secret_sauce and problem_user / secret_sauce.
- Inventory page loaded with all products visible.

**Steps to reproduce**
1. Log in as standard_user / secret_sauce and add "Sauce Labs Bike Light" to the cart.
2. Observe the cart badge count and button state after the click.
3. Log out and log in as problem_user / secret_sauce.
4. Add the same product and compare the badge count and button state.

**Expected result**
The cart badge should increment by one and the product button should change to Remove for both users when the same product is added.

**Actual result**
problem_user showed a different badge count and inconsistent button behavior compared to standard_user. The mismatch was reproduced across multiple products.

**Evidence**: BUG-001-add-to-cart-mismatch-for-sauce-labs-bike-light.png

**Notes**: Frequency: always reproduced on multiple products. Workaround: do not rely on problem_user cart behavior until the cart state logic is corrected.

### BUG-002: Remove mismatch on the inventory page

| Field | Value |
|---|---|
| ID | BUG-002 |
| Title | Remove mismatch on the inventory page |
| Environment | Windows 11, Chromium 159.0.8154.6 (Chrome for Testing), Playwright v1.65.1, https://www.saucedemo.com, 2026-09-15 |
| Reporter | Soumyata Shakya |
| Severity | Major — product removal state does not match standard_user and introduces unreliable cart control. |
| Priority | High — users cannot trust inventory-state transitions during purchase flow. |
| Status | Open |
| Related test case | TC-CART-03 |

**Preconditions**
- Logged in as standard_user / secret_sauce and problem_user / secret_sauce.
- At least one product has been added to the cart.

**Steps to reproduce**
1. Log in as standard_user / secret_sauce and add "Sauce Labs Bolt T-Shirt" to the cart.
2. Observe the button state and cart badge on the inventory page.
3. Log out and log in as problem_user / secret_sauce.
4. Add the same product, then compare the inventory button state and badge count.
5. Remove the item from the inventory page on both users and compare the result.

**Expected result**
The button should change to Remove when added, and the cart badge should reflect the same state as standard_user when removed.

**Actual result**
problem_user showed Add to cart instead of Remove after adding the same product, and the cart state did not match standard_user.

**Evidence**: BUG-002-inventory-remove-state-mismatch-sauce-labs-bolt-t-shirt.png

**Notes**: Frequency: always reproduced on multiple products. Workaround: avoid relying on inventory-page remove control for problem_user until state logic is fixed.

### BUG-003: Sort order mismatch for problem_user

| Field | Value |
|---|---|
| ID | BUG-003 |
| Title | Sort order mismatch for problem_user |
| Environment | Windows 11, Chromium 159.0.8154.6 (Chrome for Testing), Playwright v1.65.1, https://www.saucedemo.com, 2026-09-15 |
| Reporter | Soumyata Shakya |
| Severity | Major — sorting is not consistent with standard_user, which breaks product discovery and validation. |
| Priority | High — sorting behavior affects inventory usability and checkout selection. |
| Status | Open |
| Related test case | TC-INV-02, TC-INV-03, TC-INV-04, TC-INV-05 |

**Preconditions**
- Logged in as standard_user / secret_sauce and problem_user / secret_sauce.
- Inventory page loaded and visible.

**Steps to reproduce**
1. Log in as standard_user / secret_sauce and select "Name (Z to A)".
2. Record the product order.
3. Log out and log in as problem_user / secret_sauce.
4. Select the same sort option and compare the order.
5. Repeat the same comparison for "Price (low to high)" and "Price (high to low)".

**Expected result**
The selected sort order should produce the same product sequence for both users, matching the standard_user ordering logic.

**Actual result**
problem_user did not follow the selected sort option and stayed in the default product order, while standard_user changed correctly.

**Evidence**: BUG-003-sort-mismatch-name-z-to-a.png

**Notes**: Frequency: always reproduced for multiple sort selections. Workaround: use standard_user for sorting validation until the sorting state is fixed.

### BUG-004: Product detail mismatch for problem_user

| Field | Value |
|---|---|
| ID | BUG-004 |
| Title | Product detail mismatch for problem_user |
| Environment | Windows 11, Chromium 159.0.8154.6 (Chrome for Testing), Playwright v1.65.1, https://www.saucedemo.com, 2026-09-15 |
| Reporter | Soumyata Shakya |
| Severity | Critical — the product detail page shows the wrong item and can mislead the user into selecting an incorrect product. |
| Priority | High — incorrect item details can affect buying decisions and order accuracy. |
| Status | Open |
| Related test case | Exploratory product-detail validation |

**Preconditions**
- Logged in as standard_user / secret_sauce and problem_user / secret_sauce.
- Inventory page loaded.

**Steps to reproduce**
1. Open the detail page for "Sauce Labs Fleece Jacket" as standard_user.
2. Record the product name, price and description.
3. Log out and log in as problem_user / secret_sauce.
4. Open the same inventory item from the list and compare the detail page content.
5. Repeat for multiple products to confirm the mismatch pattern.

**Expected result**
The detail page for the selected product should show the correct name, price and description for both users.

**Actual result**
problem_user opened the wrong product detail page or displayed a broken error string instead of the correct content. This was reproduced across several products.

**Evidence**: BUG-004-product-detail-mismatch-sauce-labs-fleece-jacket.png

**Notes**: Frequency: always reproduced across multiple products. Workaround: avoid relying on product-detail navigation for problem_user until the item-selection logic is corrected.

### BUG-005: Finish button missing on checkout overview

| Field | Value |
|---|---|
| ID | BUG-005 |
| Title | Finish button missing on checkout overview |
| Environment | Windows 11, Chromium 159.0.8154.6 (Chrome for Testing), Playwright v1.65.1, https://www.saucedemo.com, 2026-09-15 |
| Reporter | Soumyata Shakya |
| Severity | Critical — the checkout flow cannot be completed because the final action is unavailable. |
| Priority | High — the missing final action blocks the end-to-end purchase flow. |
| Status | Open |
| Related test case | TC-CHK-06 |

**Preconditions**
- Logged in as standard_user / secret_sauce and problem_user / secret_sauce.
- One valid product added to the cart and checkout started.

**Steps to reproduce**
1. Log in as standard_user / secret_sauce and add one valid product.
2. Go to checkout and enter a valid first name, last name and postal code.
3. Click Continue and confirm that the Finish button is visible.
4. Repeat the same sequence for problem_user / secret_sauce.

**Expected result**
After valid checkout information is entered, both users should see the Finish button on the overview page.

**Actual result**
standard_user showed the Finish button, but problem_user did not. The checkout flow was blocked for problem_user at the final step.

**Evidence**: BUG-005-checkout-finish-button-missing.png

**Notes**: Frequency: reproduced consistently. Workaround: do not attempt to complete checkout with problem_user until the overview state is corrected.

## Defect log

| ID | Title | Severity | Priority | Status | Test case |
|---|---|---|---|---|---|
| BUG-001 | Add to cart mismatch for problem_user | Major | High | Open | TC-CART-01 / TC-CART-02 |
| BUG-002 | Remove mismatch on the inventory page | Major | High | Open | TC-CART-03 |
| BUG-003 | Sort order mismatch for problem_user | Major | High | Open | TC-INV-02 / TC-INV-03 / TC-INV-04 / TC-INV-05 |
| BUG-004 | Product detail mismatch for problem_user | Critical | High | Open | Exploratory product-detail validation |
| BUG-005 | Finish button missing on checkout overview | Critical | High | Open | TC-CHK-06 |
