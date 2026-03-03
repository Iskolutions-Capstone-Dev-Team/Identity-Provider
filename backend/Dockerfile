# syntax=docker/dockerfile:1
# Stage 1: Build using a faster Debian-based image
FROM golang:1.26-bookworm AS builder

WORKDIR /app

# Cache dependencies separately to avoid re-downloading on code changes
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build using BuildKit cache mounts for compiled objects
# CGO_ENABLED=0 ensures a static binary that runs on any Linux distro
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o main ./cmd/main.go

# Stage 2: Final lightweight runtime image
FROM alpine:3.20

# Install CA certs and tzdata for correct time handling in your IdP
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main /app/backend

# Expose Gin port
EXPOSE 8080

# Use a clean shell form for startup logic
CMD ["sh", "-c", "echo 'Starting...' && sleep 5 && ./backend -migrate"]