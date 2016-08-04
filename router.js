const redisClient = require('./db-config');
const express = require('express');
const jsonParser = require('body-parser').json();
const formatChatDate = require('./lib/utils').formatChatDate;

const router = express.Router();

router.post('*', jsonParser);

router
  .get('/api/users', (req, res) => {
    redisClient.lrange('users', 0, -1, (err, data) => {
      if (err) return res.status(500).json({error: true});
      res.json(data);
    });
  })

  .get('/api/messages', (req, res) => {
    redisClient.lrange('messages', 0, 10, (err, data) => {
      if (err) return res.status(500).json({error: true});
      res.json(data);
    });
  })

  .post('/api/messages', (req, res) => {
    let message = `${req.body.username} [${formatChatDate(new Date)}]: ${req.body.message}`;
    redisClient.lpush('messages', message, (err) => {
      if (err) return res.status(500).json({error: true});
      res.json({message});
    });
  });

module.exports = router;

