FROM node:20-alpine

ENV SOCKET_SERVER_HOST=0.0.0.0
ENV SOCKET_SERVER_PORT=8080

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npx", "tsx", "server.ts"]
