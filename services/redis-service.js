const redis = require("redis");
const url = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}`

const client = redis.createClient({
  url: url,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  user: process.env.REDIS_USERNAME
});

function log(type) {
  return function() {
      console.log(type, arguments);
  }
}

client.on('connect'     , log('connect'));
client.on('ready'       , log('ready'));
client.on('reconnecting', log('reconnecting'));
client.on('error'       , log('error'));
client.on('end'         , log('end'));

// client.set("key", "value", redis.print)