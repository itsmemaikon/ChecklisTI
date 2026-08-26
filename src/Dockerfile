FROM node:20

WORKDIR /app/backend

# Copiar package.json e instalar dependências
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar todo o backend
COPY backend/ ./

# Copiar frontend **dentro do backend**
COPY frontend/ ./frontend/

EXPOSE 3000

CMD ["node", "server.js"]
