# Test Scenarios

## Login and authentication
- Valid user logs in and reaches Products.
- Locked-out user is blocked with a clear message.
- Wrong password, unknown user, empty username and empty password are rejected with specific messages.
- Logged-in user can log out.
- Products page cannot be opened directly without logging in.

## Product listing and sorting
- All products are displayed.
- Sort by name (A-Z, Z-A) and by price (low-high, high-low) orders items correctly.

## Shopping cart
- Adding one or several products updates the cart badge and button state.
- Removing a product updates the badge and button state.
- Cart page lists exactly the added products; items can be removed there.
- Continue Shopping returns to Products.

## Checkout
- Missing first name, last name or postal code is rejected with the correct message.
- Cancel returns to the cart.
- Overview subtotal equals the sum of item prices and total equals subtotal plus tax.
- A valid order completes with a confirmation message.

## End-to-end
- Login, add products, checkout, finish, return home with an empty cart.
- Full purchase followed by logout.

## Exploratory charters (manual, time-boxed; record only real findings)
1. Explore the Products and cart pages as `problem_user` and compare with `standard_user`.
2. Explore behaviour as `performance_glitch_user` (response times after login and navigation).
3. Explore checkout with unusual input (very long text, special characters, whitespace only).
4. Explore browser back/forward and page refresh during checkout.
5. Explore cart state after logout and login again.
