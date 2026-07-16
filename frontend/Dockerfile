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

# Pass build arguments to environment variables so Vite can bake them in
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI
ENV VITE_CLIENT_SECRET=$VITE_CLIENT_SECRET
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_BACKEND_API_KEY=$VITE_BACKEND_API_KEY
ENV VITE_ONE_PORTAL_CLIENT_ID=$VITE_ONE_PORTAL_CLIENT_ID
ENV VITE_ONE_PORTAL_URL=$VITE_ONE_PORTAL_URL
ENV BACKEND_PROXY_TARGET=$BACKEND_PROXY_TARGET

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

# Expose Nginx port
EXPOSE 5173

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]