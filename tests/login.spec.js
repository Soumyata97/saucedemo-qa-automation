const { test, expect } = require('../fixtures/test-fixtures');
const { users, invalidLoginCases } = require('../test-data/users');

test.describe('Login and authentication', () => {
  test('TC-LOGIN-01 valid user can log in @smoke @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('TC-LOGIN-02 locked out user cannot log in @regression', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await expect(loginPage.errorMessage).toContainText('this user has been locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  for (const c of invalidLoginCases) {
    test(`${c.id} ${c.title} @regression`, async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.login(c.username, c.password);
      await expect(loginPage.errorMessage).toContainText(c.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('TC-LOGIN-07 user can log out @regression', async ({ loggedInInventory, loginPage, page }) => {
    await loggedInInventory.logout();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });

  test('TC-LOGIN-08 inventory page is protected when not logged in @regression', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.errorMessage).toContainText('You can only access');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
