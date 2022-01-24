import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import ReviewRecipientsController from './ReviewRecipientsController'

const req = {
  session: {} as SessionData,
  params: {},
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
    req.params = {}
    req.flash.mockReset()
  })

  describe('getReviewRecipientsView', () => {
    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await reviewRecipientsController.getReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })

  describe('removeRecipientByIndex', () => {
    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await reviewRecipientsController.removeRecipientByIndex(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    Array.of('not a number', null, undefined, '-1', '2').forEach(recipientIdx => {
      it(`should redirect to review-recipients without modifying recipients given an invalid recipient index - ${recipientIdx}`, async () => {
        const recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
        req.session.recipients = recipients
        req.params = { recipientIdx }

        await reviewRecipientsController.removeRecipientByIndex(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
        expect(req.session.recipients).toStrictEqual(recipients)
      })
    })

    it(`should redirect to review-recipients and modify recipients given a recipient index`, async () => {
      const recipients = [
        { prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} },
        { prisonerName: 'Jane Doe', prisonNumber: 'R9876JD', prisonAddress: {} },
        { prisonerName: 'Fred Bloggs', prisonNumber: 'D3281FB', prisonAddress: {} },
      ]
      req.session.recipients = recipients
      req.params = { recipientIdx: '1' }

      await reviewRecipientsController.removeRecipientByIndex(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(req.session.recipients).toStrictEqual([
        { prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} },
        { prisonerName: 'Fred Bloggs', prisonNumber: 'D3281FB', prisonAddress: {} },
      ])
    })
  })
})
