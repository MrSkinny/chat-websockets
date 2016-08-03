const socket = require('socket.io');
const express = require('express');
const http = require('http');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const server = http.Server(app);
const io = socket(server);
const redisClient = redis.createClient({db: 1});
const jsonParser = bodyParser.json();

function formatChatDate(date){
  function pad(num){
    return num < 10 ? `0${num}` : num;
  }

  let hours = pad(date.getHours());
  let minutes = pad(date.getMinutes());
  let seconds = pad(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}

app.use(express.static('public'));

// clear users in db
redisClient.ltrim('users', 0, 0);
redisClient.lpop('users');

app.get('/api/users', (req, res) => {
  redisClient.lrange('users', 0, -1, (err, data) => {
    if (err) return res.status(500).json({error: true});
    res.json(data);
  });
});

app.get('/api/messages', (req, res) => {
  redisClient.lrange('messages', 0, 10, (err, data) => {
    if (err) return res.status(500).json({error: true});
    res.json(data);
  });
});

app.post('/api/messages', jsonParser, (req, res) => {
  let message = `${req.body.username} [${formatChatDate(new Date)}]: ${req.body.message}`;
  redisClient.lpush('messages', message, (err) => {
    if (err) return res.status(500).json({error: true});
    res.json({message});
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

  socket.on('message', () => {
    socket.emit('message');
  });
});

server.listen(3000, () => console.log('Server started on 3000'));
