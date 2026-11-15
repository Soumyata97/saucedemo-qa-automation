const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://www.saucedemo.com';
const evidenceDir = path.join(process.cwd(), 'docs', 'evidence');
const PASSWORD = 'secret_sauce';

function ensureEvidenceDir() {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

function makeScreenshotName(title, prefix) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${prefix}-${safe}.png`;
}

async function login(page, username) {
  await page.goto(baseURL);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(PASSWORD);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL(/\/inventory\.html/);
}

async function getInventory(page) {
  return await page.locator('.inventory_item').evaluateAll((nodes) =>
    nodes.map((node) => {
      const name = node.querySelector('.inventory_item_name')?.textContent?.trim() || '';
      const price = node.querySelector('.inventory_item_price')?.textContent?.trim() || '';
      const src = node.querySelector('.inventory_item_img')?.getAttribute('src') || '';
      return { name, price, src };
    })
  );
}

async function getBadgeCount(page) {
  const badgeCount = await page.locator('.shopping_cart_badge').count();
  if (!badgeCount) return 0;
  const value = await page.locator('.shopping_cart_badge').textContent();
  return Number.parseInt(value.trim(), 10) || 0;
}

async function productCard(page, productName) {
  return page.locator('.inventory_item').filter({ has: page.locator('.inventory_item_name', { hasText: productName }) });
}

async function addToCart(page, productName) {
  const card = await productCard(page, productName);
  await card.locator('.btn_inventory').click();
}

async function removeFromInventory(page, productName) {
  const card = await productCard(page, productName);
  const button = card.locator('.btn_inventory');
  await button.click();
}

async function getSortOrder(page, optionLabel) {
  const select = page.locator('[data-test="product-sort-container"]');
  await select.selectOption({ label: optionLabel });
  await page.waitForTimeout(250);
  return await page.locator('.inventory_item_name').evaluateAll((nodes) =>
    nodes.map((node) => node.textContent.trim())
  );
}

async function getDetail(page, productName) {
  const card = await productCard(page, productName);
  await card.locator('.inventory_item_name').click();
  await page.waitForURL(/\/inventory-item\.html/);
  const details = {
    name: (await page.locator('.inventory_details_name').textContent())?.trim() || '',
    price: (await page.locator('.inventory_details_price').textContent())?.trim() || '',
    description: (await page.locator('.inventory_details_desc').textContent())?.trim() || ''
  };
  await page.goBack();
  await page.waitForURL(/\/inventory\.html/);
  return details;
}

async function saveScreenshot(page, fileName) {
  await page.screenshot({ path: path.join(evidenceDir, fileName), fullPage: true });
}

async function recordAnomaly(anomalies, title, steps, expected, actual, problemPage, standardPage, problemFile, standardFile) {
  await saveScreenshot(problemPage, problemFile);
  if (standardPage) await saveScreenshot(standardPage, standardFile);
  anomalies.push({ title, steps, expected, actual, evidence: problemFile, standardEvidence: standardFile });
}

async function compareUsers(standardPage, problemPage) {
  const anomalies = [];

  const standardInventory = await getInventory(standardPage);
  const problemInventory = await getInventory(problemPage);
  const standardNames = standardInventory.map((item) => item.name);
  const problemNames = problemInventory.map((item) => item.name);
  const standardImages = standardInventory.map((item) => item.src);
  const problemImages = problemInventory.map((item) => item.src);

  if (JSON.stringify(problemNames) !== JSON.stringify(standardNames) || JSON.stringify(problemImages) !== JSON.stringify(standardImages)) {
    await recordAnomaly(
      anomalies,
      'Problem user inventory image or name mismatch',
      [
        '1. Log in as standard_user / secret_sauce and record the inventory names and image src values.',
        '2. Log out and log in as problem_user / secret_sauce.',
        '3. Compare each inventory item name and image source.',
        '4. Confirm whether the same product names and image URLs match the standard_user view.'
      ],
      'The product names and image source URLs for problem_user should match the standard_user inventory page for the same products.',
      `standard_user names=${JSON.stringify(standardNames)} / images=${JSON.stringify(standardImages)}; problem_user names=${JSON.stringify(problemNames)} / images=${JSON.stringify(problemImages)}.`,
      problemPage,
      standardPage,
      makeScreenshotName('problem-user-inventory-image-or-name-mismatch', 'BUG-001'),
      makeScreenshotName('standard-user-inventory-baseline', 'STANDARD')
    );
  }

  const productNames = standardNames;
  for (const productName of productNames) {
    const standardBefore = await getBadgeCount(standardPage);
    const problemBefore = await getBadgeCount(problemPage);

    await addToCart(standardPage, productName);
    await addToCart(problemPage, productName);

    const standardBadge = await getBadgeCount(standardPage);
    const problemBadge = await getBadgeCount(problemPage);
    const standardCard = await productCard(standardPage, productName);
    const problemCard = await productCard(problemPage, productName);
    const standardState = await standardCard.locator('.btn_inventory').textContent();
    const problemState = await problemCard.locator('.btn_inventory').textContent();

    if (problemBadge !== standardBadge || problemState !== standardState) {
      await recordAnomaly(
        anomalies,
        `Add to cart mismatch for ${productName}`,
        [
          `1. Log in as standard_user / secret_sauce and click Add to cart for ${productName}.`,
          `2. Record the cart badge count and button state for the same product.`,
          `3. Repeat the same step with problem_user / secret_sauce.`,
          '4. Compare the badge count and button label between users.'
        ],
        `The cart badge count and button state for ${productName} should match standard_user.`,
        `standard_user before=${standardBefore}; after=${standardBadge}; button="${standardState}"; problem_user before=${problemBefore}; after=${problemBadge}; button="${problemState}".`,
        problemPage,
        standardPage,
        makeScreenshotName(`add-to-cart-mismatch-for-${productName}`, 'BUG-002'),
        makeScreenshotName(`standard-user-add-to-cart-${productName}`, 'STANDARD')
      );
    }

    const standardRemoveCard = await productCard(standardPage, productName);
    const problemRemoveCard = await productCard(problemPage, productName);
    const standardRemoveState = (await standardRemoveCard.locator('.btn_inventory').textContent())?.trim() || '';
    const problemRemoveState = (await problemRemoveCard.locator('.btn_inventory').textContent())?.trim() || '';
    if (standardRemoveState !== problemRemoveState) {
      await recordAnomaly(
        anomalies,
        `Inventory remove-state mismatch for ${productName}`,
        [
          `1. Log in as standard_user / secret_sauce and click Add to cart for ${productName}.`,
          `2. Observe the Remove button state and cart badge on the inventory page.`,
          `3. Repeat the same step with problem_user / secret_sauce.`,
          '4. Compare the button state change after the click.'
        ],
        `The inventory item button should change to the same Remove state in both users for the same product.`,
        `standard_user remove-state="${standardRemoveState}"; problem_user remove-state="${problemRemoveState}".`,
        problemPage,
        standardPage,
        makeScreenshotName(`inventory-remove-state-mismatch-${productName}`, 'BUG-003'),
        makeScreenshotName(`standard-user-inventory-remove-state-${productName}`, 'STANDARD')
      );
    }

    await removeFromInventory(standardPage, productName);
    await removeFromInventory(problemPage, productName);
  }

  for (const productName of productNames) {
    await addToCart(standardPage, productName);
    await addToCart(problemPage, productName);

    await standardPage.locator('.shopping_cart_link').click();
    await problemPage.locator('.shopping_cart_link').click();

    const standardCartButtons = await standardPage.locator('.cart_button').count();
    const problemCartButtons = await problemPage.locator('.cart_button').count();
    if (standardCartButtons === 0 || problemCartButtons === 0) {
      await standardPage.goto(`${baseURL}/inventory.html`);
      await problemPage.goto(`${baseURL}/inventory.html`);
      continue;
    }

    const standardCartNames = await standardPage.locator('.cart_item .inventory_item_name').evaluateAll((nodes) =>
      nodes.map((node) => node.textContent.trim())
    );
    const problemCartNames = await problemPage.locator('.cart_item .inventory_item_name').evaluateAll((nodes) =>
      nodes.map((node) => node.textContent.trim())
    );

    if (JSON.stringify(problemCartNames) !== JSON.stringify(standardCartNames)) {
      await recordAnomaly(
        anomalies,
        `Cart page mismatch for ${productName}`,
        [
          `1. Log in as standard_user / secret_sauce and add ${productName} to cart.`,
          `2. Open the cart page and record the cart item names.`,
          `3. Repeat the same step with problem_user / secret_sauce.`,
          '4. Compare the exact cart contents and item count.'
        ],
        `The cart page contents for ${productName} should match standard_user exactly.`,
        `standard_user cart=${JSON.stringify(standardCartNames)}; problem_user cart=${JSON.stringify(problemCartNames)}.`,
        problemPage,
        standardPage,
        makeScreenshotName(`cart-page-mismatch-${productName}`, 'BUG-004'),
        makeScreenshotName(`standard-user-cart-${productName}`, 'STANDARD')
      );
    }

    await standardPage.locator('.cart_button').first().click();
    await problemPage.locator('.cart_button').first().click();
    await standardPage.goto(`${baseURL}/inventory.html`);
    await problemPage.goto(`${baseURL}/inventory.html`);
  }

  const sortOptions = [
    'Name (A to Z)',
    'Name (Z to A)',
    'Price (low to high)',
    'Price (high to low)'
  ];

  for (const option of sortOptions) {
    const standardOrder = await getSortOrder(standardPage, option);
    const problemOrder = await getSortOrder(problemPage, option);
    if (JSON.stringify(problemOrder) !== JSON.stringify(standardOrder)) {
      await recordAnomaly(
        anomalies,
        `Sort option mismatch for ${option}`,
        [
          `1. Log in as standard_user / secret_sauce and select ${option}.`,
          `2. Record the resulting product order.`,
          `3. Repeat the same selection for problem_user / secret_sauce.`,
          '4. Compare the order of product names or prices.'
        ],
        `The ${option} sort should produce the same order as standard_user.`,
        `standard_user order=${JSON.stringify(standardOrder)}; problem_user order=${JSON.stringify(problemOrder)}.`,
        problemPage,
        standardPage,
        makeScreenshotName(`sort-mismatch-${option}`, 'BUG-005'),
        makeScreenshotName(`standard-user-sort-${option}`, 'STANDARD')
      );
    }
  }

  for (const productName of productNames) {
    const standardDetail = await getDetail(standardPage, productName);
    const problemDetail = await getDetail(problemPage, productName);
    if (JSON.stringify(problemDetail) !== JSON.stringify(standardDetail)) {
      await recordAnomaly(
        anomalies,
        `Product detail mismatch for ${productName}`,
        [
          `1. Open ${productName} on the standard_user inventory page and record the detail page values.`,
          `2. Repeat the same action with problem_user / secret_sauce.`,
          `3. Compare the product name, price and description for the same item.`,
          '4. Validate whether the detail page matches standard_user.'
        ],
        `The product detail page for ${productName} should match the standard_user detail page exactly.`,
        `standard_user=${JSON.stringify(standardDetail)}; problem_user=${JSON.stringify(problemDetail)}.`,
        problemPage,
        standardPage,
        makeScreenshotName(`product-detail-mismatch-${productName}`, 'BUG-006'),
        makeScreenshotName(`standard-user-detail-${productName}`, 'STANDARD')
      );
    }
  }

  const checkoutProduct = 'Sauce Labs Backpack';
  await addToCart(standardPage, checkoutProduct);
  await addToCart(problemPage, checkoutProduct);

  await standardPage.locator('.shopping_cart_link').click();
  await problemPage.locator('.shopping_cart_link').click();
  await standardPage.locator('[data-test="checkout"]').click();
  await problemPage.locator('[data-test="checkout"]').click();

  const standardFirst = 'Test';
  const standardLast = 'User';
  const standardPostal = '44600';

  await standardPage.locator('[data-test="firstName"]').fill(standardFirst);
  await standardPage.locator('[data-test="lastName"]').fill(standardLast);
  await standardPage.locator('[data-test="postalCode"]').fill(standardPostal);

  await problemPage.locator('[data-test="firstName"]').fill(standardFirst);
  await problemPage.locator('[data-test="lastName"]').fill(standardLast);
  await problemPage.locator('[data-test="postalCode"]').fill(standardPostal);

  const standardReadback = {
    firstName: await standardPage.locator('[data-test="firstName"]').inputValue(),
    lastName: await standardPage.locator('[data-test="lastName"]').inputValue(),
    postalCode: await standardPage.locator('[data-test="postalCode"]').inputValue()
  };

  const problemReadback = {
    firstName: await problemPage.locator('[data-test="firstName"]').inputValue(),
    lastName: await problemPage.locator('[data-test="lastName"]').inputValue(),
    postalCode: await problemPage.locator('[data-test="postalCode"]').inputValue()
  };

  if (JSON.stringify(problemReadback) !== JSON.stringify(standardReadback)) {
    await recordAnomaly(
      anomalies,
      'Checkout form value mismatch',
      [
        '1. Log in as standard_user / secret_sauce and add a product to the cart.',
        '2. Go to checkout and type values into first name, last name and postal code, then read them back.',
        '3. Repeat the same action with problem_user / secret_sauce.',
        '4. Compare the form’s entered and read-back values.'
      ],
      'The checkout form should read back the exact values entered for first name, last name and postal code for both users.',
      `standard_user=${JSON.stringify(standardReadback)}; problem_user=${JSON.stringify(problemReadback)}.`,
      problemPage,
      standardPage,
      makeScreenshotName('checkout-form-value-mismatch', 'BUG-007'),
      makeScreenshotName('standard-user-checkout-form', 'STANDARD')
    );
  }

  const standardContinueVisible = await standardPage.locator('[data-test="continue"]').isVisible().catch(() => false);
  const problemContinueVisible = await problemPage.locator('[data-test="continue"]').isVisible().catch(() => false);

  if (!standardContinueVisible || !problemContinueVisible) {
    await recordAnomaly(
      anomalies,
      'Checkout continue button missing',
      [
        '1. Log in as standard_user / secret_sauce and add a product to the cart.',
        '2. Go to checkout and enter valid information.',
        '3. Check whether the Continue button appears on the checkout form.',
        '4. Repeat the same step with problem_user / secret_sauce and compare the results.'
      ],
      'The Continue button should be present for valid checkout data on both users.',
      `standard_user continue visible=${standardContinueVisible}; problem_user continue visible=${problemContinueVisible}.`,
      problemPage,
      standardPage,
      makeScreenshotName('checkout-continue-button-missing', 'BUG-009'),
      makeScreenshotName('standard-user-checkout-continue-button', 'STANDARD')
    );
  } else {
    await standardPage.locator('[data-test="continue"]').click();
    await problemPage.locator('[data-test="continue"]').click();

    const standardFinishVisible = await standardPage.locator('[data-test="finish"]').isVisible().catch(() => false);
    const problemFinishVisible = await problemPage.locator('[data-test="finish"]').isVisible().catch(() => false);

    if (!standardFinishVisible || !problemFinishVisible) {
      await recordAnomaly(
        anomalies,
        'Checkout finish button missing',
        [
          '1. Log in as standard_user / secret_sauce and complete checkout info.',
          '2. Click Continue and check whether the Finish button appears.',
          '3. Repeat the same action with problem_user / secret_sauce.',
          '4. Compare whether the order overview includes a Finish action on both users.'
        ],
        'The Finish button should appear on the checkout overview for both users after a valid address is entered.',
        `standard_user finish visible=${standardFinishVisible}; problem_user finish visible=${problemFinishVisible}.`,
        problemPage,
        standardPage,
        makeScreenshotName('checkout-finish-button-missing', 'BUG-010'),
        makeScreenshotName('standard-user-checkout-finish-button', 'STANDARD')
      );
    } else {
      await standardPage.locator('[data-test="finish"]').click();
      await problemPage.locator('[data-test="finish"]').click();
    }
  }

  const standardComplete = await standardPage.locator('.complete-header').textContent().catch(() => '');
  const problemComplete = await problemPage.locator('.complete-header').textContent().catch(() => '');
  if (problemComplete !== standardComplete) {
    await recordAnomaly(
      anomalies,
      'Checkout completion mismatch',
      [
        '1. Log in as standard_user / secret_sauce and complete checkout with a valid address.',
        '2. Confirm the order completion message shown by standard_user.',
        '3. Repeat the same flow with problem_user / secret_sauce.',
        '4. Compare the confirmation message after finishing the order.'
      ],
      'The successful checkout confirmation should match for both users when the same valid information is entered.',
      `standard_user complete message="${standardComplete}"; problem_user complete message="${problemComplete}".`,
      problemPage,
      standardPage,
      makeScreenshotName('checkout-completion-mismatch', 'BUG-008'),
      makeScreenshotName('standard-user-checkout-complete', 'STANDARD')
    );
  }

  return anomalies;
}

async function main() {
  ensureEvidenceDir();
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--disable-software-rasterizer']
  });

  const standardContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const problemContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });

  const standardPage = await standardContext.newPage();
  const problemPage = await problemContext.newPage();

  console.log('Starting comparative exploration for standard_user and problem_user');
  await login(standardPage, 'standard_user');
  await login(problemPage, 'problem_user');

  const anomalies = await compareUsers(standardPage, problemPage);

  if (anomalies.length === 0) {
    console.log('No anomalies observed in the direct comparison between standard_user and problem_user.');
  } else {
    console.log(`Observed ${anomalies.length} anomaly(s):`);
    anomalies.forEach((anomaly, index) => {
      console.log(`\n${index + 1}. ${anomaly.title}`);
      console.log('   Steps:');
      anomaly.steps.forEach((step) => console.log(`     ${step}`));
      console.log(`   Expected: ${anomaly.expected}`);
      console.log(`   Actual: ${anomaly.actual}`);
      console.log(`   Evidence: ${anomaly.evidence}`);
      if (anomaly.standardEvidence) console.log(`   Standard comparison screenshot: ${anomaly.standardEvidence}`);
    });
  }

  await standardContext.close();
  await problemContext.close();
  await browser.close();
  console.log('\nExploration finished. Screenshot evidence saved in docs/evidence');
}

main().catch((error) => {
  console.error('Exploration script failed:');
  console.error(error);
  process.exit(1);
});
