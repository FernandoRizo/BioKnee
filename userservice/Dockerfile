# Builder for Node.js userservice
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia sólo package* para cachear npm install
COPY package*.json ./
RUN npm ci --production

# Copia el resto del código
COPY . .

# Variables de entorno (clave secreta, URL de Mongo) en .env
# Ejemplo .env:
# SECRET_KEY=tu_clave_supersecreta
# MONGO_URL=mongodb://mongo:27017/users

EXPOSE 3000
CMD ["node", "server_users.js"]
