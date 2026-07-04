# Stage 1: Build React App
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

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