# Stage 1: Build the binary
FROM golang:1.26-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first for better layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application with static linking for Alpine
# Line broken to stay under 80 chars
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o main ./cmd/main.go

# Stage 2: Final runtime image
FROM alpine:latest

# Install CA certificates for HTTPS/S3 connections
RUN apk --no-cache add ca-certificates

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/main /app/backend

# Expose the port your Gin server runs on
EXPOSE 8080

# Run the binary
CMD sh -c "echo 'Starting...' && sleep 5 && ./backend -migrate"