# Usa una imagen base oficial de Node.js
FROM node:14

# Establece el directorio de trabajo en /app
WORKDIR /Bioknee

# Copia los archivos package.json y package-lock.json 
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que corre la aplicación 
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
