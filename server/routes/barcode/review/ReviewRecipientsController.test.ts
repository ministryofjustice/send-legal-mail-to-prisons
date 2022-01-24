import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import ReviewRecipientsController from './ReviewRecipientsController'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

describe('ReviewRecipientsController', () => {
  let reviewRecipientsController: ReviewRecipientsController

  beforeEach(() => {
    reviewRecipientsController = new ReviewRecipientsController()
  })

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
  })

  it('should redirect to find-recipient given no recipients in the session', async () => {
    req.session.recipients = undefined

    await reviewRecipientsController.getReviewRecipientsView(req as unknown as Request, res as unknown as Response)

    expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
  })
})
