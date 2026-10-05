# Usamos una versión ligera de Node.js
FROM node:18-alpine
WORKDIR /app

# Copiamos dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .
EXPOSE 3000

# Iniciamos la API
CMD ["node", "index.js"]