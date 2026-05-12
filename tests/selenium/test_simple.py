import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestSimple:
    def test_google(self, driver):
        """Simple test to verify Selenium works"""
        driver.get("https://www.google.com")
        assert "Google" in driver.title
        print("✓ Selenium is working!")
    
    def test_your_login_page(self, driver, base_url):
        """Test your login page loads"""
        driver.get(f"{base_url}/login?client_id=7112646b-c785-4306-b00f-87d29ad54fb2")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        print("✓ Login page loaded!")
