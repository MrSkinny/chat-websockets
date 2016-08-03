const socket = require('socket.io');
const express = require('express');
const http = require('http');
const redis = require('redis');

const app = express();
const server = http.Server(app);
const io = socket(server);
const redisClient = redis.createClient({db: 1});

app.use(express.static('public'));

app.get('/api/users', (req, res) => {
  redisClient.lrange('users', 0, -1, (err, data) => {
    if (err) throw new Error('could not fetch users');
    res.json(data);
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  let storeUsername = null;

  socket.on('disconnect', () => {
    redisClient.lrem('users', 0, storeUsername);
    socket.broadcast.emit('user-leave', storeUsername);
  });

  socket.on('user-join', (username) => {
    storeUsername = username;
    console.log('User joined:', username);
    redisClient.lpush('users', username);
    socket.broadcast.emit('user-join', username);
  });

  socket.on('message', (message) => {
    socket.broadcast.emit('message', message);
  });
});

server.listen(3000, () => console.log('Server started on 3000'));
