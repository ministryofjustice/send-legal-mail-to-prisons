// eslint-disable-next-line max-classes-per-file
import express, { Express, Request, Router } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'

import allRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import UserService from '../../services/userService'
import * as auth from '../../authentication/auth'
import SmokeTestStore from '../../data/cache/SmokeTestStore'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'
import PrisonService from '../../services/prison/PrisonService'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import SupportedPrisonsService from '../../services/prison/SupportedPrisonsService'

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
  activeCaseLoadId: 'BXI',
}

class MockUserService extends UserService {
  constructor() {
    super(undefined)
  }

  async getUser(token: string) {
    return {
      token,
      ...user,
    }
  }
}

jest.mock('redis', () => jest.requireActual('redis-mock'))

class MockSmokeTestStore extends SmokeTestStore {
  async getSmokeTestSecret(): Promise<string> {
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async startSmokeTest(req: Request): Promise<string> {
    return ''
  }
}

class MockPrisonerRegister extends PrisonRegisterService {
  async getPrisonNameOrId(prisonId: string): Promise<string> {
    return prisonId
  }
}

class MockPrisonRegisterStore extends PrisonRegisterStore {}

class MockSupportedPrisonsService extends SupportedPrisonsService {}

class MockPrisonService extends PrisonService {}

function appSetup(route: Router, production: boolean): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)

  app.use((req, res, next) => {
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export default function appWithAllRoutes({ production = false }: { production?: boolean }): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => {
    res.locals.user = {
      token: createToken(),
    }
    next()
  }
  return appSetup(
    allRoutes(
      standardRouter(
        new MockUserService(),
        new MockSmokeTestStore(),
        new MockPrisonService(
          new MockPrisonerRegister(new MockPrisonRegisterStore()),
          new MockSupportedPrisonsService()
        )
      )
    ),
    production
  )
}

const createToken = () => {
  const payload = {
    user_name: 'user1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities: ['ROLE_SLM_SCAN_BARCODE'],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}
