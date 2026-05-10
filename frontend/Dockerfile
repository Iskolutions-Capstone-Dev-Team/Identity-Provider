# Stage 1: Build React App
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only dependency definition files first
# This allows Docker to cache dependency installation layers
COPY package.json package-lock.json ./

# Install dependencies in a clean, deterministic way
RUN npm ci && npm cache clean --force

# Copy the rest of the application source code
COPY . .

# Expose Vite development port
EXPOSE 5173

# Start Vite dev server
# --host allows access outside container
CMD ["npm", "run", "dev", "--", "--host"]