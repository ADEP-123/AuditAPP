# --- Etapa 1: compila el frontend (React + Vite) ---
FROM node:22-alpine AS client-build
WORKDIR /app
COPY client/package.json client/package-lock.json client/
RUN npm ci --prefix client
COPY shared shared
COPY client client
RUN npm run build --prefix client

# --- Etapa 2: servidor Express que sirve la API y el frontend compilado ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/app/data
COPY server/package.json server/package-lock.json server/
RUN npm ci --prefix server --omit=dev
COPY shared shared
COPY server server
COPY --from=client-build /app/client/dist client/dist
# data/ guarda la llave de los sellos de tiempo; debe sobrevivir a reinicios (volumen)
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/api/health || exit 1
CMD ["node", "server/src/index.js"]
