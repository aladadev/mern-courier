require('dotenv').config()
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const { errorResponse } = require('./utils/response')
const { connectDb } = require('./utils/db')
const cors = require('cors')
require('./utils/authenticate')
const passport = require('passport')
const config = require('./utils/config')
const MongoStore = require('connect-mongo')
const session = require('express-session')
const { cookieNames } = require('./utils/constant')
const app = express()
const corsConfig = {
  origin: ['http://localhost:5173'],
  credentials: true,
}

connectDb()
app.use(logger('dev'))
app.use(cors(corsConfig))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(
  session({
    name: cookieNames.session,
    secret: config.secrets.session,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.db.uri,
      crypto: {
        secret: config.secrets.session,
      },
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      domain: config.cookie.domain,
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())

// routes
app.use('/api/users', require('./routes/user.route'))
app.use('/api/parcels', require('./routes/parcel.route'))
app.use('/api/analytics', require('./routes/analytics.route'))
app.use('/api/admin', require('./routes/admin.route'))

// catch 404 and forward to error handler
app.use((err, req, res, next) => {
  console.error(err)
  errorResponse(
    res,
    err.message || 'Unknown Error',
    err?.code || 500,
    err?.status || 'INTERNAL_SERVER_ERROR',
    err?.details
  )
})

module.exports = app
