# Use official Node.js LTS Alpine image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies (if any native modules)
RUN apk add --no-cache python3 make g++ bash

# Copy package files separately for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy all source files
COPY . .

# Build step (if you have any build step, e.g. TypeScript)
# RUN npm run build

# Production image: smaller, no build tools
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy app source
COPY --from=builder /app .

# Drop root privileges for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port your app listens on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
