# Base
FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Build
WORKDIR /app
COPY . .
RUN npm run build

# Production
FROM node:18-alpine AS production

COPY --from=base /app/package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=base /app/dist ./dist

USER node
ENV PORT=4000
EXPOSE 4000
CMD [ "node", "dist/main.js" ]