# FinTrack Pro - Production Multi-Stage Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build Vite frontend + bundled Express backend (dist/server.cjs)
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests & install only production runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

# Expose port
EXPOSE 3000

# Run standalone Node server
CMD ["node", "dist/server.cjs"]
