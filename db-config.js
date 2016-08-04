const redis = require('redis');

module.exports = redis.createClient({db: 1});
