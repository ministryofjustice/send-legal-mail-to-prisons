import express, { Response, Router } from 'express'
import helmet from 'helmet'
import crypto from 'crypto'
import { IncomingMessage } from 'http'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  router.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
    next()
  })

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'strict-dynamic'",
            (req: IncomingMessage, res: Response) => `'nonce-${res.locals.cspNonce}'`,
            "'unsafe-inline'",
            'https:',
          ],
          connectSrc: ["'self'", '*.googletagmanager.com', '*.google-analytics.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          frameSrc: ['*.googletagmanager.com'],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'self'"],
        },
      },
    })
  )
  return router
}
