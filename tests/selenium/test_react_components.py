# tests/selenium/test_react_components.py
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestReactComponents:
    
    def test_navigation_bar_renders(self, driver, base_url):
        """Test React Router navigation"""
        driver.get(base_url)
        
        # Check for navigation links
        nav = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "nav"))
        )
        
        links = nav.find_elements(By.TAG_NAME, "a")
        assert len(links) > 0
    
    def test_form_validation(self, driver, base_url):
        """Test React form validation"""
        driver.get(f"{base_url}/login")
        
        # Try to submit empty form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # React should show validation errors
        error_messages = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".error, .invalid-feedback, [role='alert']"))
        )
        
        assert len(error_messages) > 0
    
    def test_password_visibility_toggle(self, driver, base_url):
        """Test React password visibility toggle (common feature)"""
        driver.get(f"{base_url}/login")
        
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        # Look for toggle button (eye icon)
        toggle_button = driver.find_elements(By.CSS_SELECTOR, ".password-toggle, .toggle-visibility, button[aria-label='toggle password visibility']")
        
        if toggle_button:
            original_type = password_input.get_attribute("type")
            toggle_button[0].click()
            
            # Input type should change to text
            new_type = password_input.get_attribute("type")
            assert new_type != original_type