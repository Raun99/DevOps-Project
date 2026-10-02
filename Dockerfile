# CLANDESTINE Social Blogging Platform Container
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build production client
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Create unprivileged user for security
RUN addgroup -S clandestine && adduser -S scholar -G clandestine
USER scholar

EXPOSE 5000

CMD ["sh", "-c", "node server/db/migrate.js && node server/index.js"]
