import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import config from '../../../config'
import newContactValidator from './newContactByPrisonerNameValidator'
import CreateContactByPrisonerNameController from './CreateContactByPrisonerNameController'
import ContactService from '../../../services/contacts/ContactService'
import RecipientFormService from '../recipients/RecipientFormService'
import PrisonService from '../../../services/prison/PrisonService'

jest.mock('../../../config')
jest.mock('./newContactByPrisonerNameValidator')

const req = {
  session: { barcodeUser: { token: 'some-token' } } as SessionData,
  flash: jest.fn(),
  body: {},
  ip: '127.0.0.1',
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const prisonService = {
  getPrisons: jest.fn(),
}

const contactService = {
  createContact: jest.fn(),
}

const recipientFormService = {
  requiresName: jest.fn(),
  addRecipient: jest.fn(),
}

describe('CreateContactByPrisonerNameController', () => {
  let createContactController: CreateContactByPrisonerNameController

  beforeEach(() => {
    createContactController = new CreateContactByPrisonerNameController(
      prisonService as unknown as PrisonService,
      contactService as unknown as ContactService,
      recipientFormService as unknown as RecipientFormService
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
    req.session = { barcodeUser: { token: 'some-token' } } as SessionData
    req.body = {}
  })

  describe('getCreateNewRecipientView', () => {
    it('should redirect if requires name', async () => {
      recipientFormService.requiresName.mockReturnValue('some-redirect')

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it('should create and return view given no active prison filtering', async () => {
      config.supportedPrisons = ''
      prisonService.getPrisons.mockResolvedValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.recipientForm = { prisonerName: 'John Smith' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: { prisonerName: 'John Smith' },
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ACI', text: 'Altcourse (HMP)', selected: false },
          { value: 'ASI', text: 'Ashfield (HMP)', selected: false },
          { value: 'KTI', text: 'Kennet (HMP)', selected: false },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prisoner-name', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view given active prison filtering', async () => {
      config.supportedPrisons = 'ASI'
      prisonService.getPrisons.mockResolvedValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.recipientForm = { prisonerName: 'John Smith' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: { prisonerName: 'John Smith' },
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ASI', text: 'Ashfield (HMP)', selected: false },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prisoner-name', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view with error given prison register service fails', async () => {
      prisonService.getPrisons.mockRejectedValue('An error retrieving prison register')

      req.session.recipientForm = { prisonerName: 'John Smith' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: { prisonerName: 'John Smith' },
        prisonRegister: [{ value: '', text: '' }] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prisoner-name', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      expect(req.flash).toHaveBeenCalledWith('errors')
    })
  })

  describe('submitCreateNewContact', () => {
    let mockNewContactValidator: jest.MockedFunction<typeof newContactValidator>

    beforeEach(() => {
      mockNewContactValidator = newContactValidator as jest.MockedFunction<typeof newContactValidator>
    })

    it('should redirect to review-recipients given new contact is valid', async () => {
      req.body = {
        prisonerDob: undefined,
        'prisonerDob-day': '1',
        'prisonerDob-month': '1',
        'prisonerDob-year': '1990',
        prisonId: 'SKI',
      }
      req.session.recipientForm = { prisonerName: 'Fred Bloggs' }
      req.session.barcodeUser.token = 'some-token'
      mockNewContactValidator.mockReturnValue([])

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(recipientFormService.addRecipient).toHaveBeenCalledWith(expect.anything())
      expect(req.session.createNewContactByPrisonerNameForm).toBeUndefined()
      expect(req.session.recipientForm).toEqual({
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
        prisonerDob: moment('1990-01-01', 'YYYY-MM-DD').toDate(),
      })
      expect(contactService.createContact).toHaveBeenCalledWith(
        'some-token',
        '127.0.0.1',
        'Fred Bloggs',
        'SKI',
        undefined,
        moment('1990-01-01').toDate()
      )
    })

    it('should redirect to create-new-contact if there is an error adding the recipient', async () => {
      req.body = {
        prisonerSob: '01-01-1990',
        prisonId: 'SKI',
      }
      req.session.recipientForm = { prisonerName: 'Fred Bloggs' }
      mockNewContactValidator.mockReturnValue([])
      recipientFormService.addRecipient.mockRejectedValue('some-error')

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#prisonId', text: 'There was a problem adding your new recipient. Please try again.' },
      ])
    })

    it('should redirect to create-new-contact given new contact is invalid', async () => {
      req.body = { prisonerDob: '01-01-1990', prisonId: '' }
      req.session.recipientForm = { prisonerName: 'John Smith' }
      mockNewContactValidator.mockReturnValue([{ href: '#prisonId', text: 'Select a prison name' }])

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'Select a prison name' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    })

    it('should redirect if requires name', async () => {
      recipientFormService.requiresName.mockReturnValue('some-redirect')

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it("should ignore if we couldn't create the contact for any reason", async () => {
      req.body = {
        prisonerDob: undefined,
        'prisonerDob-day': '1',
        'prisonerDob-month': '1',
        'prisonerDob-year': '1990',
        prisonId: 'SKI',
      }
      req.session.recipientForm = { prisonerName: 'Fred Bloggs' }
      req.session.barcodeUser.token = 'some-token'
      mockNewContactValidator.mockReturnValue([])
      contactService.createContact.mockRejectedValue('some-error')

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(recipientFormService.addRecipient).toHaveBeenCalledWith(expect.anything())
      expect(req.session.createNewContactByPrisonerNameForm).toBeUndefined()
      expect(contactService.createContact).toHaveBeenCalledWith(
        'some-token',
        '127.0.0.1',
        'Fred Bloggs',
        'SKI',
        undefined,
        moment('1990-01-01').toDate()
      )
    })
  })
})
