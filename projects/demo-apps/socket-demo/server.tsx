import { WebSocket, WebSocketServer } from 'ws';
import { parse } from 'url';
import 'dotenv/config';

const HOST = process.env.SOCKET_SERVER_HOST || '127.0.0.1';
const PORT = Number(process.env.SOCKET_SERVER_PORT || 8080);

const wss = new WebSocketServer({ port: PORT, host: HOST });

const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  console.log('New client connected');

  const query = parse(req.url || '', true).query;
  const userId = query.userId as string;
  if (userId) {
    console.log(`User connected: ${userId}`);
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId)?.add(ws);
  }

  ws.on('message', message => {
    try {
      const data = JSON.parse(message.toString('utf-8'));
      sendNotification(data.receivers, JSON.stringify(data));
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    if (userId) {
      console.log(`Client disconnected: ${userId}`);
      const userSockets = clients.get(userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          clients.delete(userId);
        }
      }
    }
  });
});

console.log(`WebSocket server running on ws://${HOST}:${PORT}`);

function sendToSockets(sockets: Set<WebSocket>, user: string, message: string) {
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log(`Sending message to ${user}`);
      ws.send(message);
    }
  });
}

function sendNotification(receivers: string | string[], message: string) {
  if (receivers === 'EVERYONE') {
    for (const [user, sockets] of clients.entries()) {
      sendToSockets(sockets, user, message);
    }
    return;
  } else {
    for (const receiver of receivers) {
      const userSockets = clients.get(receiver);
      if (userSockets) {
        sendToSockets(userSockets, receiver, message);
      }
    }
  }
}
