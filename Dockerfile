# ---------- Builder Stage ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Use a faster and more reliable mirror (important on Alpine)
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories \
  && apk update \
  && apk add --no-cache python3 make g++ bash

# Copy package files separately for better layer caching
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code
COPY . .

# If you have a build step (e.g., TypeScript or Webpack), enable this:
# RUN npm run build


# ---------- Production Stage ----------
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only needed files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Optional: Remove dev dependencies in production image
# RUN npm prune --production

# Drop root privileges for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose application port
EXPOSE 8080

# Start app
CMD ["npm", "start"]
