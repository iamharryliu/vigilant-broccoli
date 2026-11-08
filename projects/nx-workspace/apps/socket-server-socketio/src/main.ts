import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import express, { Request, Response } from 'express';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import {
  BEARER_PREFIX,
  HTTP_STATUS_CODES,
  PUBLISH_ERROR_CODES,
  PublishAck,
  SOCKET_EVENTS,
  SOCKET_SERVER_PATHS,
  SSE_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { isTimingSafeEqual } from '@vigilant-broccoli/common-node';

const DEFAULT_PORT = '3000';
const DEFAULT_HOST = '0.0.0.0';
const STATUS_OK = 'ok';
const PUBLISH_BODY_LIMIT = '64kb';
// Below Cloudflare's 100s and typical proxy idle timeouts so idle streams stay open.
const SSE_KEEPALIVE_INTERVAL_MS = 25000;
const SSE_KEEPALIVE_FRAME = ':keepalive\n\n';
const SSE_CONNECTED_FRAME = ':connected\n\n';
const REQUEST_CLOSE_EVENT = 'close';

const SSE_HEADERS = {
  'Content-Type': SSE_CONTENT_TYPE,
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'Access-Control-Allow-Origin': '*',
} as const;

const TRANSPORT = {
  SOCKET_IO: 'socket.io',
  HTTP: 'http',
} as const;

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
  SSE_CONNECT: 'sse_connect',
  SSE_DISCONNECT: 'sse_disconnect',
  SSE_SUBSCRIBE_INVALID: 'sse_subscribe_invalid',
  HTTP_PUBLISH: 'http_publish',
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

type PublishMessage = z.infer<typeof publishSchema>;

const roomFor = (app: string, receiverId: string) => `${app}:${receiverId}`;

const log = (event: string, data: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...data }));
};

const sseRooms = new Map<string, Set<Response>>();

const addSseClient = (room: string, res: Response) => {
  const clients = sseRooms.get(room) ?? new Set<Response>();
  clients.add(res);
  sseRooms.set(room, clients);
};

const removeSseClient = (room: string, res: Response) => {
  const clients = sseRooms.get(room);
  if (!clients) return;
  clients.delete(res);
  if (clients.size === 0) sseRooms.delete(room);
};

const sseFrame = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

setInterval(() => {
  sseRooms.forEach(clients =>
    clients.forEach(res => res.write(SSE_KEEPALIVE_FRAME)),
  );
}, SSE_KEEPALIVE_INTERVAL_MS).unref();

const isSender = (token: unknown) =>
  Boolean(
    SENDER_TOKEN &&
    typeof token === 'string' &&
    isTimingSafeEqual(token, SENDER_TOKEN),
  );

const bearerToken = (req: Request) => {
  const header = req.headers.authorization;
  return header?.startsWith(BEARER_PREFIX)
    ? header.slice(BEARER_PREFIX.length)
    : undefined;
};

const app = express();
app.get(SOCKET_SERVER_PATHS.HEALTH, (_req, res) => {
  res.status(HTTP_STATUS_CODES.OK).json({ status: STATUS_OK });
});

app.get(SOCKET_SERVER_PATHS.EVENTS, (req, res) => {
  const parsed = subscriptionSchema.safeParse(req.query);
  if (!parsed.success) {
    log(LOG.SSE_SUBSCRIBE_INVALID, { issues: parsed.error.issues });
    res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ code: PUBLISH_ERROR_CODES.INVALID, issues: parsed.error.issues });
    return;
  }
  const room = roomFor(parsed.data.app, parsed.data.receiverId);
  res.writeHead(HTTP_STATUS_CODES.OK, SSE_HEADERS);
  res.flushHeaders();
  res.write(SSE_CONNECTED_FRAME);
  addSseClient(room, res);
  log(LOG.SSE_CONNECT, { room, clients: sseRooms.get(room)?.size });

  req.on(REQUEST_CLOSE_EVENT, () => {
    removeSseClient(room, res);
    log(LOG.SSE_DISCONNECT, { room });
  });
});

app.post(
  SOCKET_SERVER_PATHS.PUBLISH,
  express.json({ limit: PUBLISH_BODY_LIMIT }),
  (req, res) => {
    const reply = (status: number, result: PublishAck) =>
      res.status(status).json(result);

    const token = bearerToken(req);
    if (!isSender(token)) {
      log(LOG.PUBLISH_FORBIDDEN, { transport: TRANSPORT.HTTP });
      reply(
        token === undefined
          ? HTTP_STATUS_CODES.UNAUTHORIZED
          : HTTP_STATUS_CODES.FORBIDDEN,
        { ok: false, code: PUBLISH_ERROR_CODES.FORBIDDEN },
      );
      return;
    }
    const parsed = publishSchema.safeParse(req.body);
    if (!parsed.success) {
      log(LOG.PUBLISH_INVALID, {
        transport: TRANSPORT.HTTP,
        issues: parsed.error.issues,
      });
      reply(HTTP_STATUS_CODES.BAD_REQUEST, {
        ok: false,
        code: PUBLISH_ERROR_CODES.INVALID,
        issues: parsed.error.issues,
      });
      return;
    }
    const receivers = fanOut(parsed.data, TRANSPORT.HTTP);
    reply(HTTP_STATUS_CODES.OK, { ok: true, receivers });
  },
);

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
  socket.data.role = isSender(socket.handshake.auth?.token)
    ? ROLE_SENDER
    : ROLE_RECEIVER;
  next();
});

// One fan-out for both publish transports so each reaches Socket.IO and SSE subscribers.
function fanOut(
  { app, receiverId, payload }: PublishMessage,
  transport: string,
) {
  const room = roomFor(app, receiverId);
  const message = { app, receiverId, payload };
  const socketReceivers = io.sockets.adapter.rooms.get(room)?.size ?? 0;
  io.to(room).emit(SOCKET_EVENTS.MESSAGE, message);
  const sseClients = sseRooms.get(room);
  if (sseClients) {
    const frame = sseFrame(SOCKET_EVENTS.MESSAGE, message);
    sseClients.forEach(res => res.write(frame));
  }
  const sseReceivers = sseClients?.size ?? 0;
  log(transport === TRANSPORT.HTTP ? LOG.HTTP_PUBLISH : LOG.PUBLISH, {
    room,
    transport,
    receivers: socketReceivers + sseReceivers,
    socketReceivers,
    sseReceivers,
  });
  return socketReceivers + sseReceivers;
}

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

  socket.on(SOCKET_EVENTS.PUBLISH, (raw, ack) => {
    const reply = (result: PublishAck) => {
      if (typeof ack === 'function') ack(result);
    };

    if (socket.data.role !== ROLE_SENDER) {
      log(LOG.PUBLISH_FORBIDDEN, { socketId: socket.id });
      reply({ ok: false, code: PUBLISH_ERROR_CODES.FORBIDDEN });
      return;
    }
    const parsed = publishSchema.safeParse(raw);
    if (!parsed.success) {
      log(LOG.PUBLISH_INVALID, {
        socketId: socket.id,
        issues: parsed.error.issues,
      });
      reply({
        ok: false,
        code: PUBLISH_ERROR_CODES.INVALID,
        issues: parsed.error.issues,
      });
      return;
    }
    const receivers = fanOut(parsed.data, TRANSPORT.SOCKET_IO);
    reply({ ok: true, receivers });
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
