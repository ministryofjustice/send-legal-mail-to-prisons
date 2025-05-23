import { Request, Response } from 'express'
import type { SessionData } from 'express-session'
import OneTimeCodeEmailSentController from './OneTimeCodeEmailSentController'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

describe('OneTimeCodeEmailSentController', () => {
  const oneTimeCodeEmailSentController = new OneTimeCodeEmailSentController()

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getOneTimeCodeEmailSentView', () => {
    it('should render email sent page', async () => {
      req.session.requestOneTimeCodeForm = { email: 'someone@aardvark.cjsm.net' }

      await oneTimeCodeEmailSentController.getOneTimeCodeEmailSentView(
        req as undefined as Request,
        res as undefined as Response,
      )

      expect(res.render).toHaveBeenCalledWith('pages/one-time-code-auth/emailSent', {
        emailSentTo: 'someone@aardvark.cjsm.net',
        errors: [],
      })
    })

    it('should redirect to request code page given user has not come from request code in the first place', async () => {
      req.session.requestOneTimeCodeForm = undefined

      await oneTimeCodeEmailSentController.getOneTimeCodeEmailSentView(
        req as undefined as Request,
        res as undefined as Response,
      )

      expect(res.redirect).toHaveBeenCalledWith('request-code')
    })
  })
})
