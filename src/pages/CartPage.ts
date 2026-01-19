import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Cart table elements
  readonly cartTable: Locator;
  readonly cartItems: Locator;
  readonly removeItemButtons: Locator;
  readonly productImages: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;
  readonly quantityInputs: Locator;
  readonly subtotals: Locator;

  // Coupon section
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly updateCartButton: Locator;

  // Cart totals section
  readonly cartTotalsSection: Locator;
  readonly subtotalRow: Locator;
  readonly subtotalAmount: Locator;
  readonly shippingSection: Locator;
  readonly shippingOptions: Locator;
  readonly totalRow: Locator;
  readonly totalAmount: Locator;

  // Shipping options
  readonly freeShippingOption: Locator;
  readonly localPickupOption: Locator;
  readonly expressDeliveryOption: Locator;
  readonly registeredMailOption: Locator;
  readonly calculateShippingLink: Locator;

  // Action buttons
  readonly proceedToCheckoutButton: Locator;
  readonly continueShoppingLink: Locator;

  // Empty cart
  readonly emptyCartMessage: Locator;
  readonly returnToShopButton: Locator;

  // Cart header
  readonly cartHeader: Locator;
  readonly cartItemCount: Locator;

  constructor(page: Page) {
    super(page);
    
    // Cart table elements
    this.cartTable = page.locator('table');
    this.cartItems = page.locator('tbody tr:has(td)');
    this.removeItemButtons = page.locator('a[href*="remove_item"]');
    this.productImages = page.locator('td img');
    this.productTitles = page.locator('td a[href*="/product/"]');
    this.productPrices = page.locator('td:has(text=/\\d+\\.\\d+ ₪/)');
    this.quantityInputs = page.getByRole('spinbutton', { name: 'Product quantity' });
    this.subtotals = page.locator('td:has(text=/\\d+\\.\\d+ ₪/)');

    // Coupon section
    this.couponInput = page.getByPlaceholder('Coupon:');
    this.applyCouponButton = page.getByRole('button', { name: 'Apply coupon' });
    this.updateCartButton = page.getByRole('button', { name: 'Update cart' });

    // Cart totals section
    this.cartTotalsSection = page.locator('h2:has-text("Cart totals")');
    this.subtotalRow = page.locator('tr:has(td:has-text("Subtotal"))');
    this.subtotalAmount = page.locator('tr:has(td:has-text("Subtotal")) td:last-child');
    this.shippingSection = page.locator('tr:has(td:has-text("Shipping"))');
    this.shippingOptions = page.locator('input[type="radio"]');
    this.totalRow = page.locator('tr:has(td:has-text("Total"))');
    this.totalAmount = page.locator('tr:has(td:has-text("Total")) td:last-child strong');

    // Shipping options
    this.freeShippingOption = page.getByRole('radio', { name: 'Free shipping' });
    this.localPickupOption = page.getByRole('radio', { name: 'Local pickup' });
    this.expressDeliveryOption = page.getByRole('radio', { name: /Express.*12\.50 ₪/ });
    this.registeredMailOption = page.getByRole('radio', { name: /Registered.*5\.90 ₪/ });
    this.calculateShippingLink = page.getByRole('link', { name: 'Calculate shipping' });

    // Action buttons
    this.proceedToCheckoutButton = page.getByRole('link', { name: 'Proceed to checkout' });
    this.continueShoppingLink = page.getByRole('link', { name: 'Continue shopping' });

    // Empty cart
    this.emptyCartMessage = page.locator('text=Your cart is currently empty');
    this.returnToShopButton = page.getByRole('link', { name: 'Return to shop' });

    // Cart header
    this.cartHeader = page.locator('h1:has-text("Cart")');
    this.cartItemCount = page.locator('tbody tr');
  }

  /**
   * Navigate to cart page
   */
  async navigateToCart() {
    await this.goto('/cart-2/');
    await this.waitForPageLoad();
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get product title by index
   */
  async getProductTitle(index: number = 0): Promise<string> {
    const productTitles = this.page.locator('td a[href*="/product/"]');
    return await this.getElementText(productTitles.nth(index));
  }

  /**
   * Get product price by index
   */
  async getProductPrice(index: number = 0): Promise<string> {
    const productPrices = this.page.locator('td:has(text=/\\d+\\.\\d+ ₪/)');
    const priceText = await this.getElementText(productPrices.nth(index));
    const match = priceText.match(/(\d+\.\d+)\s*₪/);
    return match ? match[1] || '0.00' : '0.00';
  }

  /**
   * Get product quantity by index
   */
  async getProductQuantity(index: number = 0): Promise<string> {
    const quantityInputs = this.page.getByRole('spinbutton', { name: 'Product quantity' });
    return await this.getElementAttribute(quantityInputs.nth(index), 'value') || '1';
  }

  /**
   * Get product subtotal by index
   */
  async getProductSubtotal(index: number = 0): Promise<string> {
    const subtotals = this.page.locator('td:has(text=/\\d+\\.\\d+ ₪/)');
    const subtotalText = await this.getElementText(subtotals.nth(index));
    const match = subtotalText.match(/(\d+\.\d+)\s*₪/);
    return match ? match[1] || '0.00' : '0.00';
  }

  /**
   * Update product quantity
   */
  async updateProductQuantity(index: number, quantity: number) {
    const quantityInputs = this.page.getByRole('spinbutton', { name: 'Product quantity' });
    await this.fillWithRetry(quantityInputs.nth(index), quantity.toString());
    await this.clickWithRetry(this.updateCartButton);
    await this.waitForPageLoad();
  }

  /**
   * Remove product from cart
   */
  async removeProduct(index: number = 0) {
    const removeButtons = this.page.locator('a[href*="remove_item"]');
    await this.clickWithRetry(removeButtons.nth(index));
    await this.waitForPageLoad();
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(couponCode: string) {
    await this.fillWithRetry(this.couponInput, couponCode);
    await this.clickWithRetry(this.applyCouponButton);
    await this.waitForPageLoad();
  }

  /**
   * Get subtotal amount
   */
  async getSubtotalAmount(): Promise<string> {
    const subtotalText = await this.getElementText(this.subtotalAmount);
    const match = subtotalText.match(/(\d+\.\d+)\s*₪/);
    return match ? match[1] || '0.00' : '0.00';
  }

  /**
   * Get total amount
   */
  async getTotalAmount(): Promise<string> {
    const totalText = await this.getElementText(this.totalAmount);
    const match = totalText.match(/(\d+\.\d+)\s*₪/);
    return match ? match[1] || '0.00' : '0.00';
  }

  /**
   * Select shipping option
   */
  async selectShippingOption(optionName: string) {
    let shippingOption: Locator;
    
    switch (optionName.toLowerCase()) {
      case 'free shipping':
        shippingOption = this.freeShippingOption;
        break;
      case 'local pickup':
        shippingOption = this.localPickupOption;
        break;
      case 'express delivery':
        shippingOption = this.expressDeliveryOption;
        break;
      case 'registered mail':
        shippingOption = this.registeredMailOption;
        break;
      default:
        throw new Error(`Unknown shipping option: ${optionName}`);
    }

    await this.clickWithRetry(shippingOption);
    await this.waitForPageLoad();
  }

  /**
   * Get selected shipping option
   */
  async getSelectedShippingOption(): Promise<string> {
    const checkedOption = this.page.locator('input[type="radio"]:checked');
    const parentLabel = checkedOption.locator('..');
    return await this.getElementText(parentLabel);
  }

  /**
   * Calculate shipping
   */
  async calculateShipping() {
    await this.clickWithRetry(this.calculateShippingLink);
    await this.waitForPageLoad();
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.clickWithRetry(this.proceedToCheckoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Continue shopping
   */
  async continueShopping() {
    await this.clickWithRetry(this.continueShoppingLink);
    await this.waitForPageLoad();
  }

  /**
   * Return to shop (when cart is empty)
   */
  async returnToShop() {
    await this.clickWithRetry(this.returnToShopButton);
    await this.waitForPageLoad();
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    return await this.isElementVisible(this.emptyCartMessage);
  }

  /**
   * Check if update cart button is enabled
   */
  async isUpdateCartButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.updateCartButton);
  }

  /**
   * Verify cart page elements
   */
  async verifyCartPageElements() {
    await this.assertElementVisible(this.cartHeader, 'Cart header should be visible');
    await this.assertElementVisible(this.cartTable, 'Cart table should be visible');
    await this.assertElementVisible(this.cartTotalsSection, 'Cart totals section should be visible');
    await this.assertElementVisible(this.proceedToCheckoutButton, 'Proceed to checkout button should be visible');
  }

  /**
   * Verify cart calculations
   */
  async verifyCartCalculations() {
    if (await this.isCartEmpty()) {
      return; // Skip calculations for empty cart
    }

    const subtotal = await this.getSubtotalAmount();
    const total = await this.getTotalAmount();

    // Verify subtotal is not zero
    if (parseFloat(subtotal) <= 0) {
      throw new Error('Subtotal should be greater than 0');
    }

    // Verify total is not zero
    if (parseFloat(total) <= 0) {
      throw new Error('Total should be greater than 0');
    }

    // Verify total is at least equal to subtotal
    if (parseFloat(total) < parseFloat(subtotal)) {
      throw new Error('Total should be at least equal to subtotal');
    }
  }

  /**
   * Verify shipping options
   */
  async verifyShippingOptions() {
    await this.assertElementVisible(this.freeShippingOption, 'Free shipping option should be visible');
    await this.assertElementVisible(this.localPickupOption, 'Local pickup option should be visible');
    await this.assertElementVisible(this.expressDeliveryOption, 'Express delivery option should be visible');
    await this.assertElementVisible(this.registeredMailOption, 'Registered mail option should be visible');
  }

  /**
   * Verify product information in cart
   */
  async verifyProductInformation() {
    if (await this.isCartEmpty()) {
      return; // Skip for empty cart
    }

    const productTitle = await this.getProductTitle(0);
    if (!productTitle) {
      throw new Error('Product title should not be empty');
    }

    const productPrice = await this.getProductPrice(0);
    if (parseFloat(productPrice) <= 0) {
      throw new Error('Product price should be greater than 0');
    }

    const productQuantity = await this.getProductQuantity(0);
    if (parseInt(productQuantity) <= 0) {
      throw new Error('Product quantity should be greater than 0');
    }
  }

  /**
   * Verify quantity update functionality
   */
  async verifyQuantityUpdateFunctionality() {
    if (await this.isCartEmpty()) {
      return; // Skip for empty cart
    }

    const initialQuantity = await this.getProductQuantity(0);
    const newQuantity = parseInt(initialQuantity) + 1;
    
    await this.updateProductQuantity(0, newQuantity);
    
    const updatedQuantity = await this.getProductQuantity(0);
    if (parseInt(updatedQuantity) !== newQuantity) {
      throw new Error(`Quantity should be updated to ${newQuantity}, but found ${updatedQuantity}`);
    }
  }

  /**
   * Verify remove product functionality
   */
  async verifyRemoveProductFunctionality() {
    if (await this.isCartEmpty()) {
      return; // Skip for empty cart
    }

    const initialCount = await this.getCartItemsCount();
    await this.removeProduct(0);
    
    const updatedCount = await this.getCartItemsCount();
    if (updatedCount >= initialCount) {
      throw new Error('Product should be removed from cart');
    }
  }

  /**
   * Verify coupon functionality
   */
  async verifyCouponFunctionality() {
    await this.assertElementVisible(this.couponInput, 'Coupon input should be visible');
    await this.assertElementVisible(this.applyCouponButton, 'Apply coupon button should be visible');
    
    // Test with invalid coupon
    await this.applyCoupon('INVALID_COUPON');
    // Note: Actual error message verification would depend on the specific implementation
  }

  /**
   * Verify empty cart state
   */
  async verifyEmptyCartState() {
    if (await this.isCartEmpty()) {
      await this.assertElementVisible(this.emptyCartMessage, 'Empty cart message should be visible');
      await this.assertElementVisible(this.returnToShopButton, 'Return to shop button should be visible');
    }
  }
} 