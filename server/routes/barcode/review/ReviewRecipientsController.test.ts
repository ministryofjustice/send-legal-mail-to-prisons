import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import ReviewRecipientsController from './ReviewRecipientsController'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'

const req = {
  session: {} as SessionData,
  params: {},
  flash: jest.fn(),
  body: {},
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
  prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
}

const prisonRegisterService = {
  getPrison: jest.fn(),
}

describe('ReviewRecipientsController', () => {
  let reviewRecipientsController: ReviewRecipientsController

  beforeEach(() => {
    reviewRecipientsController = new ReviewRecipientsController(
      prisonRegisterService as undefined as PrisonRegisterService
    )
  })

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.params = {}
    req.flash.mockReset()
    prisonRegisterService.getPrison.mockReset()
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

      expect(res.render).toHaveBeenCalledWith('pages/barcode/review-recipients', { errors: [], form: {}, recipients })
      expect(req.session.editContactForm).toBeUndefined()
    })

    it('should pass errors into the form', async () => {
      const recipients = [aRecipient]
      req.session.recipients = recipients
      req.session.editContactForm = anEditContactForm
      req.flash.mockReturnValue([{ href: '#anotherRecipient', text: 'some-error' }])

      await reviewRecipientsController.getReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/review-recipients', {
        errors: [{ href: '#anotherRecipient', text: 'some-error' }],
        form: {},
        recipients,
      })
      expect(req.session.editContactForm).toBeUndefined()
    })

    it('should repopulate recipients in session if at least one has no prison property', async () => {
      const recipientWithOldPrisonAddress = {
        prisonerName: 'John Doe',
        prisonNumber: 'A1234ZZ',
        prisonAddress: { agencyCode: 'DGI', agyDescription: 'Dovegate (HMP)', postalCode: 'ST14 8XR' },
      }
      const recipients = [aRecipient, recipientWithOldPrisonAddress]
      req.session.recipients = recipients

      prisonRegisterService.getPrison.mockResolvedValue({
        id: 'DGI',
        name: 'Dovegate (HMP)',
        addressName: 'HMP Dovegate',
        street: null,
        locality: 'Uttoxeter',
        postalCode: 'ST14 8XR',
      })

      await reviewRecipientsController.getReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getPrison).toHaveBeenCalledWith('DGI')
      expect(req.session.recipients).toEqual([
        aRecipient,
        {
          prisonerName: 'John Doe',
          prisonNumber: 'A1234ZZ',
          prison: {
            id: 'DGI',
            name: 'Dovegate (HMP)',
            addressName: 'HMP Dovegate',
            street: null,
            locality: 'Uttoxeter',
            postalCode: 'ST14 8XR',
          },
        },
      ])
    })
  })

  describe('postReviewRecipientsView', () => {
    it('should redisplay with error if nothing selected', async () => {
      req.session.recipients = [aRecipient]

      await reviewRecipientsController.postReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#anotherRecipient', text: 'Select an option' }])
    })

    it('should redirect to find recipient if selected', async () => {
      req.session.recipients = [aRecipient]
      req.body = { anotherRecipient: 'yes' }

      await reviewRecipientsController.postReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to barcode option if selected', async () => {
      req.session.recipients = [aRecipient]
      req.body = { anotherRecipient: 'no' }

      await reviewRecipientsController.postReviewRecipientsView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
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
        const recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prison: {} }]
        req.session.recipients = recipients
        req.params = { recipientIdx }

        await reviewRecipientsController.removeRecipientByIndex(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
        expect(req.session.recipients).toStrictEqual(recipients)
      })
    })

    it(`should redirect to review-recipients and modify recipients given a recipient index`, async () => {
      const recipients = [
        { prisonerName: 'John Smith', prisonNumber: 'A1234BC', prison: {} },
        { prisonerName: 'Jane Doe', prisonNumber: 'R9876JD', prison: {} },
        { prisonerName: 'Fred Bloggs', prisonNumber: 'D3281FB', prison: {} },
      ]
      req.session.recipients = recipients
      req.params = { recipientIdx: '1' }

      await reviewRecipientsController.removeRecipientByIndex(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(req.session.recipients).toStrictEqual([
        { prisonerName: 'John Smith', prisonNumber: 'A1234BC', prison: {} },
        { prisonerName: 'Fred Bloggs', prisonNumber: 'D3281FB', prison: {} },
      ])
    })
  })
})
