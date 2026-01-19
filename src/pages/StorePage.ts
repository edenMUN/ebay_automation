import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class StorePage extends BasePage {
  // Search and filter elements
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly priceFilterSection: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly filterButton: Locator;
  readonly priceRange: Locator;

  // Category filters
  readonly categorySection: Locator;
  readonly accessoriesCategory: Locator;
  readonly menCategory: Locator;
  readonly womenCategory: Locator;
  readonly categoryCounts: Locator;

  // Best sellers section
  readonly bestSellersSection: Locator;
  readonly bestSellersList: Locator;
  readonly bestSellerItems: Locator;

  // Product grid
  readonly productGrid: Locator;
  readonly productItems: Locator;
  readonly productLinks: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;
  readonly productRatings: Locator;
  readonly saleBadges: Locator;
  readonly outOfStockBadges: Locator;

  // Sorting and pagination
  readonly sortDropdown: Locator;
  readonly paginationSection: Locator;
  readonly paginationLinks: Locator;
  readonly currentPage: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly resultsCount: Locator;

  // Breadcrumb navigation
  readonly breadcrumbNavigation: Locator;
  readonly breadcrumbLinks: Locator;

  constructor(page: Page) {
    super(page);
    
    // Search and filter elements
    this.searchBox = page.getByPlaceholder('Search products…');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.priceFilterSection = page.locator('h2:has-text("Filter by Price")');
    this.minPriceInput = page.locator('input[placeholder*="min"]');
    this.maxPriceInput = page.locator('input[placeholder*="max"]');
    this.filterButton = page.getByRole('button', { name: 'Filter' });
    this.priceRange = page.locator('text=Price: 30 ₪ — 250 ₪');

    // Category filters
    this.categorySection = page.locator('h2:has-text("Categories")');
    this.accessoriesCategory = page.getByRole('link', { name: 'Accessories' });
    this.menCategory = page.getByRole('link', { name: 'Men' });
    this.womenCategory = page.getByRole('link', { name: 'Women' });
    this.categoryCounts = page.locator('text=/\\d+/');

    // Best sellers section
    this.bestSellersSection = page.locator('h2:has-text("Our Best Sellers")');
    this.bestSellersList = page.locator('ul:has(li:has-text("Boho Bangle Bracelet"))');
    this.bestSellerItems = page.locator('li:has(a[href*="/product/"])');

    // Product grid
    this.productGrid = page.locator('main ul');
    this.productItems = page.locator('li:has(a[href*="/product/"])');
    this.productLinks = page.locator('a[href*="/product/"]');
    this.productTitles = page.locator('h2:has-text("")');
    this.productPrices = page.locator('text=/\\d+\\.\\d+ ₪/');
    this.productRatings = page.locator('img[alt*="Rated"]');
    this.saleBadges = page.locator('text=Sale!');
    this.outOfStockBadges = page.locator('text=Out of stock');

    // Sorting and pagination
    this.sortDropdown = page.getByRole('combobox', { name: 'Shop order' });
    this.paginationSection = page.locator('nav:has(a[href*="page"])');
    this.paginationLinks = page.locator('nav a[href*="page"]');
    this.currentPage = page.locator('nav li:has-text("1")');
    this.nextPageButton = page.locator('nav a:has-text("→")');
    this.previousPageButton = page.locator('nav a:has-text("←")');
    this.resultsCount = page.locator('text=Showing 1–12 of 31 results');

    // Breadcrumb navigation
    this.breadcrumbNavigation = page.locator('nav:has(a[href="/"])');
    this.breadcrumbLinks = page.locator('nav a[href]');
  }

  /**
   * Navigate to store page
   */
  async navigateToStore() {
    await this.goto('/store/');
    await this.waitForPageLoad();
  }

  /**
   * Search for products
   */
  async searchProducts(searchTerm: string) {
    await this.fillWithRetry(this.searchBox, searchTerm);
    await this.clickWithRetry(this.searchButton);
    await this.waitForPageLoad();
  }

  /**
   * Filter by price range
   */
  async filterByPrice(minPrice: string, maxPrice: string) {
    await this.fillWithRetry(this.minPriceInput, minPrice);
    await this.fillWithRetry(this.maxPriceInput, maxPrice);
    await this.clickWithRetry(this.filterButton);
    await this.waitForPageLoad();
  }

  /**
   * Filter by category
   */
  async filterByCategory(categoryName: string) {
    const categoryLink = this.page.getByRole('link', { name: categoryName });
    await this.clickWithRetry(categoryLink);
    await this.waitForPageLoad();
  }

  /**
   * Sort products
   */
  async sortProducts(sortOption: string) {
    await this.sortDropdown.selectOption({ label: sortOption });
    await this.waitForPageLoad();
  }

  /**
   * Navigate to specific page
   */
  async navigateToPage(pageNumber: number) {
    const pageLink = this.page.locator(`nav a:has-text("${pageNumber}")`);
    await this.clickWithRetry(pageLink);
    await this.waitForPageLoad();
  }

  /**
   * Click on product
   */
  async clickProduct(productName: string) {
    const productLink = this.page.getByRole('link', { name: productName });
    await this.clickWithRetry(productLink);
    await this.waitForPageLoad();
  }

  /**
   * Click on best seller product
   */
  async clickBestSeller(productName: string) {
    const bestSellerLink = this.page.getByRole('link', { name: productName });
    await this.clickWithRetry(bestSellerLink);
    await this.waitForPageLoad();
  }

  /**
   * Get products count
   */
  async getProductsCount(): Promise<number> {
    return await this.productItems.count();
  }

  /**
   * Get best sellers count
   */
  async getBestSellersCount(): Promise<number> {
    return await this.bestSellerItems.count();
  }

  /**
   * Get category count
   */
  async getCategoryCount(categoryName: string): Promise<string> {
    const categoryLink = this.page.getByRole('link', { name: categoryName });
    const parentElement = categoryLink.locator('..');
    const countElement = parentElement.locator('text=/\\d+/');
    const countText = await this.getElementText(countElement);
    return countText || '0';
  }

  /**
   * Get current page number
   */
  async getCurrentPageNumber(): Promise<string> {
    const currentPageText = await this.getElementText(this.currentPage);
    return (currentPageText || '').replace(/\D/g, '');
  }

  /**
   * Get total results count
   */
  async getTotalResultsCount(): Promise<string> {
    const resultsText = await this.getElementText(this.resultsCount);
    const match = resultsText.match(/of (\d+) results/);
    return match && match[1] ? match[1] : '0';
  }

  /**
   * Get product price
   */
  async getProductPrice(productName: string): Promise<string> {
    const productItem = this.page.locator(`li:has(a:has-text("${productName}"))`);
    const priceElement = productItem.locator('text=/\\d+\\.\\d+ ₪/').first();
    return await this.getElementText(priceElement);
  }

  /**
   * Get product rating
   */
  async getProductRating(productName: string): Promise<string> {
    const productItem = this.page.locator(`li:has(a:has-text("${productName}"))`);
    const ratingElement = productItem.locator('img[alt*="Rated"]');
    const altText = await this.getElementAttribute(ratingElement, 'alt');
    const match = (altText || '').match(/(\d+\.\d+)/);
    return match && match[1] ? match[1] : '0.00';
  }

  /**
   * Check if product is on sale
   */
  async isProductOnSale(productName: string): Promise<boolean> {
    const productItem = this.page.locator(`li:has(a:has-text("${productName}"))`);
    const saleBadge = productItem.locator('text=Sale!');
    return await this.isElementVisible(saleBadge);
  }

  /**
   * Check if product is out of stock
   */
  async isProductOutOfStock(productName: string): Promise<boolean> {
    const productItem = this.page.locator(`li:has(a:has-text("${productName}"))`);
    const outOfStockBadge = productItem.locator('text=Out of stock');
    return await this.isElementVisible(outOfStockBadge);
  }

  /**
   * Verify store page elements
   */
  async verifyStorePageElements() {
    await this.assertElementVisible(this.searchBox, 'Search box should be visible');
    await this.assertElementVisible(this.priceFilterSection, 'Price filter section should be visible');
    await this.assertElementVisible(this.categorySection, 'Category section should be visible');
    await this.assertElementVisible(this.bestSellersSection, 'Best sellers section should be visible');
    await this.assertElementVisible(this.productGrid, 'Product grid should be visible');
    await this.assertElementVisible(this.sortDropdown, 'Sort dropdown should be visible');
    await this.assertElementVisible(this.paginationSection, 'Pagination should be visible');
  }

  /**
   * Verify category counts
   */
  async verifyCategoryCounts() {
    const expectedCounts = {
      'Accessories': '7',
      'Men': '14',
      'Women': '17'
    };

    for (const [category, expectedCount] of Object.entries(expectedCounts)) {
      const actualCount = await this.getCategoryCount(category);
      if (actualCount !== expectedCount) {
        throw new Error(`Expected ${category} to have ${expectedCount} products, but found ${actualCount}`);
      }
    }
  }

  /**
   * Verify price range filter
   */
  async verifyPriceRangeFilter() {
    await this.assertElementVisible(this.priceRange, 'Price range should be visible');
    const priceRangeText = await this.getElementText(this.priceRange);
    if (!priceRangeText.includes('30 ₪') || !priceRangeText.includes('250 ₪')) {
      throw new Error('Price range should show 30 ₪ — 250 ₪');
    }
  }

  /**
   * Verify sorting options
   */
  async verifySortingOptions() {
    const expectedOptions = [
      'Default sorting',
      'Sort by popularity',
      'Sort by average rating',
      'Sort by latest',
      'Sort by price: low to high',
      'Sort by price: high to low'
    ];

    for (const option of expectedOptions) {
      const optionElement = this.page.locator(`option:has-text("${option}")`);
      await this.assertElementVisible(optionElement, `Sort option "${option}" should be visible`);
    }
  }

  /**
   * Verify pagination
   */
  async verifyPagination() {
    await this.assertElementVisible(this.paginationSection, 'Pagination should be visible');
    const paginationLinks = await this.paginationLinks.count();
    if (paginationLinks < 2) {
      throw new Error('Should have at least 2 pagination links');
    }
  }

  /**
   * Verify breadcrumb navigation
   */
  async verifyBreadcrumbNavigation() {
    await this.assertElementVisible(this.breadcrumbNavigation, 'Breadcrumb navigation should be visible');
    const breadcrumbText = await this.getElementText(this.breadcrumbNavigation);
    if (!breadcrumbText.includes('Home') || !breadcrumbText.includes('Store')) {
      throw new Error('Breadcrumb should contain Home and Store');
    }
  }
} 