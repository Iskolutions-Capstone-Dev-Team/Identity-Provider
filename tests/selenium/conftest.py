import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import requests
import os
import time

@pytest.fixture(scope="session")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    
    driver = webdriver.Remote(
        command_executor="http://selenium-hub:4444/wd/hub",
        options=chrome_options
    )
    driver.implicitly_wait(10)
    driver.maximize_window()
    
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def base_url():
    return os.getenv("APP_BASE_URL", "http://172.31.64.1:5173")

@pytest.fixture(scope="session")
def api_base_url():
    # This now returns http://172.31.64.1:8080/api/v1
    return os.getenv("API_BASE_URL", "http://172.31.64.1:8080/api/v1")

@pytest.fixture
def test_user():
    return {
        "email": os.getenv("TEST_USERNAME", "admin@email.com"),
        "password": os.getenv("TEST_PASSWORD", "adminpass123!")
    }

@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        driver = item.funcargs.get('driver')
        if driver:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"/tests/screenshots/failure_{item.name}_{timestamp}.png"
            driver.save_screenshot(screenshot_path)
            print(f"\n📸 Screenshot saved: {screenshot_path}")
