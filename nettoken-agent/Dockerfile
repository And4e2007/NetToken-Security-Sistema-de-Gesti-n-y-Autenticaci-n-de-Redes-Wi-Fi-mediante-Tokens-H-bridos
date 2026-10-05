FROM node:18-alpine
WORKDIR /app

# Instalamos las herramientas de red nativas de Linux (iptables y tc)
RUN apk add --no-cache iptables iproute2

COPY package*.json ./
RUN npm install
COPY . .

# El agente es un proceso en segundo plano, no expone puertos
CMD ["node", "agent.js"]