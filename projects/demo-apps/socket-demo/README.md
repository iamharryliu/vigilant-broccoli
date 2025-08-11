# Socket Demo

```
# Run socket server.
npx tsx
# Connect to socket in terminal and type messages
nc localhost 3000
```

```
docker build -t websocket-server .
docker run -p 5000:5000 websocket-server
```

```
[Unit]
Description=Socket Service

[Service]
ExecStart=npx tsx server.ts
WorkingDirectory=/opt/booshan-socket-listener
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```
