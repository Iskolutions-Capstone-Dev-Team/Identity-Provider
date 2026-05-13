import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time

class TestBrowserDebug:
    
    def test_see_what_happens_on_login(self, driver, base_url, test_user):
        """Watch what happens during login using VNC"""
        client_id = os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
        login_url = f"{base_url}/login?client_id={client_id}"
        
        print(f"\n📱 Opening: {login_url}")
        driver.get(login_url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Take screenshot of login page
        driver.save_screenshot("/tests/screenshots/01_login_page.png")
        print("📸 Screenshot: 01_login_page.png")
        
        # Fill email
        email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        email_input.send_keys(test_user["email"])
        print("✓ Email filled")
        
        # Fill password
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys(test_user["password"])
        print("✓ Password filled")
        
        # Take screenshot before submit
        driver.save_screenshot("/tests/screenshots/02_before_submit.png")
        print("📸 Screenshot: 02_before_submit.png")
        
        # Click login
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        print("✓ Clicked login button")
        
        # Wait and check what happens
        for i in range(10):
            time.sleep(1)
            print(f"  Current URL: {driver.current_url}")
            
            # Check for error messages
            try:
                error = driver.find_element(By.CSS_SELECTOR, ".error, .alert, .error-message")
                print(f"⚠️ Error message found: {error.text}")
                break
            except:
                pass
            
            if "callback" in driver.current_url:
                print("✅ Successfully redirected to callback!")
                driver.save_screenshot("/tests/screenshots/03_success.png")
                break
        
        driver.save_screenshot("/tests/screenshots/04_final_state.png")
        print("📸 Final screenshot saved")
        
        # Get console logs
        logs = driver.get_log("browser")
        print("\n📋 Browser Console Logs:")
        for log in logs[-10:]:  # Last 10 logs
            print(f"  [{log['level']}] {log['message'][:200]}")
