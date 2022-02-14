import express, { Router } from 'express'
import csurf from 'csurf'

const testMode = process.env.NODE_ENV === 'test'

export default function setupCsfr(): Router {
  const router = express.Router()

  if (!testMode) {
    router.use(csurf())
  }

  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
