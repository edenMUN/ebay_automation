import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click on element with retry logic
   */
  async clickWithRetry(locator: Locator, maxRetries: number = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input field with retry logic
   */
  async fillWithRetry(locator: Locator, value: string, maxRetries: number = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.fill(value);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(locator: Locator, message?: string) {
    await expect(locator).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(locator: Locator, text: string, message?: string) {
    await expect(locator).toContainText(text);
  }

  /**
   * Assert element has exact text
   */
  async assertElementHasText(locator: Locator, text: string, message?: string) {
    await expect(locator).toHaveText(text);
  }

  /**
   * Assert URL contains path
   */
  async assertUrlContains(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Assert page title contains text
   */
  async assertPageTitleContains(text: string) {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }

  /**
   * Wait for network request to complete
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM to be stable
   */
  async waitForDOMStable() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverOverElement(locator: Locator) {
    await locator.hover();
  }

  /**
   * Press key on element
   */
  async pressKey(locator: Locator, key: string) {
    await locator.press(key);
  }

  /**
   * Get element text
   */
  async getElementText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Get element attribute
   */
  async getElementAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Wait for element count
   */
  async waitForElementCount(locator: Locator, count: number, timeout: number = 10000) {
    await expect(locator).toHaveCount(count, { timeout });
  }

  /**
   * Assert element count
   */
  async assertElementCount(locator: Locator, count: number) {
    await expect(locator).toHaveCount(count);
  }
} 