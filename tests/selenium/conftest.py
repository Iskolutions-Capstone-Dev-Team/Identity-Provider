import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import requests
import os
import time
from datetime import datetime

@pytest.fixture(scope="session")
def driver():
    hub_host = os.getenv("SE_HUB_HOST", "selenium-hub")
    hub_port = os.getenv("SE_HUB_PORT", "4444")
    
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Connect to Selenium Grid
    driver = webdriver.Remote(
        command_executor=f"http://{hub_host}:{hub_port}/wd/hub",
        options=chrome_options
    )
    driver.implicitly_wait(10)  # Fixed: was 'implicitly_walk'
    driver.maximize_window()
    
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def base_url():
    """Your React frontend URL"""
    return os.getenv("APP_BASE_URL", "http://host.docker.internal:5173")

@pytest.fixture(scope="session")
def api_base_url():
    """Your Go backend URL"""
    return os.getenv("API_BASE_URL", "http://host.docker.internal:8080")

@pytest.fixture
def test_user():
    return {
        "username": os.getenv("TEST_USERNAME", "test@example.com"),
        "password": os.getenv("TEST_PASSWORD", "password123")
    }

@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    # Disable SSL warnings if needed
    requests.packages.urllib3.disable_warnings()
    session.verify = False
    return session

@pytest.fixture(scope="session")
def wait_for_services():
    """Wait for services to be ready (more forgiving)"""
    api_url = os.getenv("API_BASE_URL", "http://host.docker.internal:8080")
    app_url = os.getenv("APP_BASE_URL", "http://host.docker.internal:5173")
    
    max_retries = 20
    api_ready = False
    app_ready = False
    
    for i in range(max_retries):
        # Check backend
        if not api_ready:
            try:
                resp = requests.get(api_url, timeout=2)
                if resp.status_code < 500:  # Any response (even 404) means it's running
                    print("✓ Go backend is running")
                    api_ready = True
            except requests.exceptions.ConnectionError:
                pass
        
        # Check frontend
        if not app_ready:
            try:
                resp = requests.get(app_url, timeout=2)
                if resp.status_code == 200:
                    print("✓ React frontend is ready")
                    app_ready = True
            except:
                pass
        
        if api_ready and app_ready:
            print("✅ All services are ready!")
            return
        
        print(f"⏳ Waiting for services... ({i+1}/{max_retries})")
        time.sleep(2)
    
    if not api_ready:
        print("⚠️ Could not connect to backend. Tests may fail.")
    if not app_ready:
        print("⚠️ Could not connect to frontend. Tests may fail.")

# Screenshot on failure
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        driver = item.funcargs.get('driver')
        if driver:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"/app/screenshots/failure_{item.name}_{timestamp}.png"
            driver.save_screenshot(screenshot_path)
            print(f"\n📸 Screenshot saved: {screenshot_path}")
