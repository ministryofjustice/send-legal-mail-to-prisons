import { jwtDecode } from 'jwt-decode'
import { RequestHandler } from 'express'

import logger from '../../../logger'

export default function contactHelpdeskAuthorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return (req, res, next) => {
    if (!res.locals.user?.token) {
      logger.error(`User is not authenticated, cannot access ${req.originalUrl}. Redirect to authError`)
      return res.redirect('/authError')
    }

    const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }

    if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
      logger.error(`User is not authorised to access ${req.originalUrl}. Redirect to authError`)
      return res.redirect('/authError')
    }

    return next()
  }
}
