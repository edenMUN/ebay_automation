import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Navigation elements
  readonly logo: Locator;
  readonly navigationMenu: Locator;
  readonly homeLink: Locator;
  readonly storeLink: Locator;
  readonly menLink: Locator;
  readonly womenLink: Locator;
  readonly accessoriesLink: Locator;
  readonly aboutLink: Locator;
  readonly contactUsLink: Locator;
  readonly searchIcon: Locator;
  readonly cartIcon: Locator;

  // Hero section elements
  readonly heroSection: Locator;
  readonly shopNowButton: Locator;
  readonly findMoreButton: Locator;

  // Client logos carousel
  readonly clientLogosCarousel: Locator;
  readonly clientLogoItems: Locator;
  readonly carouselPrevButton: Locator;
  readonly carouselNextButton: Locator;

  // Promotional sections
  readonly promotionalSections: Locator;
  readonly tankTopsPromo: Locator;
  readonly eyewearPromo: Locator;
  readonly suitPromo: Locator;

  // Featured products
  readonly featuredProductsSection: Locator;
  readonly featuredProductsList: Locator;
  readonly featuredProductItems: Locator;

  // Limited time offer
  readonly limitedTimeOffer: Locator;
  readonly specialEditionSection: Locator;
  readonly discountCode: Locator;

  // Footer elements
  readonly footer: Locator;
  readonly quickLinksSection: Locator;
  readonly forHerSection: Locator;
  readonly forHimSection: Locator;
  readonly footerLinks: Locator;

  // Accessibility toolbar
  readonly accessibilityToolbar: Locator;
  readonly increaseTextButton: Locator;
  readonly decreaseTextButton: Locator;
  readonly grayscaleButton: Locator;
  readonly highContrastButton: Locator;
  readonly negativeContrastButton: Locator;
  readonly lightBackgroundButton: Locator;
  readonly linksUnderlineButton: Locator;
  readonly readableFontButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation elements
    this.logo = page.locator('a[href="/"] img[alt*="ATID"]');
    this.navigationMenu = page.locator('nav[aria-label="Site Navigation"]');
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.storeLink = page.getByRole('link', { name: 'Store' });
    this.menLink = page.getByRole('link', { name: 'Men' });
    this.womenLink = page.getByRole('link', { name: 'Women' });
    this.accessoriesLink = page.getByRole('link', { name: 'Accessories' });
    this.aboutLink = page.getByRole('link', { name: 'About' });
    this.contactUsLink = page.getByRole('link', { name: 'Contact Us' });
    this.searchIcon = page.getByRole('link', { name: 'Search' });
    this.cartIcon = page.locator('a[href*="cart"]');

    // Hero section
    this.heroSection = page.locator('main article');
    this.shopNowButton = page.getByRole('button', { name: 'Shop Now' }).first();
    this.findMoreButton = page.getByRole('button', { name: 'Find More' });

    // Client logos carousel
    this.clientLogosCarousel = page.locator('.client-logos-carousel, [class*="carousel"]');
    this.clientLogoItems = page.locator('figure img[src*="client-logo"]');
    this.carouselPrevButton = page.getByRole('button', { name: 'Previous slide' });
    this.carouselNextButton = page.getByRole('button', { name: 'Next slide' });

    // Promotional sections
    this.promotionalSections = page.locator('section:has-text("20% Off")');
    this.tankTopsPromo = page.locator('h3:has-text("20% Off On Tank Tops")');
    this.eyewearPromo = page.locator('h3:has-text("Latest Eyewear For You")');
    this.suitPromo = page.locator('h3:has-text("Let\'s Lorem Suit Up!")');

    // Featured products
    this.featuredProductsSection = page.locator('h2:has-text("Featured Products")');
    this.featuredProductsList = page.locator('ul:has(li:has-text("ATID Yellow Shoes"))');
    this.featuredProductItems = page.locator('li:has(a[href*="/product/"])');

    // Limited time offer
    this.limitedTimeOffer = page.locator('h4:has-text("Limited Time Offer")');
    this.specialEditionSection = page.locator('h2:has-text("Special Edition")');
    this.discountCode = page.locator('h4:has-text("OFF20")');

    // Footer
    this.footer = page.locator('footer');
    this.quickLinksSection = page.locator('h2:has-text("Quick Links")');
    this.forHerSection = page.locator('h2:has-text("For Her")');
    this.forHimSection = page.locator('h2:has-text("For Him")');
    this.footerLinks = page.locator('footer a[href]');

    // Accessibility toolbar
    this.accessibilityToolbar = page.locator('button:has-text("Accessibility Tools")');
    this.increaseTextButton = page.getByRole('button', { name: 'Increase Text' });
    this.decreaseTextButton = page.getByRole('button', { name: 'Decrease Text' });
    this.grayscaleButton = page.getByRole('button', { name: 'Grayscale' });
    this.highContrastButton = page.getByRole('button', { name: 'High Contrast' });
    this.negativeContrastButton = page.getByRole('button', { name: 'Negative Contrast' });
    this.lightBackgroundButton = page.getByRole('button', { name: 'Light Background' });
    this.linksUnderlineButton = page.getByRole('button', { name: 'Links Underline' });
    this.readableFontButton = page.getByRole('button', { name: 'Readable Font' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
  }

  /**
   * Navigate to homepage
   */
  async navigateToHome() {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Click on navigation link
   */
  async clickNavigationLink(linkName: string) {
    const link = this.page.getByRole('link', { name: linkName });
    await this.clickWithRetry(link);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to store page
   */
  async navigateToStore() {
    await this.clickNavigationLink('Store');
  }

  /**
   * Navigate to men's category
   */
  async navigateToMen() {
    await this.clickNavigationLink('Men');
  }

  /**
   * Navigate to women's category
   */
  async navigateToWomen() {
    await this.clickNavigationLink('Women');
  }

  /**
   * Navigate to accessories category
   */
  async navigateToAccessories() {
    await this.clickNavigationLink('Accessories');
  }

  /**
   * Navigate to about page
   */
  async navigateToAbout() {
    await this.clickNavigationLink('About');
  }

  /**
   * Navigate to contact page
   */
  async navigateToContact() {
    await this.clickNavigationLink('Contact Us');
  }

  /**
   * Click on search icon
   */
  async clickSearchIcon() {
    await this.clickWithRetry(this.searchIcon);
  }

  /**
   * Click on cart icon
   */
  async clickCartIcon() {
    await this.clickWithRetry(this.cartIcon);
  }

  /**
   * Get cart item count and total
   */
  async getCartInfo(): Promise<{ count: string; total: string }> {
    const cartText = await this.getElementText(this.cartIcon);
    // Extract count and total from cart text (e.g., "240.00 ₪ 2")
    const match = cartText.match(/(\d+\.\d+)\s*₪\s*(\d+)/);
    return {
      total: match ? match[1] || '0.00' : '0.00',
      count: match ? match[2] || '0' : '0'
    };
  }

  /**
   * Click on featured product
   */
  async clickFeaturedProduct(productName: string) {
    const productLink = this.page.getByRole('link', { name: productName });
    await this.clickWithRetry(productLink);
    await this.waitForPageLoad();
  }

  /**
   * Click on promotional section
   */
  async clickPromotionalSection(sectionName: string) {
    const promoButton = this.page.getByRole('button', { name: sectionName });
    await this.clickWithRetry(promoButton);
  }

  /**
   * Open accessibility toolbar
   */
  async openAccessibilityToolbar() {
    await this.clickWithRetry(this.accessibilityToolbar);
  }

  /**
   * Increase text size
   */
  async increaseTextSize() {
    await this.openAccessibilityToolbar();
    await this.clickWithRetry(this.increaseTextButton);
  }

  /**
   * Decrease text size
   */
  async decreaseTextSize() {
    await this.openAccessibilityToolbar();
    await this.clickWithRetry(this.decreaseTextButton);
  }

  /**
   * Apply grayscale filter
   */
  async applyGrayscale() {
    await this.openAccessibilityToolbar();
    await this.clickWithRetry(this.grayscaleButton);
  }

  /**
   * Apply high contrast
   */
  async applyHighContrast() {
    await this.openAccessibilityToolbar();
    await this.clickWithRetry(this.highContrastButton);
  }

  /**
   * Reset accessibility settings
   */
  async resetAccessibilitySettings() {
    await this.openAccessibilityToolbar();
    await this.clickWithRetry(this.resetButton);
  }

  /**
   * Navigate carousel to next slide
   */
  async nextCarouselSlide() {
    await this.clickWithRetry(this.carouselNextButton);
  }

  /**
   * Navigate carousel to previous slide
   */
  async previousCarouselSlide() {
    await this.clickWithRetry(this.carouselPrevButton);
  }

  /**
   * Get featured products count
   */
  async getFeaturedProductsCount(): Promise<number> {
    return await this.featuredProductItems.count();
  }

  /**
   * Verify homepage elements are visible
   */
  async verifyHomepageElements() {
    await this.assertElementVisible(this.logo, 'Logo should be visible');
    await this.assertElementVisible(this.navigationMenu, 'Navigation menu should be visible');
    await this.assertElementVisible(this.heroSection, 'Hero section should be visible');
    await this.assertElementVisible(this.featuredProductsSection, 'Featured products section should be visible');
    await this.assertElementVisible(this.footer, 'Footer should be visible');
  }

  /**
   * Verify navigation links are functional
   */
  async verifyNavigationLinks() {
    const links = [
      { name: 'Home', expectedUrl: '/' },
      { name: 'Store', expectedUrl: '/store/' },
      { name: 'Men', expectedUrl: '/product-category/men/' },
      { name: 'Women', expectedUrl: '/product-category/women/' },
      { name: 'Accessories', expectedUrl: '/product-category/accessories/' },
      { name: 'About', expectedUrl: '/about/' },
      { name: 'Contact Us', expectedUrl: '/contact-us/' }
    ];

    for (const link of links) {
      await this.clickNavigationLink(link.name);
      await this.assertUrlContains(link.expectedUrl);
      await this.navigateToHome();
    }
  }

  /**
   * Verify accessibility features
   */
  async verifyAccessibilityFeatures() {
    await this.openAccessibilityToolbar();
    await this.assertElementVisible(this.increaseTextButton, 'Increase text button should be visible');
    await this.assertElementVisible(this.decreaseTextButton, 'Decrease text button should be visible');
    await this.assertElementVisible(this.grayscaleButton, 'Grayscale button should be visible');
    await this.assertElementVisible(this.highContrastButton, 'High contrast button should be visible');
    await this.assertElementVisible(this.resetButton, 'Reset button should be visible');
  }
} 