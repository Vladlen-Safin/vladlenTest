# Базовый образ
FROM node:18

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json из api
COPY api/package*.json ./api/

# Копируем package.json и package-lock.json из client
COPY client/package*.json ./client/

# Устанавливаем зависимости backend
WORKDIR /app/api
RUN npm install

# Устанавливаем зависимости frontend
WORKDIR /app/client
RUN npm install

# Сборка фронтенда
RUN npm run build

# Возвращаемся в backend
WORKDIR /app/api

# Копируем весь код (после установки зависимостей — кеш сохранится)
COPY api/ ./ 
COPY --from=0 /app/client/build ./public

# Порт, который слушает ваше API
EXPOSE 3000

# Запуск backend-сервера
CMD ["npm", "start"]
