import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket, req) => {
  console.log('Client connected');

  // Send a welcome message to the client
  socket.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

  // Handle incoming messages from clients
  socket.on('message', data => {
    console.log('Received from ${clientId}: ${data}');

    // Broadcast the message to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ message: data.toString() }));
      }
    });
  });

  socket.on('close', () => {
    console.log(`Client disconnected`);
  });

  socket.on('error', err => {
    console.error(`WebSocket error: ${err.message}`);
  });
});

console.log('WebSocket server running on ws://localhost:8080');
