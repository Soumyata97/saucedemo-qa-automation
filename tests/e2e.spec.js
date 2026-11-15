const { test, expect } = require('../fixtures/test-fixtures');
const { products } = require('../test-data/products');
const { users } = require('../test-data/users');
const { validCustomer } = require('../test-data/checkout');

test.describe('End-to-end purchase journeys', () => {
  test('TC-E2E-01 login, buy two products and return home @smoke @regression', async ({
    loginPage, inventoryPage, cartPage, checkoutPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();

    await inventoryPage.addToCart(products.boltShirt);
    await inventoryPage.addToCart(products.onesie);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await expect(cartPage.items).toHaveCount(2);
    await cartPage.checkout();

    await checkoutPage.fillInformation(validCustomer);
    await checkoutPage.continue();
    await checkoutPage.expectOverview();
    const subtotal = await checkoutPage.amountFrom(checkoutPage.subtotalLabel);
    expect(subtotal).toBeCloseTo(products.boltShirt.price + products.onesie.price, 2);

    await checkoutPage.finish();
    await checkoutPage.expectComplete();

    await checkoutPage.backHomeButton.click();
    await inventoryPage.expectLoaded();
    // Cart should be empty after a completed order.
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });

  test('TC-E2E-02 full purchase followed by logout @regression', async ({
    loggedInInventory: inv, cartPage, checkoutPage, loginPage,
  }) => {
    await inv.addToCart(products.fleeceJacket);
    await inv.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(validCustomer);
    await checkoutPage.continue();
    await checkoutPage.finish();
    await checkoutPage.expectComplete();

    await inv.logout();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
