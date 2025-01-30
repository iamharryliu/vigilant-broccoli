const net = require('net');

const PORT = 3000;

const server = net.createServer(socket => {
  console.log('Client connected');

  socket.on('data', data => {
    console.log(`Received: ${data}`);
    socket.write(`Echo: ${data}`);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', err => {
    console.error(`Socket error: ${err.message}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
