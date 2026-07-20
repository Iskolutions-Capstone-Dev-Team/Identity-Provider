# Stage 1: Build React App
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_CLIENT_ID
ARG VITE_REDIRECT_URI
ARG VITE_CLIENT_SECRET
ARG VITE_BACKEND_URL
ARG VITE_BACKEND_API_KEY
ARG VITE_ONE_PORTAL_CLIENT_ID
ARG VITE_ONE_PORTAL_URL
ARG BACKEND_PROXY_TARGET

# Pass build arguments to environment variables so Vite can bake them in.
# If they are not provided (e.g. in CI), we use a placeholder for runtime injection.
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-__VITE_API_BASE_URL__}
ENV VITE_CLIENT_ID=${VITE_CLIENT_ID:-__VITE_CLIENT_ID__}
ENV VITE_REDIRECT_URI=${VITE_REDIRECT_URI:-__VITE_REDIRECT_URI__}
ENV VITE_CLIENT_SECRET=${VITE_CLIENT_SECRET:-__VITE_CLIENT_SECRET__}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL:-__VITE_BACKEND_URL__}
ENV VITE_BACKEND_API_KEY=${VITE_BACKEND_API_KEY:-__VITE_BACKEND_API_KEY__}
ENV VITE_ONE_PORTAL_CLIENT_ID=${VITE_ONE_PORTAL_CLIENT_ID:-__VITE_ONE_PORTAL_CLIENT_ID__}
ENV VITE_ONE_PORTAL_URL=${VITE_ONE_PORTAL_URL:-__VITE_ONE_PORTAL_URL__}
ENV BACKEND_PROXY_TARGET=${BACKEND_PROXY_TARGET:-__BACKEND_PROXY_TARGET__}

# Copy only dependency definition files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration to handle React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add the runtime environment injection script
COPY env-replace.sh /docker-entrypoint.d/40-env-replace.sh
# Fix line endings (Windows CRLF to Linux LF) to prevent 'not found' errors
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-env-replace.sh && \
    chmod +x /docker-entrypoint.d/40-env-replace.sh

# Expose Nginx port
EXPOSE 5173

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]