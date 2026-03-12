# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# copy package files trước để cache dependency
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# install dependencies
RUN npm ci

# copy source code
COPY . .

# build project
RUN npm run build


# ---------- Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# copy build output
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main.js"]