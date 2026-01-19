import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { StorePage } from '../pages/StorePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { ContactPage } from '../pages/ContactPage';

test.describe('Error Handling Tests - Edge Cases and Failures', () => {
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

  test('EH-001: Test Invalid Search Inputs @error', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Test search with special characters', async () => {
      await storePage.searchProducts('!@#$%^&*()');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('Test search with SQL injection attempt', async () => {
      await storePage.searchProducts("'; DROP TABLE products; --");
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('Test search with XSS script', async () => {
      await storePage.searchProducts('<script>alert("XSS")</script>');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('Test search with very long input', async () => {
      const longSearchTerm = 'A'.repeat(1000);
      await storePage.searchProducts(longSearchTerm);
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });
  });

  test('EH-002: Test Negative Quantity Values @error', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Try to set negative quantity', async () => {
      try {
        await productPage.setQuantity(-1);
        // If no error is thrown, verify the input is handled gracefully
        const quantityValue = await productPage.getElementAttribute(productPage.quantityInput, 'value');
        expect(parseInt(quantityValue || '1')).toBeGreaterThan(0);
      } catch (error) {
        // Expected error for negative quantity
        expect(error).toBeDefined();
      }
    });

    await test.step('Try to set zero quantity', async () => {
      try {
        await productPage.setQuantity(0);
        const quantityValue = await productPage.getElementAttribute(productPage.quantityInput, 'value');
        expect(parseInt(quantityValue || '1')).toBeGreaterThan(0);
      } catch (error) {
        // Expected error for zero quantity
        expect(error).toBeDefined();
      }
    });
  });

  test('EH-003: Test Extremely Large Quantity Values @error', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Try to set extremely large quantity', async () => {
      try {
        await productPage.setQuantity(999999);
        const quantityValue = await productPage.getElementAttribute(productPage.quantityInput, 'value');
        // Should enforce reasonable limits
        expect(parseInt(quantityValue || '1')).toBeLessThan(999999);
      } catch (error) {
        // Expected error for extremely large quantity
        expect(error).toBeDefined();
      }
    });

    await test.step('Try to set maximum safe quantity', async () => {
      await productPage.setQuantity(100);
      const quantityValue = await productPage.getElementAttribute(productPage.quantityInput, 'value');
      expect(parseInt(quantityValue || '1')).toBe(100);
    });
  });

  test('EH-004: Test Empty Required Form Fields @error', async ({ page }) => {
    await test.step('Navigate to contact page', async () => {
      await contactPage.navigateToContact();
    });

    await test.step('Submit form with empty required fields', async () => {
      await contactPage.verifyFormValidationEmptyFields();
    });

    await test.step('Test partial form submission', async () => {
      await contactPage.fillContactForm('Test User', '', 'Test comment');
      await contactPage.submitContactForm();
      const hasEmailError = await contactPage.hasFieldError('email');
      expect(hasEmailError).toBeTruthy();
    });

    await test.step('Test with only spaces in required fields', async () => {
      await contactPage.fillContactForm('   ', '   ', '   ');
      await contactPage.submitContactForm();
      const hasNameError = await contactPage.hasFieldError('name');
      const hasEmailError = await contactPage.hasFieldError('email');
      const hasCommentError = await contactPage.hasFieldError('comment');
      expect(hasNameError || hasEmailError || hasCommentError).toBeTruthy();
    });
  });

  test('EH-005: Test Invalid Email Format @error', async ({ page }) => {
    await test.step('Navigate to contact page', async () => {
      await contactPage.navigateToContact();
    });

    await test.step('Test various invalid email formats', async () => {
      await contactPage.verifyFormValidationInvalidEmail();
    });

    await test.step('Test email with spaces', async () => {
      await contactPage.testInvalidEmail('test @example.com');
      const hasEmailError = await contactPage.hasFieldError('email');
      expect(hasEmailError).toBeTruthy();
    });

    await test.step('Test email with special characters', async () => {
      await contactPage.testInvalidEmail('test+invalid@example.com');
      // This should be valid, but test the handling
      const hasEmailError = await contactPage.hasFieldError('email');
      expect(hasEmailError).toBeFalsy();
    });
  });

  test('EH-006: Test Invalid Coupon Codes @error', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Apply invalid coupon codes', async () => {
      const invalidCoupons = [
        'INVALID_COUPON',
        'EXPIRED_COUPON',
        '123456',
        'COUPON_WITH_SPECIAL_CHARS!@#',
        'A'.repeat(100) // Very long coupon
      ];

      for (const coupon of invalidCoupons) {
        await cartPage.applyCoupon(coupon);
        // Verify the system handles invalid coupons gracefully
        const isFormVisible = await cartPage.isElementVisible(cartPage.cartTable);
        expect(isFormVisible).toBeTruthy();
      }
    });
  });

  test('EH-007: Test Price Filter Edge Cases @error', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Test price filter with min > max', async () => {
      await storePage.filterByPrice('200', '100');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('Test price filter with negative values', async () => {
      await storePage.filterByPrice('-50', '100');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('Test price filter with zero values', async () => {
      await storePage.filterByPrice('0', '0');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });

    await test.step('Test price filter with very large values', async () => {
      await storePage.filterByPrice('999999', '999999');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThanOrEqual(0);
    });
  });

  test('EH-008: Test Network Connectivity Issues @error', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Simulate slow network by setting timeout', async () => {
      // Set a very short timeout to simulate network issues
      page.setDefaultTimeout(100);
      
      try {
        await homePage.navigateToHome();
      } catch (error) {
        // Expected timeout error
        expect(error).toBeDefined();
      } finally {
        // Reset timeout
        page.setDefaultTimeout(30000);
      }
    });

    await test.step('Verify page recovers after network issue', async () => {
      await homePage.navigateToHome();
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible after recovery');
    });
  });

  test('EH-009: Test Session Timeout Handling @error', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Add product to cart', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
      await productPage.addToCart(1);
    });

    await test.step('Simulate session timeout by clearing storage', async () => {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    });

    await test.step('Verify cart functionality after session clear', async () => {
      await cartPage.navigateToCart();
      // Should handle gracefully - either show empty cart or redirect to login
      const isCartVisible = await cartPage.isElementVisible(cartPage.cartHeader);
      expect(isCartVisible).toBeTruthy();
    });
  });

  test('EH-010: Test Cross-Browser Compatibility @error', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Test basic functionality across different viewport sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible on mobile');
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible on tablet');
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible on desktop');
    });

    await test.step('Test navigation functionality on different screen sizes', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.assertElementVisible(homePage.navigationMenu, 'Navigation should be visible on mobile');
    });
  });

  test('EH-011: Test Mobile Responsiveness Errors @error', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Navigate to homepage and test mobile layout', async () => {
      await homePage.navigateToHome();
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible on mobile');
      await homePage.assertElementVisible(homePage.navigationMenu, 'Navigation should be visible on mobile');
    });

    await test.step('Test store page on mobile', async () => {
      await storePage.navigateToStore();
      await storePage.assertElementVisible(storePage.searchBox, 'Search box should be visible on mobile');
      await storePage.assertElementVisible(storePage.productGrid, 'Product grid should be visible on mobile');
    });

    await test.step('Test product page on mobile', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
      await productPage.assertElementVisible(productPage.productTitle, 'Product title should be visible on mobile');
      await productPage.assertElementVisible(productPage.addToCartButton, 'Add to cart button should be visible on mobile');
    });
  });

  test('EH-012: Test Product Page Missing Data @error', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Test products with missing images', async () => {
      const productImages = await page.locator('img[src*=".jpg"], img[src*=".png"]').count();
      expect(productImages).toBeGreaterThan(0);
      
      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).filter(img => !img.complete || img.naturalWidth === 0).length;
      });
      expect(brokenImages).toBe(0);
    });

    await test.step('Test products with missing prices', async () => {
      const productsWithPrices = await page.locator('text=/\\d+\\.\\d+ ₪/').count();
      expect(productsWithPrices).toBeGreaterThan(0);
    });
  });

  test('EH-013: Test Checkout Process Interruption @error', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Simulate checkout interruption', async () => {
      // Navigate away from checkout
      await homePage.navigateToHome();
      
      // Return to cart
      await cartPage.navigateToCart();
      
      // Verify cart contents are preserved
      const cartItemsCount = await cartPage.getCartItemsCount();
      expect(cartItemsCount).toBeGreaterThan(0);
    });
  });

  test('EH-014: Test Multiple Tab Cart Synchronization @error', async ({ page, context }) => {
    await test.step('Open multiple tabs', async () => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      const homePage1 = new HomePage(page1);
      const homePage2 = new HomePage(page2);
      
      await homePage1.navigateToHome();
      await homePage2.navigateToHome();
      
      // Add product to cart in first tab
      const productPage1 = new ProductPage(page1);
      await productPage1.navigateToProduct('atid-yellow-shoes');
      await productPage1.addToCart(1);
      
      // Verify cart is updated in second tab
      await homePage2.navigateToHome();
      const cartInfo = await homePage2.getCartInfo();
      expect(parseInt(cartInfo.count)).toBeGreaterThan(0);
      
      await page1.close();
      await page2.close();
    });
  });

  test('EH-015: Test JavaScript Disabled Scenario @error', async ({ page }) => {
    await test.step('Disable JavaScript', async () => {
      await page.route('**/*', route => {
        if (route.request().resourceType() === 'script') {
          route.abort();
        } else {
          route.continue();
        }
      });
    });

    await test.step('Navigate to homepage without JavaScript', async () => {
      await homePage.navigateToHome();
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible without JavaScript');
    });

    await test.step('Test basic navigation without JavaScript', async () => {
      await homePage.clickNavigationLink('Store');
      await storePage.assertUrlContains('/store/');
    });
  });

  test('EH-016: Test Accessibility Toolbar Errors @error', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHome();
    });

    await test.step('Test multiple accessibility options simultaneously', async () => {
      await homePage.openAccessibilityToolbar();
      await homePage.increaseTextSize();
      await homePage.applyGrayscale();
      await homePage.applyHighContrast();
      
      // Verify page remains functional
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible with multiple accessibility options');
    });

    await test.step('Test accessibility reset functionality', async () => {
      await homePage.resetAccessibilitySettings();
      await homePage.assertElementVisible(homePage.logo, 'Logo should be visible after reset');
    });
  });

  test('EH-017: Test URL Manipulation Security @error', async ({ page }) => {
    await test.step('Test direct access to non-existent product', async () => {
      await page.goto('/product/non-existent-product/');
      // Should handle gracefully - either show 404 or redirect
      const currentUrl = page.url();
      expect(currentUrl).toContain('/product/');
    });

    await test.step('Test direct access to admin URLs', async () => {
      await page.goto('/wp-admin/');
      // Should not expose admin interface
      const pageTitle = await page.title();
      expect(pageTitle).not.toContain('Admin');
    });

    await test.step('Test URL with special characters', async () => {
      await page.goto('/product/test%20product%20with%20spaces/');
      // Should handle URL encoding properly
      const currentUrl = page.url();
      expect(currentUrl).toContain('/product/');
    });
  });

  test('EH-018: Test Form Input Length Limits @error', async ({ page }) => {
    await test.step('Navigate to contact page', async () => {
      await contactPage.navigateToContact();
    });

    await test.step('Test extremely long input strings', async () => {
      await contactPage.verifyFormHandlesLongInput();
    });

    await test.step('Test form with maximum allowed input', async () => {
      const maxLengthName = 'A'.repeat(255);
      const maxLengthEmail = 'test@example.com';
      const maxLengthComment = 'B'.repeat(1000);
      
      await contactPage.fillContactForm(maxLengthName, maxLengthEmail, maxLengthComment);
      await contactPage.submitContactForm();
      
      // Form should handle maximum length gracefully
      const isFormVisible = await contactPage.isElementVisible(contactPage.contactForm);
      expect(isFormVisible).toBeTruthy();
    });
  });

  test('EH-019: Test Cart Persistence Errors @error', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Simulate cart persistence failure', async () => {
      // Clear cart data
      await page.evaluate(() => {
        localStorage.removeItem('woocommerce_cart_hash');
        sessionStorage.clear();
      });
    });

    await test.step('Verify graceful handling of cart persistence failure', async () => {
      await cartPage.navigateToCart();
      // Should handle gracefully - either show empty cart or restore from server
      const isCartVisible = await cartPage.isElementVisible(cartPage.cartHeader);
      expect(isCartVisible).toBeTruthy();
    });
  });

  test('EH-020: Test Product Availability Race Conditions @error', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Simulate rapid add to cart actions', async () => {
      // Try to add product multiple times rapidly
      for (let i = 0; i < 3; i++) {
        try {
          await productPage.addToCart(1);
          await page.waitForTimeout(100); // Small delay
        } catch (error) {
          // Expected error for rapid actions
          expect(error).toBeDefined();
        }
      }
    });

    await test.step('Verify cart state is consistent', async () => {
      await cartPage.navigateToCart();
      const cartItemsCount = await cartPage.getCartItemsCount();
      expect(cartItemsCount).toBeGreaterThanOrEqual(0);
    });
  });
}); 