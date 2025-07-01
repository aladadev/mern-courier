const config = {
  db: {
    uri: process.env.MONGO_URI,
  },
  origin: {
    server: process.env.SERVER,
    client: process.env.CLIENT,
    allowedClients: ['http://localhost:5173'],
  },
  secrets: {
    jwt: process.env.JWT_SECRET,
    session: process.env.SESSION_SECRET,
    jwtRefresh: process.env.JWT_REFRESH_SECRET,
  },
  cookie: {
    domain: '',
  },
}

module.exports = config
