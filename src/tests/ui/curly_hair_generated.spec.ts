import { test, expect } from '@playwright/test';
import { GoogleSearchPage } from '../../pages/GoogleSearchPage';
import { InstructablesPage } from '../../pages/InstructablesPage';

test.describe('Curly Hair Search Tests - Generated from Google Search', () => {
  let googleSearchPage: GoogleSearchPage;
  let instructablesPage: InstructablesPage;

  test.beforeEach(async ({ page }) => {
    googleSearchPage = new GoogleSearchPage(page);
    instructablesPage = new InstructablesPage(page);
  });

  test('CH-001: Search for curly hair on Google and verify first result @sanity', async ({ page }) => {
    await test.step('Navigate to Google homepage', async () => {
      await googleSearchPage.navigateToGoogle();
    });

    await test.step('Verify Google page loaded successfully', async () => {
      await expect(page).toHaveTitle(/Google/i);
      await expect(page).toHaveURL(/google\.com/i);
    });

    await test.step('Search for "curly hair"', async () => {
      await googleSearchPage.search('curly hair');
    });

    await test.step('Verify search results are displayed', async () => {
      await googleSearchPage.verifySearchResults();
      // Note: getSearchResultsCount may return 0 due to Google's dynamic structure,
      // but verifySearchResults already confirms we're on a search results page
    });

    await test.step('Click on the first search result', async () => {
      await googleSearchPage.clickFirstResult();
    });

    await test.step('Verify Instructables page loaded', async () => {
      await expect(page).toHaveURL(/instructables\.com/i);
      await expect(page).toHaveTitle(/Curly Hair/i);
    });
  });

  test('CH-002: Verify Instructables curly hair page content and structure @sanity', async ({ page }) => {
    await test.step('Navigate directly to Instructables curly hair page', async () => {
      await instructablesPage.navigateToPage();
    });

    await test.step('Verify page title contains expected text', async () => {
      await instructablesPage.verifyPageTitle('Tips and Tricks to Take Care of Curly Hair');
    });

    await test.step('Verify header elements are visible', async () => {
      await instructablesPage.verifyHeaderElements();
    });

    await test.step('Verify author information is displayed', async () => {
      await instructablesPage.verifyAuthorInfo();
    });

    await test.step('Verify introduction section is present', async () => {
      await instructablesPage.verifyIntroductionSection();
    });

    await test.step('Verify multiple steps are present in the article', async () => {
      const stepsCount = await instructablesPage.getStepsCount();
      expect(stepsCount).toBeGreaterThanOrEqual(7);
    });

    await test.step('Verify footer is present', async () => {
      await instructablesPage.verifyFooter();
    });
  });

  test('CH-003: Verify navigation and interactivity on Instructables page @sanity', async ({ page }) => {
    await test.step('Navigate to Instructables curly hair page', async () => {
      await instructablesPage.navigateToPage();
    });

    await test.step('Verify navigation links are functional', async () => {
      await instructablesPage.verifyNavigationLinks();
    });

    await test.step('Click on Projects link', async () => {
      await instructablesPage.projectsLink.click();
      await instructablesPage.waitForPageLoad();
      await expect(page).toHaveURL(/\/projects/i);
    });

    await test.step('Navigate back to curly hair page', async () => {
      await instructablesPage.navigateToPage();
    });

    await test.step('Verify search functionality is accessible', async () => {
      await instructablesPage.assertElementVisible(
        instructablesPage.searchBox,
        'Search box should be visible'
      );
    });

    await test.step('Verify Log In and Sign Up links are visible', async () => {
      await instructablesPage.assertElementVisible(
        instructablesPage.logInLink,
        'Log In link should be visible'
      );
      await instructablesPage.assertElementVisible(
        instructablesPage.signUpLink,
        'Sign Up link should be visible'
      );
    });

    await test.step('Verify page URL contains correct path', async () => {
      await instructablesPage.assertUrlContains('/Curly-Hair-Tips');
    });
  });
});
