# Stage 1: Build React App
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only dependency definition files first
# This allows Docker to cache dependency installation layers
COPY package.json package-lock.json ./

# Install dependencies in a clean, deterministic way
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the production-ready static files
RUN npm run build

# Stage 2: Serve the Built Files with Nginx
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (nginx default HTTP port)
EXPOSE 80

# Start nginx in foreground mode (required for Docker containers)
CMD ["nginx", "-g", "daemon off;"]