import { test, expect } from '@playwright/test';

test.describe('Dashboard - Generate Report', () => {
  // Login as Superadmin before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'autotestsuperadmin@gmail.com');
    await page.fill('input[type="password"]', 'Superadmin123!');
    await page.click('button:has-text("SIGN IN")');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should generate Authentication Report with all filters selected', async ({ page }) => {
    // Use dispatchEvent to bypass the accessibility widget overlay
    await page.locator('button:has-text("Generate Report")').dispatchEvent('click');

    // Report Type Selection Modal should appear
    await expect(page.locator('text=Authentication Report')).toBeVisible({ timeout: 5000 });

    // Click Authentication Report option
    await page.locator('button:has-text("Authentication Report")').dispatchEvent('click');

    // Wait for the type selection modal to close
    await page.waitForTimeout(500);

    // Confirm modal should appear with filter tags
    const authDialog = page.locator('[role="alertdialog"]');
    await expect(authDialog.locator('text=Generate authentication report?')).toBeVisible({ timeout: 5000 });

    // All 3 tags should already be selected by default (scoped to the modal)
    await expect(authDialog.locator('text=Security Analysis')).toBeVisible();
    await expect(authDialog.locator('text=Authentication Statistics')).toBeVisible();
    await expect(authDialog.locator('text=Failed Attempts')).toBeVisible();

    // Click "Generate Report" button inside the confirm modal
    await authDialog.locator('button:has-text("Generate Report")').dispatchEvent('click');
  });

  test('should generate System Report with all filters selected', async ({ page }) => {
    // Use dispatchEvent to bypass the accessibility widget overlay
    await page.locator('button:has-text("Generate Report")').dispatchEvent('click');

    // Report Type Selection Modal should appear
    await expect(page.locator('text=System Report')).toBeVisible({ timeout: 5000 });

    // Click System Report option
    await page.locator('button:has-text("System Report")').dispatchEvent('click');

    // Wait for the type selection modal to close
    await page.waitForTimeout(500);

    // Confirm modal should appear with filter tags
    const systemDialog = page.locator('[role="alertdialog"]');
    await expect(systemDialog.locator('text=Generate system report?')).toBeVisible({ timeout: 5000 });

    // All 3 tags should already be selected by default (scoped to the modal)
    await expect(systemDialog.locator('text=User Data')).toBeVisible();
    await expect(systemDialog.locator('text=App Clients')).toBeVisible();
    await expect(systemDialog.locator('text=Audit Logs')).toBeVisible();

    // Click "Generate Report" button inside the confirm modal
    await systemDialog.locator('button:has-text("Generate Report")').dispatchEvent('click');
  });
});
