import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { SOCKET_EVENTS } from '@vigilant-broccoli/common-js';

const DEFAULT_PORT = '3000';
const DEFAULT_HOST = '0.0.0.0';
const HEALTH_PATH = '/health';
const STATUS_OK = 'ok';

const PORT = parseInt(process.env.PORT ?? DEFAULT_PORT, 10);
const HOST = process.env.HOST ?? DEFAULT_HOST;
const SENDER_TOKEN = process.env.SENDER_TOKEN;
const TLS_CERT_PATH = process.env.TLS_CERT_PATH;
const TLS_KEY_PATH = process.env.TLS_KEY_PATH;

const LOG = {
  LISTENING: 'listening',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PUBLISH: 'publish',
  SUBSCRIBE_INVALID: 'subscribe_invalid',
  PUBLISH_INVALID: 'publish_invalid',
  PUBLISH_FORBIDDEN: 'publish_forbidden',
} as const;

const ROLE_SENDER = 'sender';
const ROLE_RECEIVER = 'receiver';

const subscriptionSchema = z.object({
  app: z.string().min(1),
  receiverId: z.string().min(1),
});

const publishSchema = z.object({
  app: z.string().min(1),
  receiverId: z.string().min(1),
  payload: z.unknown(),
});

const roomFor = (app: string, receiverId: string) => `${app}:${receiverId}`;

const log = (event: string, data: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...data }));
};

const app = express();
app.get(HEALTH_PATH, (_req, res) => {
  res.status(200).json({ status: STATUS_OK });
});

const buildServer = () => {
  if (TLS_CERT_PATH && TLS_KEY_PATH) {
    return createHttpsServer(
      { cert: readFileSync(TLS_CERT_PATH), key: readFileSync(TLS_KEY_PATH) },
      app,
    );
  }
  return createHttpServer(app);
};

const tlsEnabled = Boolean(TLS_CERT_PATH && TLS_KEY_PATH);
const httpServer = buildServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  socket.data.role =
    SENDER_TOKEN && token === SENDER_TOKEN ? ROLE_SENDER : ROLE_RECEIVER;
  next();
});

const handleSubscribe = (socket: Socket, raw: unknown, join: boolean) => {
  const parsed = subscriptionSchema.safeParse(raw);
  if (!parsed.success) {
    log(LOG.SUBSCRIBE_INVALID, {
      socketId: socket.id,
      issues: parsed.error.issues,
    });
    return;
  }
  const room = roomFor(parsed.data.app, parsed.data.receiverId);
  if (join) {
    socket.join(room);
    log(LOG.SUBSCRIBE, { socketId: socket.id, room });
  } else {
    socket.leave(room);
    log(LOG.UNSUBSCRIBE, { socketId: socket.id, room });
  }
};

io.on(SOCKET_EVENTS.CONNECTION, socket => {
  log(LOG.CONNECT, { socketId: socket.id, role: socket.data.role });

  socket.on(SOCKET_EVENTS.SUBSCRIBE, data =>
    handleSubscribe(socket, data, true),
  );
  socket.on(SOCKET_EVENTS.UNSUBSCRIBE, data =>
    handleSubscribe(socket, data, false),
  );

  socket.on(SOCKET_EVENTS.PUBLISH, async raw => {
    if (socket.data.role !== ROLE_SENDER) {
      log(LOG.PUBLISH_FORBIDDEN, { socketId: socket.id });
      return;
    }
    const parsed = publishSchema.safeParse(raw);
    if (!parsed.success) {
      log(LOG.PUBLISH_INVALID, {
        socketId: socket.id,
        issues: parsed.error.issues,
      });
      return;
    }
    const room = roomFor(parsed.data.app, parsed.data.receiverId);
    const sockets = await io.in(room).fetchSockets();
    io.to(room).emit(SOCKET_EVENTS.MESSAGE, {
      app: parsed.data.app,
      receiverId: parsed.data.receiverId,
      payload: parsed.data.payload,
    });
    log(LOG.PUBLISH, { room, receivers: sockets.length });
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, reason => {
    log(LOG.DISCONNECT, { socketId: socket.id, reason });
  });
});

httpServer.listen(PORT, HOST, () => {
  log(LOG.LISTENING, {
    host: HOST,
    port: PORT,
    tls: tlsEnabled,
    senderAuth: Boolean(SENDER_TOKEN),
  });
});
