import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  // Product information elements
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly originalPrice: Locator;
  readonly salePrice: Locator;
  readonly productRating: Locator;
  readonly ratingStars: Locator;
  readonly reviewCount: Locator;
  readonly productDescription: Locator;
  readonly productCategory: Locator;

  // Product images
  readonly productImage: Locator;
  readonly imageZoomButton: Locator;
  readonly imageGallery: Locator;
  readonly thumbnailImages: Locator;

  // Add to cart section
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly outOfStockMessage: Locator;
  readonly addToCartSuccessMessage: Locator;

  // Product tabs
  readonly descriptionTab: Locator;
  readonly reviewsTab: Locator;
  readonly descriptionContent: Locator;
  readonly reviewsContent: Locator;

  // Related products
  readonly relatedProductsSection: Locator;
  readonly relatedProductsList: Locator;
  readonly relatedProductItems: Locator;

  // Breadcrumb navigation
  readonly breadcrumbNavigation: Locator;
  readonly breadcrumbLinks: Locator;

  // Sale badge
  readonly saleBadge: Locator;

  constructor(page: Page) {
    super(page);
    
    // Product information elements
    this.productTitle = page.locator('h1');
    this.productPrice = page.locator('p:has(text=/\\d+\\.\\d+ ₪/)');
    this.originalPrice = page.locator('del:has(text=/\\d+\\.\\d+ ₪/)');
    this.salePrice = page.locator('ins:has(text=/\\d+\\.\\d+ ₪/)');
    this.productRating = page.locator('img[alt*="Rated"]');
    this.ratingStars = page.locator('strong:has-text(/\\d+\\.\\d+/)');
    this.reviewCount = page.locator('a:has-text("customer reviews")');
    this.productDescription = page.locator('p:has-text("Lorem ipsum")');
    this.productCategory = page.locator('a[href*="/product-category/"]');

    // Product images
    this.productImage = page.locator('img[src*="sports-shoe"]');
    this.imageZoomButton = page.locator('a:has-text("🔍")');
    this.imageGallery = page.locator('figure');
    this.thumbnailImages = page.locator('img[src*=".jpg"]');

    // Add to cart section
    this.quantityInput = page.getByRole('spinbutton', { name: 'Product quantity' });
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.outOfStockMessage = page.locator('text=Out of stock');
    this.addToCartSuccessMessage = page.locator('text=has been added to your cart');

    // Product tabs
    this.descriptionTab = page.getByRole('tab', { name: 'Description' });
    this.reviewsTab = page.getByRole('tab', { name: 'Reviews' });
    this.descriptionContent = page.getByRole('tabpanel', { name: 'Description' });
    this.reviewsContent = page.getByRole('tabpanel', { name: 'Reviews' });

    // Related products
    this.relatedProductsSection = page.locator('h2:has-text("Related products")');
    this.relatedProductsList = page.locator('ul:has(li:has(a[href*="/product/"]))');
    this.relatedProductItems = page.locator('li:has(a[href*="/product/"])');

    // Breadcrumb navigation
    this.breadcrumbNavigation = page.locator('nav:has(a[href="/"])');
    this.breadcrumbLinks = page.locator('nav a[href]');

    // Sale badge
    this.saleBadge = page.locator('text=Sale!');
  }

  /**
   * Navigate to product page
   */
  async navigateToProduct(productSlug: string) {
    await this.goto(`/product/${productSlug}/`);
    await this.waitForPageLoad();
  }

  /**
   * Get product title
   */
  async getProductTitle(): Promise<string> {
    return await this.getElementText(this.productTitle);
  }

  /**
   * Get product price
   */
  async getProductPrice(): Promise<string> {
    const priceText = await this.getElementText(this.productPrice);
    const match = priceText.match(/(\d+\.\d+)\s*₪/);
    return match ? match[1] : '0.00';
  }

  /**
   * Get original price (if on sale)
   */
  async getOriginalPrice(): Promise<string> {
    if (await this.isElementVisible(this.originalPrice)) {
      const originalPriceText = await this.getElementText(this.originalPrice);
      const match = originalPriceText.match(/(\d+\.\d+)\s*₪/);
      return match ? match[1] : '0.00';
    }
    return '0.00';
  }

  /**
   * Get sale price (if on sale)
   */
  async getSalePrice(): Promise<string> {
    if (await this.isElementVisible(this.salePrice)) {
      const salePriceText = await this.getElementText(this.salePrice);
      const match = salePriceText.match(/(\d+\.\d+)\s*₪/);
      return match ? match[1] : '0.00';
    }
    return '0.00';
  }

  /**
   * Get product rating
   */
  async getProductRating(): Promise<string> {
    const ratingText = await this.getElementText(this.ratingStars);
    const match = ratingText.match(/(\d+\.\d+)/);
    return match ? match[1] : '0.00';
  }

  /**
   * Get review count
   */
  async getReviewCount(): Promise<string> {
    const reviewText = await this.getElementText(this.reviewCount);
    const match = reviewText.match(/(\d+)/);
    return match ? match[1] : '0';
  }

  /**
   * Get product description
   */
  async getProductDescription(): Promise<string> {
    return await this.getElementText(this.productDescription);
  }

  /**
   * Get product category
   */
  async getProductCategory(): Promise<string> {
    return await this.getElementText(this.productCategory);
  }

  /**
   * Set product quantity
   */
  async setQuantity(quantity: number) {
    await this.fillWithRetry(this.quantityInput, quantity.toString());
  }

  /**
   * Add product to cart
   */
  async addToCart(quantity: number = 1) {
    if (quantity > 1) {
      await this.setQuantity(quantity);
    }
    await this.clickWithRetry(this.addToCartButton);
    await this.waitForPageLoad();
  }

  /**
   * Click on image zoom
   */
  async clickImageZoom() {
    await this.clickWithRetry(this.imageZoomButton);
  }

  /**
   * Switch to description tab
   */
  async switchToDescriptionTab() {
    await this.clickWithRetry(this.descriptionTab);
  }

  /**
   * Switch to reviews tab
   */
  async switchToReviewsTab() {
    await this.clickWithRetry(this.reviewsTab);
  }

  /**
   * Click on related product
   */
  async clickRelatedProduct(productName: string) {
    const relatedProductLink = this.page.getByRole('link', { name: productName });
    await this.clickWithRetry(relatedProductLink);
    await this.waitForPageLoad();
  }

  /**
   * Get related products count
   */
  async getRelatedProductsCount(): Promise<number> {
    return await this.relatedProductItems.count();
  }

  /**
   * Check if product is on sale
   */
  async isProductOnSale(): Promise<boolean> {
    return await this.isElementVisible(this.saleBadge);
  }

  /**
   * Check if product is out of stock
   */
  async isProductOutOfStock(): Promise<boolean> {
    return await this.isElementVisible(this.outOfStockMessage);
  }

  /**
   * Check if add to cart was successful
   */
  async isAddToCartSuccessful(): Promise<boolean> {
    return await this.isElementVisible(this.addToCartSuccessMessage);
  }

  /**
   * Get breadcrumb path
   */
  async getBreadcrumbPath(): Promise<string[]> {
    const breadcrumbText = await this.getElementText(this.breadcrumbNavigation);
    return breadcrumbText.split('/').map(item => item.trim()).filter(item => item);
  }

  /**
   * Verify product page elements
   */
  async verifyProductPageElements() {
    await this.assertElementVisible(this.productTitle, 'Product title should be visible');
    await this.assertElementVisible(this.productPrice, 'Product price should be visible');
    await this.assertElementVisible(this.productImage, 'Product image should be visible');
    await this.assertElementVisible(this.quantityInput, 'Quantity input should be visible');
    await this.assertElementVisible(this.addToCartButton, 'Add to cart button should be visible');
    await this.assertElementVisible(this.descriptionTab, 'Description tab should be visible');
    await this.assertElementVisible(this.relatedProductsSection, 'Related products section should be visible');
  }

  /**
   * Verify product information
   */
  async verifyProductInformation() {
    const title = await this.getProductTitle();
    if (!title) {
      throw new Error('Product title should not be empty');
    }

    const price = await this.getProductPrice();
    if (price === '0.00') {
      throw new Error('Product price should be greater than 0');
    }

    const rating = await this.getProductRating();
    if (parseFloat(rating) < 0 || parseFloat(rating) > 5) {
      throw new Error('Product rating should be between 0 and 5');
    }
  }

  /**
   * Verify sale pricing (if applicable)
   */
  async verifySalePricing() {
    if (await this.isProductOnSale()) {
      const originalPrice = await this.getOriginalPrice();
      const salePrice = await this.getSalePrice();
      
      if (parseFloat(originalPrice) <= parseFloat(salePrice)) {
        throw new Error('Sale price should be less than original price');
      }
    }
  }

  /**
   * Verify add to cart functionality
   */
  async verifyAddToCartFunctionality() {
    if (await this.isProductOutOfStock()) {
      await this.assertElementVisible(this.outOfStockMessage, 'Out of stock message should be visible');
      const isButtonDisabled = !(await this.isElementEnabled(this.addToCartButton));
      if (!isButtonDisabled) {
        throw new Error('Add to cart button should be disabled for out of stock products');
      }
    } else {
      await this.addToCart(1);
      await this.assertElementVisible(this.addToCartSuccessMessage, 'Add to cart success message should be visible');
    }
  }

  /**
   * Verify product tabs functionality
   */
  async verifyProductTabsFunctionality() {
    // Test description tab
    await this.switchToDescriptionTab();
    await this.assertElementVisible(this.descriptionContent, 'Description content should be visible');

    // Test reviews tab
    await this.switchToReviewsTab();
    await this.assertElementVisible(this.reviewsContent, 'Reviews content should be visible');
  }

  /**
   * Verify related products
   */
  async verifyRelatedProducts() {
    await this.assertElementVisible(this.relatedProductsSection, 'Related products section should be visible');
    const relatedProductsCount = await this.getRelatedProductsCount();
    if (relatedProductsCount === 0) {
      throw new Error('Should have at least one related product');
    }
  }

  /**
   * Verify breadcrumb navigation
   */
  async verifyBreadcrumbNavigation() {
    await this.assertElementVisible(this.breadcrumbNavigation, 'Breadcrumb navigation should be visible');
    const breadcrumbPath = await this.getBreadcrumbPath();
    if (breadcrumbPath.length < 2) {
      throw new Error('Breadcrumb should have at least Home and current page');
    }
  }

  /**
   * Verify image zoom functionality
   */
  async verifyImageZoomFunctionality() {
    if (await this.isElementVisible(this.imageZoomButton)) {
      await this.clickImageZoom();
      // Wait for zoom modal or enlarged image
      await this.page.waitForTimeout(1000);
    }
  }
} 