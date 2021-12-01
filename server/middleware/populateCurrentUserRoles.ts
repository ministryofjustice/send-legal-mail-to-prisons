import { RequestHandler } from 'express'
import jwtDecode from 'jwt-decode'

export default function populateCurrentUserRoles(): RequestHandler {
  return async (req, res, next) => {
    if (res.locals.user?.token) {
      const { authorities: roles } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
      res.locals.user = { roles, ...res.locals.user }
    }
    next()
  }
}
