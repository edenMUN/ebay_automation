import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AtidStorePage extends BasePage{
  readonly productCards: Locator;
  readonly storeHeading: Locator;
  readonly storePageTwo: Locator;
  readonly storePageShopOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('.product');
    this.storeHeading = page.getByRole('heading', { name: /store|products/i });
    this.storePageTwo = page.getByRole('link', { name: '2' });
    this.storePageShopOrderButton = page.getByLabel('Shop order');  
}

  // Simple assertion used by the test to confirm we are on the store page
  async verifyStorePage() {
    await this.page.waitForURL(/store/, { timeout: 10000 });
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.page).toHaveURL(/atid\.store\/store/);
    await expect(this.productCards.first()).toBeVisible();
  }

  async clickStorePageTwo(ai?: any) {
    await this.scrollToElement(this.storePageTwo);
    expect(this.storePageTwo).toBeVisible();
    try {
      // first try, the regular selector
      await this.storePageTwo.click({ timeout: 5000 });
      await expect(this.page).toHaveURL(/\/page\/2\/?/);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      if (ai) {
          console.warn(`Selector for "Store Page Two" failed. Falling back to AI Healer... Error: ${errorMessage}`);
          await ai('Click on page 2 of the results');
      } else {
          throw error;
      }
  }  }

  async changeOrderOfStoreResult(optionValue: string) {
    const dropdowm = this.storePageShopOrderButton
    await this.page.waitForTimeout(1000);
    await dropdowm.selectOption(optionValue);    
}

  async verifyStorePageOrderByDate(){
    await expect(this.page).toHaveURL('https://atid.store/store/?orderby=date');
  }
}

