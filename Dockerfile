FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN npm ci
RUN npm ci --prefix frontend

COPY backend ./backend
COPY frontend ./frontend
COPY tsconfig.backend.json tsconfig.build.json ./

RUN npm run build:backend
RUN npm run frontend:build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["node", "dist/backend/server.js"]
