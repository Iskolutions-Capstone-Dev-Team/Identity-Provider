import { test, expect } from '@playwright/test';

test.describe.serial('Audit Logs Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as Superadmin
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'autotestsuperadmin@gmail.com');
    await page.fill('input[type="password"]', 'Superadmin123!');
    await page.click('button:has-text("SIGN IN")');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Accept Terms and Conditions if it pops up
    await page.waitForTimeout(1000);
    const termsCheckbox = page.locator('#terms-agreement-checkbox');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.dispatchEvent('click');
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Accept")').click();
      await page.waitForTimeout(500);
    }

    // Block accessibility overlay from intercepting clicks
    await page.addStyleTag({ content: '[data-idp-accessibility-managed="true"] { pointer-events: none !important; }' });
  });

  test('1. should View the latest Transaction log', async ({ page }) => {
    await page.goto('http://localhost:5173/audit-logs');
    await page.waitForLoadState('networkidle');

    // Wait for the skeletons to disappear
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Ensure we are on Transaction Logs tab
    const transactionTab = page.locator('button[role="tab"]:has-text("Transaction Logs")');
    if (await transactionTab.getAttribute('aria-selected') !== 'true') {
        await transactionTab.click();
        await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });
    }

    // Click the Eye icon on the first row
    await page.locator('button:has(.lucide-eye)').first().click();

    // Verify modal is open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="dialog"] h2:has-text("Log")').first()).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('2. should View the latest Security log', async ({ page }) => {
    await page.goto('http://localhost:5173/audit-logs');
    await page.waitForLoadState('networkidle');

    // Wait for the skeletons to disappear
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Switch to Security Logs tab
    const securityTab = page.locator('button[role="tab"]:has-text("Security Logs")');
    await securityTab.click();
    
    // Wait for skeletons to appear and disappear, or just wait for table to settle
    await page.waitForTimeout(1000);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Click the Eye icon on the first row
    await page.locator('button:has(.lucide-eye)').first().click();

    // Verify modal is open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="dialog"] h2:has-text("Log")').first()).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

});
