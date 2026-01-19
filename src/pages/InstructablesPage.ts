import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InstructablesPage extends BasePage {
  readonly logo: Locator;
  readonly pageTitle: Locator;
  readonly authorName: Locator;
  readonly introductionSection: Locator;
  readonly stepSections: Locator;
  readonly searchBox: Locator;
  readonly projectsLink: Locator;
  readonly contestsLink: Locator;
  readonly teachersLink: Locator;
  readonly logInLink: Locator;
  readonly signUpLink: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    // Header elements - use first() to avoid strict mode violations
    this.logo = page.getByRole('link', { name: /Autodesk Instructables logo/i }).first();
    this.searchBox = page.getByRole('searchbox', { name: /search/i }).first();
    this.projectsLink = page.getByRole('link', { name: /projects/i }).first();
    this.contestsLink = page.getByRole('link', { name: /contests/i }).first();
    this.teachersLink = page.getByRole('link', { name: /teachers/i }).first();
    this.logInLink = page.getByRole('link', { name: /log in/i }).first();
    this.signUpLink = page.getByRole('link', { name: /sign up/i }).first();

    // Main content elements
    this.pageTitle = page.getByRole('heading', { level: 1 }).first();
    this.authorName = page.getByRole('link', { name: /Natalina/i }).first();
    this.introductionSection = page.getByRole('heading', { name: /Introduction/i }).first();
    this.stepSections = page.locator('article h2');

    // Footer
    this.footer = page.getByRole('contentinfo').first();
  }

  /**
   * Navigate to Instructables page
   */
  async navigateToPage(url: string = 'https://www.instructables.com/Curly-Hair-Tips/') {
    await this.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Verify page title contains expected text
   */
  async verifyPageTitle(expectedText: string) {
    await this.waitForElement(this.pageTitle);
    const titleText = await this.getElementText(this.pageTitle);
    expect(titleText).toContain(expectedText);
  }

  /**
   * Verify author information is displayed
   */
  async verifyAuthorInfo() {
    await this.assertElementVisible(this.authorName, 'Author name should be visible');
  }

  /**
   * Verify introduction section is present
   */
  async verifyIntroductionSection() {
    await this.assertElementVisible(this.introductionSection, 'Introduction section should be visible');
  }

  /**
   * Get the number of steps in the article
   */
  async getStepsCount(): Promise<number> {
    return await this.stepSections.count();
  }

  /**
   * Verify navigation links are visible
   */
  async verifyNavigationLinks() {
    await this.assertElementVisible(this.projectsLink, 'Projects link should be visible');
    await this.assertElementVisible(this.contestsLink, 'Contests link should be visible');
    await this.assertElementVisible(this.teachersLink, 'Teachers link should be visible');
  }

  /**
   * Verify header elements are visible
   */
  async verifyHeaderElements() {
    await this.assertElementVisible(this.logo, 'Logo should be visible');
    await this.assertElementVisible(this.searchBox, 'Search box should be visible');
    await this.assertElementVisible(this.logInLink, 'Log In link should be visible');
    await this.assertElementVisible(this.signUpLink, 'Sign Up link should be visible');
  }

  /**
   * Verify footer is present
   */
  async verifyFooter() {
    await this.assertElementVisible(this.footer, 'Footer should be visible');
  }

  /**
   * Click on a specific step heading
   */
  async clickStep(stepNumber: number) {
    const stepHeading = this.stepSections.nth(stepNumber - 1);
    await this.scrollToElement(stepHeading);
    await stepHeading.click();
  }
}
