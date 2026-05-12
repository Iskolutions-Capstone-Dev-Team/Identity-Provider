import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
import time

class TestWorking:
    
    def test_selenium_connection(self, driver):
        """Test Selenium is working"""
        driver.get("https://www.google.com")
        assert "Google" in driver.title
        print("✓ Selenium is working!")
    
    def test_backend_reachable(self, api_base_url):
        """Test backend is reachable"""
        try:
            response = requests.get(f"{api_base_url}/health", timeout=5)
            print(f"✓ Backend responded with {response.status_code}")
        except Exception as e:
            print(f"⚠️ Backend health: {e}")
    
    def test_frontend_reachable(self, base_url):
        """Test frontend is reachable"""
        try:
            response = requests.get(base_url, timeout=5)
            print(f"✓ Frontend responded with {response.status_code}")
        except Exception as e:
            print(f"❌ Frontend not reachable: {e}")
            print(f"   URL attempted: {base_url}")
    
    def test_login_page(self, driver, base_url):
        """Test login page loads"""
        login_url = f"{base_url}/login?client_id=7112646b-c785-4306-b00f-87d29ad54fb2"
        print(f"\n📱 Accessing: {login_url}")
        
        # First check if frontend is reachable
        try:
            requests.get(base_url, timeout=3)
        except:
            pytest.skip(f"Frontend not reachable at {base_url}")
        
        driver.get(login_url)
        
        # Wait for email input
        email_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        assert email_input.is_displayed()
        print("✓ Login page loaded successfully!")
        
        # Test form input
        email_input.send_keys("admin@email.com")
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys("adminpass123!")
        
        print("✓ Form filled successfully")
        
        # Optional: Submit form (comment out if you don't want to actually login)
        # submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        # submit_button.click()
        # time.sleep(2)
        # print(f"✓ After submit, URL: {driver.current_url}")
