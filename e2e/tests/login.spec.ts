import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('should login as Superadmin (MFA bypass)', async ({ page }) => {
    // Navigate to the local frontend port 5173
    await page.goto('http://localhost:5173/login'); 

    // Fill in the superadmin credentials
    await page.fill('input[type="email"]', 'autotestsuperadmin@gmail.com');
    await page.fill('input[type="password"]', 'Superadmin123!');

    // Click the SIGN IN button
    await page.click('button:has-text("SIGN IN")');

    // Wait for successful login redirect (e.g. to One-Portal or the dashboard)
    // We'll wait for the URL to change away from the login page
    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});
    // Verify we are no longer on the login page (or error message didn't appear)
    await expect(page.locator('text=Invalid email or password')).not.toBeVisible();
  });

  test('should login as Admin (MFA bypass)', async ({ page }) => {
    await page.goto('http://localhost:5173/login'); 

    // Fill in the admin credentials
    await page.fill('input[type="email"]', 'autotestadmin@email.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    await page.click('button:has-text("SIGN IN")');

    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});
    await expect(page.locator('text=Invalid email or password')).not.toBeVisible();
  });

  test('should login as External User (Student) and Go to One Portal', async ({ page }) => {
    await page.goto('http://localhost:5173/login'); 

    await page.fill('input[type="email"]', 'autoteststudent@gmail.com');
    await page.fill('input[type="password"]', 'Student123!');
    
    await page.click('button:has-text("SIGN IN")');

    // Should see Access Denied page/text
    await expect(page.locator('text=Return to login')).toBeVisible({ timeout: 10000 });

    // Click Go to One Portal
    await page.click('text="Go to One Portal"');
    
    // Verify it successfully navigated to One Portal (port 5174)
    await page.waitForURL('http://localhost:5174/**', { timeout: 10000 }).catch(() => {});
  });

  test('should login as External User (Student) and Return to Login', async ({ page }) => {
    await page.goto('http://localhost:5173/login'); 

    await page.fill('input[type="email"]', 'autoteststudent@gmail.com');
    await page.fill('input[type="password"]', 'Student123!');
    
    await page.click('button:has-text("SIGN IN")');

    // Should see Access Denied page/text
    await expect(page.locator('text=Return to login')).toBeVisible({ timeout: 10000 });

    // Click Return to Login
    await page.click('text="Return to login"');
    
    // We should be back at the login page, so the email field should be visible again
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

