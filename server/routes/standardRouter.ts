import { Router } from 'express'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'
import type UserService from '../services/userService'
import populateCurrentUserRoles from '../middleware/populateCurrentUserRoles'
import SmokeTestStore from '../data/cache/SmokeTestStore'
import PrisonService from '../services/prison/PrisonService'

export default function standardRouter(
  userService: UserService,
  smokeTestStore: SmokeTestStore,
  prisonService: PrisonService
): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier, smokeTestStore))
  router.use(populateCurrentUser(userService, prisonService))
  router.use(populateCurrentUserRoles())

  return router
}
