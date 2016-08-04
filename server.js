const socket = require('socket.io');
const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);
const io = socket(server);
const router = require('./router');
const redisClient = require('./db-config');

app.use(express.static('public'));
app.use(router);

// clear users in db
redisClient.ltrim('users', 0, 0, () => {
  redisClient.lpop('users');
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

  socket.on('message', () => {
    socket.emit('message');
  });
});

server.listen(3000, () => console.log('Server started on 3000'));

