#!/bin/bash

# Load .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

case "$1" in
  up)
    docker compose -f docker-compose.test.yml up -d selenium-hub chrome
    ;;
  test)
    docker compose -f docker-compose.test.yml run selenium-tests pytest -v -s
    ;;
  down)
    docker compose -f docker-compose.test.yml down -v
    ;;
  clean)
    docker compose -f docker-compose.test.yml down -v
    rm -rf reports/ screenshots/
    ;;
  *)
    echo "Usage: ./run.sh {up|test|down|clean}"
    ;;
esac
