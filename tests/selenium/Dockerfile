# tests/selenium/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy test code
COPY . .

# Create directories for reports
RUN mkdir -p /app/reports /app/screenshots

CMD ["pytest", "-v", "--html=reports/report.html", "--self-contained-html", "--maxfail=5"]