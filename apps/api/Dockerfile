# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install workspace deps using the API package manifest only.
COPY apps/api/package.json ./apps/api/package.json
COPY package.json package-lock.json* ./
RUN npm install --workspace apps/api --include-workspace-root

COPY apps/api ./apps/api
RUN npm run build --workspace apps/api

# --- Runtime stage ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# npm workspaces hoist all dependencies to the root node_modules; Node resolves
# up to it from apps/api at runtime, so no per-workspace node_modules is needed.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3000
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
