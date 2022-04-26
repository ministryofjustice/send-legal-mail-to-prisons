import { RequestHandler } from 'express'
import createError from 'http-errors'

export default function handleSlm404Errors(): RequestHandler {
  return (req, res, next) => {
    if (res.locals.externalUser) {
      // Default route on the SLM domain resolved *after* all other SLM routes - handle with a 404
      next(createError(404, 'Not found'))
    } else {
      // Default route on the CR39 domain resolved *before* all other CR39 routes - handle via the next function which may prompt for authentication and resolve to another route
      next()
    }
  }
}
