const { test, expect } = require('../fixtures/test-fixtures');
const { TOTAL_PRODUCTS_ON_PAGE } = require('../test-data/products');

test.describe('Product listing and sorting', () => {
  test('TC-INV-01 all products are displayed @smoke @regression', async ({ loggedInInventory }) => {
    await expect(loggedInInventory.items).toHaveCount(TOTAL_PRODUCTS_ON_PAGE);
  });

  test('TC-INV-02 sort by name A to Z @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('az');
    const names = await loggedInInventory.getNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('TC-INV-03 sort by name Z to A @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');
    const names = await loggedInInventory.getNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('TC-INV-04 sort by price low to high @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');
    const prices = await loggedInInventory.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('TC-INV-05 sort by price high to low @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('hilo');
    const prices = await loggedInInventory.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});
