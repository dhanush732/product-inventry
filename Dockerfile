# Multi-stage Dockerfile for Astro Product Cart
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN npm install --legacy-peer-deps

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4321
CMD ["npx", "astro", "preview", "--port", "4321", "--host"]
