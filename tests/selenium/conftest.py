import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os

@pytest.fixture(scope="session")
def driver():
    hub_host = os.getenv("SE_HUB_HOST", "selenium-hub")
    hub_port = os.getenv("SE_HUB_PORT", "4444")
    
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    
    driver = webdriver.Remote(
        command_executor=f"http://{hub_host}:{hub_port}/wd/hub",
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
    return os.getenv("API_BASE_URL", "http://172.31.64.1:8080")
