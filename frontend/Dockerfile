# Stage 1: Build React App
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_CLIENT_ID
ARG VITE_REDIRECT_URI
ARG VITE_CLIENT_SECRET
ARG VITE_BACKEND_URL
ARG VITE_BACKEND_API_KEY
ARG VITE_ONE_PORTAL_CLIENT_ID
ARG VITE_ONE_PORTAL_URL

# Set them as ENV variables so Vite bakes them into the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI
ENV VITE_CLIENT_SECRET=$VITE_CLIENT_SECRET
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_BACKEND_API_KEY=$VITE_BACKEND_API_KEY
ENV VITE_ONE_PORTAL_CLIENT_ID=$VITE_ONE_PORTAL_CLIENT_ID
ENV VITE_ONE_PORTAL_URL=$VITE_ONE_PORTAL_URL

# Copy only dependency definition files first
COPY package.json package-lock.json ./

# Install dependencies in a clean, deterministic way
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the generated custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built production assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]