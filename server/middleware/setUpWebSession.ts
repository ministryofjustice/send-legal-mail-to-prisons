import { randomUUID } from 'crypto'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import express, { Router } from 'express'
import flash from 'connect-flash'
import { createRedisClient } from '../data/redisClient'
import config from '../config'
import logger from '../../logger'

export default function setUpWebSession(): Router {
  const sessionOptions: session.SessionOptions = {
    cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
    secret: config.session.secret,
    resave: false, // redis implements touch so shouldn't need this
    saveUninitialized: false,
    rolling: true,
  }

  if (config.production) {
    const client = createRedisClient()
    client.connect().catch((err: Error) => logger.error(`Error connecting to Redis`, err))
    sessionOptions.store = new RedisStore({ client })
  }

  const router = express.Router()
  router.use(session(sessionOptions))

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  router.use((req, res, next) => {
    const headerName = 'X-Request-Id'
    const oldValue = req.get(headerName)
    const id = oldValue === undefined ? randomUUID() : oldValue

    res.set(headerName, id)
    req.id = id

    next()
  })

  router.use(flash())

  return router
}
