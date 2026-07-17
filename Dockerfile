# ==========================================
# STAGE 1: Build Frontend and Server Bundle
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all development and production dependencies
RUN npm ci

# Copy full application code
COPY . .

# Build both static assets (Vite) and the server bundle (esbuild)
# This outputs the static files in /app/dist/ and compiled server in /app/dist/server.cjs
RUN npm run build

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:20-slim AS runner

WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests to install production-only modules
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --only=production

# Copy compiled build output and server bundle from build stage
COPY --from=builder /app/dist ./dist

# Expose the mandatory port 3000 for container ingress routing
EXPOSE 3000

# Start command executes standalone CommonJS server
CMD ["node", "dist/server.cjs"]
