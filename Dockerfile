# ==== Этап 1: сборка frontend ====
FROM node:18 AS frontend

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build


# ==== Этап 2: сборка backend + копирование фронтенда ====
FROM node:18

WORKDIR /app

# Копируем backend package.json
COPY api/package*.json ./api/
WORKDIR /app/api
RUN npm install

# Копируем backend код
COPY api/ ./api

# Копируем сборку frontend из предыдущего этапа
COPY --from=frontend /app/client/build ./api/public

WORKDIR /app/api

EXPOSE 3010

CMD ["npm", "start"]
