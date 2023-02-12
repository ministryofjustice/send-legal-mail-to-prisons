import session from 'express-session'
import connectRedis, { Client } from 'connect-redis'
import addRequestId from 'express-request-id'
import express, { Router } from 'express'
import flash from 'connect-flash'

import config from '../config'
import { createRedisClient } from '../data/cache/redisClient'
import logger from '../../logger'

const RedisStore = connectRedis(session)

export default function setUpWebSession(): Router {
  const client = createRedisClient({ legacyMode: true })
  client.connect().catch((err: Error) => logger.error(`Error connecting to Redis`, err))
  const router = express.Router()

  router.use(
    session({
      store: new RedisStore({ client: client as unknown as Client }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    })
  )

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  router.use(addRequestId())
  router.use(flash())

  return router
}
