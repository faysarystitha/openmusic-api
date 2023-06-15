const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER
  },
  redis: {
    server: process.env.REDIS_SERVER
  },
  token: {
    access: process.env.ACCESS_TOKEN_KEY,
    refresh: process.env.REFRESH_TOKEN_KEY,
    age: process.env.ACCESS_TOKEN_AGE
  }
}

module.exports = config
