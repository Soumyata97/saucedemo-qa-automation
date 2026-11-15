const { test, expect } = require('../fixtures/test-fixtures');
const { products } = require('../test-data/products');

test.describe('Shopping cart', () => {
  test('TC-CART-01 adding one product updates badge and button @smoke @regression', async ({ loggedInInventory: inv }) => {
    await inv.addToCart(products.backpack);
    await expect(inv.cartBadge).toHaveText('1');
    await expect(inv.removeButton(products.backpack.slug)).toBeVisible();
  });

  test('TC-CART-02 adding multiple products updates badge count @regression', async ({ loggedInInventory: inv }) => {
    await inv.addToCart(products.backpack);
    await inv.addToCart(products.bikeLight);
    await inv.addToCart(products.boltShirt);
    await expect(inv.cartBadge).toHaveText('3');
  });

  test('TC-CART-03 removing a product from the inventory page clears the badge @regression', async ({ loggedInInventory: inv }) => {
    await inv.addToCart(products.onesie);
    await expect(inv.cartBadge).toHaveText('1');
    await inv.removeFromCart(products.onesie);
    await expect(inv.cartBadge).toHaveCount(0);
    await expect(inv.addToCartButton(products.onesie.slug)).toBeVisible();
  });

  test('TC-CART-04 cart page lists the added products @smoke @regression', async ({ loggedInInventory: inv, cartPage }) => {
    await inv.addToCart(products.backpack);
    await inv.addToCart(products.fleeceJacket);
    await inv.openCart();
    await cartPage.expectLoaded();
    const names = await cartPage.getItemNames();
    expect(names).toEqual(expect.arrayContaining([products.backpack.name, products.fleeceJacket.name]));
    await expect(cartPage.items).toHaveCount(2);
  });

  test('TC-CART-05 removing a product on the cart page removes it from the list @regression', async ({ loggedInInventory: inv, cartPage }) => {
    await inv.addToCart(products.backpack);
    await inv.addToCart(products.bikeLight);
    await inv.openCart();
    await cartPage.removeItem(products.backpack);
    await expect(cartPage.items).toHaveCount(1);
    expect(await cartPage.getItemNames()).toEqual([products.bikeLight.name]);
  });

  test('TC-CART-06 continue shopping returns to the inventory page @regression', async ({ loggedInInventory: inv, cartPage }) => {
    await inv.openCart();
    await cartPage.continueShopping();
    await inv.expectLoaded();
  });
});
