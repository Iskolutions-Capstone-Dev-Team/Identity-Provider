#!/bin/bash

cd "$(dirname "$0")"

case "$1" in
  start-selenium)
    echo "🚀 Starting Selenium Grid..."
    docker compose -f docker-compose.test.yml up -d selenium-hub chrome
    echo "⏳ Waiting for Selenium to be ready..."
    sleep 10
    echo "✅ Selenium started"
    ;;
  start-app)
    echo "🚀 Starting your Go and React apps..."
    cd .. && docker compose up -d
    echo "⏳ Waiting for apps to be ready..."
    sleep 15
    echo "✅ Apps started"
    ;;
  test)
    echo "🧪 Running Selenium tests..."
    docker compose -f docker-compose.test.yml up --abort-on-container-exit selenium-tests
    ;;
  test-only)
    echo "🧪 Running tests (without restarting containers)..."
    docker compose -f docker-compose.test.yml run selenium-tests
    ;;
  stop)
    echo "🛑 Stopping all services..."
    docker compose -f docker-compose.test.yml down
    cd .. && docker compose down
    echo "✅ All services stopped"
    ;;
  stop-selenium)
    echo "🛑 Stopping Selenium services..."
    docker compose -f docker-compose.test.yml down
    ;;
  logs)
    docker compose -f docker-compose.test.yml logs -f
    ;;
  clean)
    echo "🧹 Cleaning up..."
    docker compose -f docker-compose.test.yml down -v
    rm -rf reports/ screenshots/
    echo "✅ Cleanup complete"
    ;;
  status)
    echo "=== Selenium Containers ==="
    docker compose -f docker-compose.test.yml ps
    echo ""
    echo "=== Your App Containers ==="
    cd .. && docker compose ps
    ;;
  *)
    echo "Usage: ./run.sh {start-selenium|start-app|test|test-only|stop|stop-selenium|logs|clean|status}"
    echo ""
    echo "Commands:"
    echo "  start-selenium  - Start Selenium Grid only"
    echo "  start-app       - Start your Go and React apps"
    echo "  test            - Run tests (starts fresh test container)"
    echo "  test-only       - Run tests without restarting container"
    echo "  stop            - Stop all services"
    echo "  stop-selenium   - Stop Selenium only"
    echo "  logs            - View Selenium logs"
    echo "  clean           - Remove containers and test artifacts"
    echo "  status          - Show status of all containers"
    ;;
esac