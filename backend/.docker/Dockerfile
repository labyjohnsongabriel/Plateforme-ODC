# ============================================
#  Backend ODC Platform — Dockerfile
# ============================================

# ---------- STAGE 1 : BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json en premier (cache Docker)
COPY package*.json ./
COPY tsconfig*.json ./

# Installer TOUTES les dépendances (dev incluses pour build)
RUN npm ci

# Copier le code source
COPY . .

# Builder
RUN npm run build

# ---------- STAGE 2 : PRODUCTION ----------
FROM node:20-alpine

WORKDIR /app

# Installer Chromium pour Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Créer utilisateur non-root
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copier package.json et installer UNIQUEMENT les deps de prod
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le build + fichiers nécessaires
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./src/templates

# Créer les dossiers runtime
RUN mkdir -p uploads/avatars uploads/formations uploads/attestations uploads/ressources logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]