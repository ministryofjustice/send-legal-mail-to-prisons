import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
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

const anEditContactForm = {
  contactId: 1,
  prisonerName: 'some-name',
  prisonId: 'KTI',
  prisonNumber: 'some-prison-number',
  dob: moment('1990-01-19', 'YYYY-MM-DD').toDate(),
  'dob-day': '19',
  'dob-month': '1',
  'dob-year': '1990',
}
const aRecipient = {
  prisonerName: 'John Smith',
  prisonNumber: 'A1234BC',
  prisonAddress: { premise: 'HMP Somewhere', postalCode: 'AA1 1AA' },
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

    it('should render page having cleared editContactForm', async () => {
      const recipients = [aRecipient]
      req.session.recipients = recipients
      req.session.editContactForm = anEditContactForm

      await reviewRecipientsController.getReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/review-recipients', { errors: [], recipients })
      expect(req.session.editContactForm).toBeUndefined()
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
