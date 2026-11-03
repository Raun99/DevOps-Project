# ==============================================================================
# CLANDESTINE Backend API Container (Node.js 20 Alpine)
# Runs Express 5 REST API, Database Migrations, Seed, & Metrics
# ==============================================================================

# Stage 1: Build production frontend assets (retained for standalone/fallback serving)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build client bundle
COPY . .
RUN npm run build

# Stage 2: Minimalist Node.js production runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application server and compiled client artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Create unprivileged system user for security hardening
RUN addgroup -S clandestine && adduser -S scholar -G clandestine
USER scholar

# Health check probing the Express health endpoint
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["sh", "-c", "node server/db/migrate.js && node server/index.js"]
