import pytest
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests

class TestIdentityProviderLogin:
    
    def test_login_page_loads_with_client_id(self, driver, base_url):
        """Test that login page loads with client_id parameter"""
        client_id = os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
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
        client_id = os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
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
        
        # Wait for redirect to userpool
        try:
            WebDriverWait(driver, 15).until(
                lambda d: "/userpool" in d.current_url
            )
            print(f"✓ Successfully logged in and redirected to: {driver.current_url}")
        except:
            driver.save_screenshot("/tests/screenshots/login_redirect_failed.png")
            print(f"Current URL after login attempt: {driver.current_url}")
            raise

class TestIdentityProviderAPI:
    """Direct API tests for the Go backend"""
    
    def test_login_api_returns_tokens(self, api_base_url, api_client, test_user):
        """Test that login API returns tokens"""
        response = api_client.post(
            f"{api_base_url}/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Login API returned {response.status_code}")
        # Check for tokens in response
        assert "token" in data or "access_token" in data
        print("✓ Tokens received")
    
    def test_login_api_rejects_wrong_password(self, api_base_url, api_client):
        """Test login API rejects wrong password"""
        response = api_client.post(
            f"{api_base_url}/auth/login",
            json={
                "email": "admin@email.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code in [401, 400, 403]
        print(f"✓ Wrong password correctly rejected with {response.status_code}")
    
    def test_jwks_endpoint_works(self, api_base_url, api_client):
        """Test JWKS endpoint is accessible"""
        response = api_client.get(f"{api_base_url}/.well-known/jwks.json")
        assert response.status_code == 200
        print("✓ JWKS endpoint working")
