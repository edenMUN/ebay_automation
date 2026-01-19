import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { StorePage } from '../pages/StorePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { ContactPage } from '../pages/ContactPage';

test.describe('Logic Tests - Business Workflows', () => {
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

  test('LT-001: Validate Product Catalog Filtering @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify category counts are correct', async () => {
      await storePage.verifyCategoryCounts();
    });

    await test.step('Filter by Men category', async () => {
      await storePage.filterByCategory('Men');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    await test.step('Filter by Women category', async () => {
      await storePage.filterByCategory('Women');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    await test.step('Filter by Accessories category', async () => {
      await storePage.filterByCategory('Accessories');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });
  });

  test('LT-002: Validate Price Range Filtering @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify price range filter is visible', async () => {
      await storePage.verifyPriceRangeFilter();
    });

    await test.step('Filter by price range 50-150', async () => {
      await storePage.filterByPrice('50', '150');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    await test.step('Verify filtered products are within price range', async () => {
      const productPrices = await page.locator('text=/\\d+\\.\\d+ ₪/').allTextContents();
      for (const priceText of productPrices) {
        const price = parseFloat(priceText.match(/(\d+\.\d+)/)?.[1] || '0');
        expect(price).toBeGreaterThanOrEqual(50);
        expect(price).toBeLessThanOrEqual(150);
      }
    });
  });

  test('LT-003: Validate Product Sorting Options @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify sorting options are available', async () => {
      await storePage.verifySortingOptions();
    });

    await test.step('Sort by price low to high', async () => {
      await storePage.sortProducts('Sort by price: low to high');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    await test.step('Sort by price high to low', async () => {
      await storePage.sortProducts('Sort by price: high to low');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    await test.step('Sort by popularity', async () => {
      await storePage.sortProducts('Sort by popularity');
      const productsCount = await storePage.getProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });
  });

  test('LT-004: Validate Pagination Functionality @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify pagination is visible', async () => {
      await storePage.verifyPagination();
    });

    await test.step('Navigate to page 2', async () => {
      await storePage.navigateToPage(2);
      const currentPage = await storePage.getCurrentPageNumber();
      expect(currentPage).toBe('2');
    });

    await test.step('Navigate to page 3', async () => {
      await storePage.navigateToPage(3);
      const currentPage = await storePage.getCurrentPageNumber();
      expect(currentPage).toBe('3');
    });

    await test.step('Navigate back to page 1', async () => {
      await storePage.navigateToPage(1);
      const currentPage = await storePage.getCurrentPageNumber();
      expect(currentPage).toBe('1');
    });
  });

  test('LT-005: Validate Shopping Cart Calculations @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Verify cart calculations are correct', async () => {
      await cartPage.verifyCartCalculations();
    });

    await test.step('Verify subtotal and total amounts', async () => {
      const subtotal = await cartPage.getSubtotalAmount();
      const total = await cartPage.getTotalAmount();
      expect(parseFloat(subtotal)).toBeGreaterThan(0);
      expect(parseFloat(total)).toBeGreaterThan(0);
      expect(parseFloat(total)).toBeGreaterThanOrEqual(parseFloat(subtotal));
    });
  });

  test('LT-006: Validate Quantity Management in Cart @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Update product quantity', async () => {
      await cartPage.verifyQuantityUpdateFunctionality();
    });

    await test.step('Verify quantity update affects total', async () => {
      const initialSubtotal = await cartPage.getSubtotalAmount();
      await cartPage.updateProductQuantity(0, 2);
      const updatedSubtotal = await cartPage.getSubtotalAmount();
      expect(parseFloat(updatedSubtotal)).toBeGreaterThan(parseFloat(initialSubtotal));
    });
  });

  test('LT-007: Validate Product Removal from Cart @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Remove product from cart', async () => {
      await cartPage.verifyRemoveProductFunctionality();
    });

    await test.step('Verify cart is empty after removal', async () => {
      const isCartEmpty = await cartPage.isCartEmpty();
      expect(isCartEmpty).toBeTruthy();
    });
  });

  test('LT-008: Validate Shipping Options Selection @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Verify shipping options are available', async () => {
      await cartPage.verifyShippingOptions();
    });

    await test.step('Select different shipping options', async () => {
      await cartPage.selectShippingOption('Express delivery');
      const selectedOption = await cartPage.getSelectedShippingOption();
      expect(selectedOption.toLowerCase()).toContain('express');
    });
  });

  test('LT-009: Validate Coupon Code Application @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Add product to cart', async () => {
      await productPage.addToCart(1);
    });

    await test.step('Navigate to cart page', async () => {
      await cartPage.navigateToCart();
    });

    await test.step('Apply invalid coupon code', async () => {
      await cartPage.verifyCouponFunctionality();
    });

    await test.step('Verify coupon input field is functional', async () => {
      await cartPage.applyCoupon('TEST_COUPON');
      // Note: Actual coupon validation would depend on backend implementation
    });
  });

  test('LT-010: Validate Sale Price Display @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Find a product on sale', async () => {
      const isOnSale = await storePage.isProductOnSale('ATID Yellow Shoes');
      if (isOnSale) {
        await storePage.clickProduct('ATID Yellow Shoes');
      } else {
        // Find another product on sale
        const saleProducts = await page.locator('text=Sale!').count();
        expect(saleProducts).toBeGreaterThan(0);
      }
    });

    await test.step('Verify sale pricing is displayed correctly', async () => {
      await productPage.verifySalePricing();
    });

    await test.step('Verify original and sale prices', async () => {
      const originalPrice = await productPage.getOriginalPrice();
      const salePrice = await productPage.getSalePrice();
      if (parseFloat(originalPrice) > 0 && parseFloat(salePrice) > 0) {
        expect(parseFloat(salePrice)).toBeLessThan(parseFloat(originalPrice));
      }
    });
  });

  test('LT-011: Validate Product Rating System @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Verify product rating is displayed', async () => {
      const rating = await productPage.getProductRating();
      expect(parseFloat(rating)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(rating)).toBeLessThanOrEqual(5);
    });

    await test.step('Verify review count is displayed', async () => {
      const reviewCount = await productPage.getReviewCount();
      expect(parseInt(reviewCount)).toBeGreaterThanOrEqual(0);
    });

    await test.step('Click on reviews tab', async () => {
      await productPage.verifyProductTabsFunctionality();
    });
  });

  test('LT-012: Validate Related Products Display @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Verify related products section is visible', async () => {
      await productPage.verifyRelatedProducts();
    });

    await test.step('Verify related products count', async () => {
      const relatedCount = await productPage.getRelatedProductsCount();
      expect(relatedCount).toBeGreaterThan(0);
    });

    await test.step('Click on a related product', async () => {
      const relatedProducts = await page.locator('h2').allTextContents();
      const firstRelatedProduct = relatedProducts.find(title => 
        title !== 'ATID Yellow Shoes' && title.length > 0
      );
      if (firstRelatedProduct) {
        await productPage.clickRelatedProduct(firstRelatedProduct);
        await productPage.assertUrlContains('/product/');
      }
    });
  });

  test('LT-013: Validate Best Sellers Section @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify best sellers section is visible', async () => {
      await storePage.assertElementVisible(storePage.bestSellersSection, 'Best sellers section should be visible');
    });

    await test.step('Verify best sellers count', async () => {
      const bestSellersCount = await storePage.getBestSellersCount();
      expect(bestSellersCount).toBeGreaterThan(0);
    });

    await test.step('Click on a best seller product', async () => {
      await storePage.clickBestSeller('Boho Bangle Bracelet');
      await productPage.assertUrlContains('/product/');
    });
  });

  test('LT-014: Validate Search Results Relevance @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Search for "shoes"', async () => {
      await storePage.searchProducts('shoes');
    });

    await test.step('Verify search results contain shoes', async () => {
      const productTitles = await page.locator('h2').allTextContents();
      const hasShoesProduct = productTitles.some(title => 
        title.toLowerCase().includes('shoes')
      );
      expect(hasShoesProduct).toBeTruthy();
    });

    await test.step('Search for "jeans"', async () => {
      await storePage.searchProducts('jeans');
    });

    await test.step('Verify search results contain jeans', async () => {
      const productTitles = await page.locator('h2').allTextContents();
      const hasJeansProduct = productTitles.some(title => 
        title.toLowerCase().includes('jeans')
      );
      expect(hasJeansProduct).toBeTruthy();
    });
  });

  test('LT-015: Validate Breadcrumb Navigation @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Verify breadcrumb navigation is visible', async () => {
      await productPage.verifyBreadcrumbNavigation();
    });

    await test.step('Verify breadcrumb path is correct', async () => {
      const breadcrumbPath = await productPage.getBreadcrumbPath();
      expect(breadcrumbPath.length).toBeGreaterThanOrEqual(2);
      expect(breadcrumbPath).toContain('Home');
    });
  });

  test('LT-016: Validate Product Image Zoom @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Verify image zoom functionality', async () => {
      await productPage.verifyImageZoomFunctionality();
    });

    await test.step('Verify product image is visible', async () => {
      await productPage.assertElementVisible(productPage.productImage, 'Product image should be visible');
    });
  });

  test('LT-017: Validate Contact Form Submission @logic', async ({ page }) => {
    await test.step('Navigate to contact page', async () => {
      await contactPage.navigateToContact();
    });

    await test.step('Fill contact form with valid data', async () => {
      await contactPage.verifyFormSubmissionValidData();
    });

    await test.step('Verify form handles valid submission', async () => {
      const isFormVisible = await contactPage.isElementVisible(contactPage.contactForm);
      expect(isFormVisible).toBeTruthy();
    });
  });

  test('LT-018: Validate Product Description Tabs @logic', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await productPage.navigateToProduct('atid-yellow-shoes');
    });

    await test.step('Verify product tabs functionality', async () => {
      await productPage.verifyProductTabsFunctionality();
    });

    await test.step('Switch between description and reviews tabs', async () => {
      await productPage.switchToDescriptionTab();
      await productPage.assertElementVisible(productPage.descriptionContent, 'Description content should be visible');
      
      await productPage.switchToReviewsTab();
      await productPage.assertElementVisible(productPage.reviewsContent, 'Reviews content should be visible');
    });
  });

  test('LT-019: Validate Out of Stock Handling @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Find out of stock product', async () => {
      const isOutOfStock = await storePage.isProductOutOfStock('ATID Red Shoes');
      if (isOutOfStock) {
        await storePage.clickProduct('ATID Red Shoes');
      } else {
        // Look for any out of stock product
        const outOfStockProducts = await page.locator('text=Out of stock').count();
        expect(outOfStockProducts).toBeGreaterThan(0);
      }
    });

    await test.step('Verify out of stock handling', async () => {
      await productPage.verifyAddToCartFunctionality();
    });
  });

  test('LT-020: Validate Category Product Count @logic', async ({ page }) => {
    await test.step('Navigate to store page', async () => {
      await storePage.navigateToStore();
    });

    await test.step('Verify category counts are accurate', async () => {
      await storePage.verifyCategoryCounts();
    });

    await test.step('Verify total products count', async () => {
      const totalResults = await storePage.getTotalResultsCount();
      expect(parseInt(totalResults)).toBeGreaterThan(0);
    });
  });
}); 