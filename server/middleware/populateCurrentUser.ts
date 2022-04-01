import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import config from '../config'
import PrisonRegisterService from '../services/prison/PrisonRegisterService'

export default function populateCurrentUser(
  userService: UserService,
  prisonRegisterService: PrisonRegisterService
): RequestHandler {
  return async (req, res, next) => {
    try {
      if (config.smoketest.msjSecret && req.session?.msjSmokeTestUser) {
        return next()
      }
      if (res.locals.user) {
        const user = res.locals.user && (await userService.getUser(res.locals.user.token))
        if (user) {
          res.locals.user = { ...user, ...res.locals.user }
          res.locals.user.prisonName = prisonRegisterService.getPrisonNameOrId(res.locals.user.activeCaseLoadId)
        } else {
          logger.info('No user available')
        }
      }
      return next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      return next(error)
    }
  }
}
