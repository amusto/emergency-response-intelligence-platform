# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY apps/web/package.json ./apps/web/package.json
COPY package.json package-lock.json* ./
RUN npm install --workspace apps/web --include-workspace-root

COPY apps/web ./apps/web
RUN npm run build --workspace apps/web

# --- Runtime stage (nginx) ---
FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
