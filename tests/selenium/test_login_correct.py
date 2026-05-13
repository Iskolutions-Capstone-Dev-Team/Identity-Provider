import pytest
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
import json

class TestIdentityProviderLogin:
    
    def test_login_page_loads_with_client_id(self, driver, base_url):
        """Test that login page loads with client_id parameter"""
        client_id = os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
        login_url = f"{base_url}/login?client_id={client_id}"
        
        driver.get(login_url)
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        
        print("✓ Login page loaded successfully")
    
    def test_successful_login_redirects_to_callback(self, driver, base_url, test_user):
        """Test successful login redirects to callback with code"""
        client_id = os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
        login_url = f"{base_url}/login?client_id={client_id}"
        
        driver.get(login_url)
        
        # Fill login form
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        email_input.send_keys(test_user["email"])
        
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys(test_user["password"])
        
        # Click login
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Wait for redirect to callback URL with code
        try:
            WebDriverWait(driver, 15).until(
                lambda d: "callback?code=" in d.current_url
            )
            print(f"✓ Redirected to callback with auth code")
            print(f"URL: {driver.current_url}")
            
            # Extract the code
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(driver.current_url)
            code = parse_qs(parsed.query).get('code', [None])[0]
            assert code is not None
            print(f"✓ Auth code received: {code[:20]}...")
            
        except:
            driver.save_screenshot("/tests/screenshots/login_failed.png")
            print(f"Current URL: {driver.current_url}")
            raise

class TestIdentityProviderAPI:
    """Direct API tests for the Go backend"""
    
    def test_login_api_returns_authorization_code(self, api_base_url, api_client, test_user):
        """Test that login API returns authorization code redirect URL"""
        response = api_client.post(
            f"{api_base_url}/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"],
                "client_id": os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
            }
        )
        
        print(f"Login API responded with: {response.status_code}")
        assert response.status_code == 200
        
        # Response should be a redirect URL string
        redirect_url = response.text.strip('"')
        print(f"Redirect URL: {redirect_url}")
        
        # Check that it contains the callback and code
        assert "callback" in redirect_url
        assert "code=" in redirect_url
        
        print("✓ Login API returns authorization code redirect")
    
    def test_token_exchange(self, api_base_url, api_client, test_user):
        """Test exchanging auth code for tokens"""
        # First get the auth code
        login_response = api_client.post(
            f"{api_base_url}/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"],
                "client_id": os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2")
            }
        )
        
        redirect_url = login_response.text.strip('"')
        # Extract code from URL
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(redirect_url)
        code = parse_qs(parsed.query).get('code', [None])[0]
        
        if code:
            # Exchange code for tokens
            token_response = api_client.post(
                f"{api_base_url}/auth/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": os.getenv("TEST_CLIENT_ID", "7112646b-c785-4306-b00f-87d29ad54fb2"),
                    "redirect_uri": "http://localhost:5173/callback"
                }
            )
            print(f"Token endpoint responded with: {token_response.status_code}")
            if token_response.status_code == 200:
                print("✓ Successfully exchanged code for tokens")
    
    def test_jwks_endpoint_works(self, api_client):
        """Test JWKS endpoint is accessible"""
        response = api_client.get("http://172.31.64.1:8080/.well-known/jwks.json")
        assert response.status_code == 200
        print("✓ JWKS endpoint working")
