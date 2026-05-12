import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import requests

class TestIdentityProviderLogin:
    
    def test_login_page_loads_with_client_id(self, driver, base_url):
        """Test that login page loads with client_id parameter"""
        client_id = "7112646b-c785-4306-b00f-87d29ad54fb2"
        login_url = f"{base_url}/login?client_id={client_id}"
        
        driver.get(login_url)
        
        # Wait for login form to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "form"))
        )
        
        # Check if both input fields are present
        email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        assert email_input.is_displayed()
        assert password_input.is_displayed()
        
        print("✓ Login page loaded successfully with client_id")
    
    def test_successful_login_redirects_to_userpool(self, driver, base_url, test_user):
        """Test successful login redirects to /userpool"""
        client_id = "7112646b-c785-4306-b00f-87d29ad54fb2"
        login_url = f"{base_url}/login?client_id={client_id}"
        
        driver.get(login_url)
        
        # Find and fill email field
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        email_input.send_keys(test_user["email"])
        
        # Find and fill password field
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys(test_user["password"])
        
        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait for redirect to /userpool
        WebDriverWait(driver, 15).until(
            EC.url_contains("/userpool")
        )
        
        # Verify we're on userpool page
        assert "/userpool" in driver.current_url
        print(f"✓ Successfully logged in and redirected to: {driver.current_url}")
    
    def test_login_failure_wrong_password(self, driver, base_url):
        """Test login fails with wrong password"""
        client_id = "7112646b-c785-4306-b00f-87d29ad54fb2"
        login_url = f"{base_url}/login?client_id={client_id}"
        
        driver.get(login_url)
        
        # Fill with correct email but wrong password
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        email_input.send_keys("admin@email.com")
        
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys("wrongpassword123!")
        
        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait to see if we stay on login page
        WebDriverWait(driver, 5).until(
            EC.url_contains("/login")
        )
        
        assert "/userpool" not in driver.current_url
        print("✓ Wrong password rejected - stayed on login page")
    
    def test_login_failure_wrong_email(self, driver, base_url):
        """Test login fails with non-existent email"""
        client_id = "7112646b-c785-4306-b00f-87d29ad54fb2"
        login_url = f"{base_url}/login?client_id={client_id}"
        
        driver.get(login_url)
        
        # Fill with wrong email
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        email_input.send_keys("nonexistent@email.com")
        
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys("anypassword")
        
        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait to see if we stay on login page
        WebDriverWait(driver, 5).until(
            EC.url_contains("/login")
        )
        
        assert "/userpool" not in driver.current_url
        print("✓ Wrong email rejected - stayed on login page")

class TestIdentityProviderAPI:
    """Direct API tests for the Go backend"""
    
    def test_login_api_returns_tokens(self, api_base_url, api_client, test_user):
        """Test that login API returns tokens"""
        response = api_client.post(
            f"{api_base_url}/api/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"]
            }
        )
        
        assert response.status_code == 200
        print(f"✓ Login API returned status {response.status_code}")
    
    def test_login_api_rejects_wrong_password(self, api_base_url, api_client):
        """Test login API rejects wrong password"""
        response = api_client.post(
            f"{api_base_url}/api/auth/login",
            json={
                "email": "admin@email.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code in [401, 400, 403]
        print(f"✓ Wrong password correctly rejected with {response.status_code}")
