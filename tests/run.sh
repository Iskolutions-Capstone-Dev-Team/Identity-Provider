#!/bin/bash
case "$1" in
  up)
    echo "Starting Selenium..."
    docker compose -f docker-compose.test.yml up -d selenium-hub chrome
    sleep 5
    ;;
  test)
    echo "Running tests..."
    docker compose -f docker-compose.test.yml run selenium-tests
    ;;
  down)
    echo "Stopping everything..."
    docker compose -f docker-compose.test.yml down -v
    ;;
  clean)
    echo "Cleaning up..."
    docker compose -f docker-compose.test.yml down -v
    docker system prune -f
    rm -rf reports/ screenshots/
    ;;
  *)
    echo "Usage: ./run.sh {up|test|down|clean}"
    ;;
esac
