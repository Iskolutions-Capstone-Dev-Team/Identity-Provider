import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('should login with valid credentials (MFA bypass)', async ({ page }) => {
    // Navigate to the login page (adjust the URL if your local port differs)
    await page.goto('http://localhost:3000/login'); 

    // Fill in the email
    await page.fill('input[type="email"]', 'testuser@example.com');
    
    // Fill in the password
    await page.fill('input[type="password"]', 'password123');

    // Click the SIGN IN button
    await page.click('button:has-text("SIGN IN")');

    // Wait for successful login redirect
    // Since hasMfa bypasses the OTP screen, it should directly redirect or show success.
    // Replace the URL with what you expect to see after a successful login.
    await page.waitForURL('**/dashboard'); 
    
    // You can also assert that an element on the next page is visible
    // await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should display error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login'); 

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("SIGN IN")');

    // Assert that the error alert is visible
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
