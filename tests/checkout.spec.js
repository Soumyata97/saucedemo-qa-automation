const { test, expect } = require('../fixtures/test-fixtures');
const { products } = require('../test-data/products');
const { validCustomer, checkoutValidationCases } = require('../test-data/checkout');

test.describe('Checkout', () => {
  // Every checkout test starts from a logged-in session with one product in the cart.
  test.beforeEach(async ({ loggedInInventory: inv, cartPage }) => {
    await inv.addToCart(products.backpack);
    await inv.openCart();
    await cartPage.expectLoaded();
    await cartPage.checkout();
  });

  for (const c of checkoutValidationCases) {
    test(`${c.id} ${c.title} @regression`, async ({ checkoutPage }) => {
      await checkoutPage.expectStepOne();
      await checkoutPage.fillInformation(c.data);
      await checkoutPage.continue();
      await expect(checkoutPage.errorMessage).toContainText(c.error);
      await checkoutPage.expectStepOne();
    });
  }

  test('TC-CHK-04 cancel on the information step returns to the cart @regression', async ({ checkoutPage, cartPage }) => {
    await checkoutPage.expectStepOne();
    await checkoutPage.cancel();
    await cartPage.expectLoaded();
  });

  test('TC-CHK-05 order overview totals are calculated correctly @regression', async ({ loggedInInventory: inv, cartPage, checkoutPage }) => {
    // Add a second product so the total involves more than one price:
    // step one -> cancel -> cart -> continue shopping -> add product -> cart -> checkout.
    await checkoutPage.cancel();
    await cartPage.continueShopping();
    await inv.addToCart(products.bikeLight);
    await inv.openCart();
    await cartPage.checkout();

    await checkoutPage.fillInformation(validCustomer);
    await checkoutPage.continue();
    await checkoutPage.expectOverview();

    const subtotal = await checkoutPage.amountFrom(checkoutPage.subtotalLabel);
    const tax = await checkoutPage.amountFrom(checkoutPage.taxLabel);
    const total = await checkoutPage.amountFrom(checkoutPage.totalLabel);

    expect(subtotal).toBeCloseTo(products.backpack.price + products.bikeLight.price, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('TC-CHK-06 user can complete an order @smoke @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillInformation(validCustomer);
    await checkoutPage.continue();
    await checkoutPage.expectOverview();
    await checkoutPage.finish();
    await checkoutPage.expectComplete();
  });
});
