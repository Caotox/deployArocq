# ── Stage 1 : dépendances de production uniquement ───────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2 : image finale légère ─────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copier les dépendances installées depuis le stage précédent
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY src/ ./src/
COPY package.json ./

# Utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
