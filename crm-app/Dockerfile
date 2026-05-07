# ============================================================
# Stage 1 — Build React frontend
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# ============================================================
# Stage 2 — Production Node.js image
# ============================================================
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built React into where server.js expects it
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Ownership
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/healthz || exit 1

CMD ["node", "backend/server.js"]
