import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { StorePage } from '../pages/StorePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { ContactPage } from '../pages/ContactPage';

test.describe('Sanity Tests - Basic Functionality', () => {
  let homePage: HomePage;
  let storePage: StorePage;
  let productPage: ProductPage;
  let cartPage: CartPage;
  let contactPage: ContactPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    storePage = new StorePage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);
    contactPage = new ContactPage(page);
  });

  test('TS-001: Verify Homepage Loading @sanity', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify homepage elements are visible', async () => {
      await homePage.verifyHomepageElements();
    });

    await test.step('Verify page title contains ATID', async () => {
      await homePage.assertPageTitleContains('ATID');
    });

    await test.step('Verify URL is correct', async () => {
      await homePage.assertUrlContains('/');
    });
  });

  test('TS-002: Verify Navigation Menu @sanity', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify navigation links are functional', async () => {
      await homePage.verifyNavigationLinks();
    });

    await test.step('Verify all navigation elements are visible', async () => {
      await homePage.assertElementVisible(homePage.storeLink, 'Store link should be visible');
      await homePage.assertElementVisible(homePage.menLink, 'Men link should be visible');
      await homePage.assertElementVisible(homePage.womenLink, 'Women link should be visible');
      await homePage.assertElementVisible(homePage.accessoriesLink, 'Accessories link should be visible');
      await homePage.assertElementVisible(homePage.aboutLink, 'About link should be visible');
      await homePage.assertElementVisible(homePage.contactUsLink, 'Contact Us link should be visible');
    });
  });

  test('TS-003: Verify Store Page Access @sanity', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify store page elements are visible', async () => {
      await storePage.verifyStorePageElements();
    });

    await test.step('Verify store page title', async () => {
      await storePage.assertPageTitleContains('Shop');
    });

    await test.step('Verify store page URL', async () => {
      await storePage.assertUrlContains('/store/');
    });

    await test.step('Verify products are displayed', async () => {
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });
  });

  test('TS-004: Verify Product Page Access @sanity', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Click on first product', async () => {
      await storePage.clickProduct('ATID Yellow Shoes');
    });

    await test.step('Verify product page elements are visible', async () => {
      await productPage.verifyProductPageElements();
    });

    await test.step('Verify product information is displayed', async () => {
      await productPage.verifyProductInformation();
    });

    await test.step('Verify product page URL contains product slug', async () => {
      await productPage.assertUrlContains('/product/');
    });
  });

  test('TS-005: Verify Shopping Cart Icon @sanity', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify cart icon is visible', async () => {
      await homePage.assertElementVisible(homePage.cartIcon, 'Cart icon should be visible');
    });

    await test.step('Click on cart icon', async () => {
      await homePage.clickCartIcon();
    });

    await test.step('Verify cart page loads', async () => {
      await cartPage.assertUrlContains('/cart');
    });

    await test.step('Verify cart page elements', async () => {
      await cartPage.verifyCartPageElements();
    });
  });

  test('TS-006: Verify Search Functionality @sanity', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify search box is visible', async () => {
      await storePage.assertElementVisible(storePage.searchBox, 'Search box should be visible');
    });

    await test.step('Enter search term', async () => {
      await storePage.searchProducts('shoes');
    });

    await test.step('Verify search results are displayed', async () => {
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    await test.step('Verify search term is in results', async () => {
      const productTitles = await page.locator('h2').allTextContents();
      const hasShoesProduct = productTitles.some(title => 
        title.toLowerCase().includes('shoes')
      );
      expect(hasShoesProduct).toBeTruthy();
    });
  });

  test('TS-007: Verify Contact Us Page @sanity', async ({ page }) => {
    await test.step('Navigate to contact page', async () => {
      await contactPage.navigateToContact();
    });

    await test.step('Verify contact page elements are visible', async () => {
      await contactPage.verifyContactPageElements();
    });

    await test.step('Verify contact information is displayed', async () => {
      await contactPage.verifyContactInformation();
    });

    await test.step('Verify contact page title', async () => {
      await contactPage.assertPageTitleContains('Contact Us');
    });

    await test.step('Verify contact page URL', async () => {
      await contactPage.assertUrlContains('/contact-us/');
    });
  });

  test('TS-008: Verify Footer Links @sanity', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify footer sections are visible', async () => {
      await homePage.assertElementVisible(homePage.quickLinksSection, 'Quick Links section should be visible');
      await homePage.assertElementVisible(homePage.forHerSection, 'For Her section should be visible');
      await homePage.assertElementVisible(homePage.forHimSection, 'For Him section should be visible');
    });

    await test.step('Verify footer links are clickable', async () => {
      const footerLinks = await homePage.footerLinks.count();
      expect(footerLinks).toBeGreaterThan(0);
    });

    await test.step('Click on a footer link and verify navigation', async () => {
      await homePage.clickNavigationLink('About');
      await homePage.assertUrlContains('/about/');
    });
  });

  test('TS-009: Verify Basic Add to Cart @sanity', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Get initial cart info', async () => {
      await homePage.navigateToHome();
      const initialCartInfo = await homePage.getCartInfo();
      expect(initialCartInfo.count).toBeDefined();
    });

    await test.step('Add product to cart', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
      await productPage.addToCart(1);
    });

    await test.step('Verify add to cart success message', async () => {
      const isSuccess = await productPage.isAddToCartSuccessful();
      expect(isSuccess).toBeTruthy();
    });

    await test.step('Verify cart count increased', async () => {
      await homePage.navigateToHome();
      const updatedCartInfo = await homePage.getCartInfo();
      expect(parseInt(updatedCartInfo.count)).toBeGreaterThan(0);
    });
  });

  test('TS-010: Verify Basic Accessibility Features @sanity', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Verify accessibility toolbar is visible', async () => {
      await homePage.assertElementVisible(homePage.accessibilityToolbar, 'Accessibility toolbar should be visible');
    });

    await test.step('Open accessibility toolbar', async () => {
      await homePage.openAccessibilityToolbar();
    });

    await test.step('Verify accessibility features are functional', async () => {
      await homePage.verifyAccessibilityFeatures();
    });

    await test.step('Test increase text size', async () => {
      await homePage.increaseTextSize();
      // Verify text size increased (this would need specific implementation details)
    });

    await test.step('Test reset accessibility settings', async () => {
      await homePage.resetAccessibilitySettings();
    });
  });
}); 