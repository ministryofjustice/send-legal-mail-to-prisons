import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import CreateContactByPrisonNumberController from './CreateContactByPrisonNumberController'
import config from '../../../config'
import newContactValidator from './newContactByPrisonNumberValidator'
import ContactService from '../../../services/contacts/ContactService'
import RecipientFormService from '../recipients/RecipientFormService'
import PrisonService from '../../../services/prison/PrisonService'

jest.mock('../../../config')
jest.mock('./newContactByPrisonNumberValidator')

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
  requiresPrisonNumber: jest.fn(),
  addRecipient: jest.fn(),
}

describe('CreateContactByPrisonNumberController', () => {
  let createContactController: CreateContactByPrisonNumberController

  beforeEach(() => {
    createContactController = new CreateContactByPrisonNumberController(
      prisonService as unknown as PrisonService,
      contactService as unknown as ContactService,
      recipientFormService as unknown as RecipientFormService
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
    req.session = { barcodeUser: { token: 'some-token' } } as SessionData
  })

  describe('getCreateNewRecipientView', () => {
    it('should redirect if requires prison number', async () => {
      recipientFormService.requiresPrisonNumber.mockReturnValue('some-redirect')

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

      req.session.recipientForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: { prisonNumber: 'A1234BC' },
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ACI', text: 'Altcourse (HMP)', selected: false },
          { value: 'ASI', text: 'Ashfield (HMP)', selected: false },
          { value: 'KTI', text: 'Kennet (HMP)', selected: false },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prison-number', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view given active prison filtering', async () => {
      config.supportedPrisons = 'ASI'
      prisonService.getPrisons.mockResolvedValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.recipientForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: { prisonNumber: 'A1234BC' },
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ASI', text: 'Ashfield (HMP)', selected: false },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prison-number', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view with error given prison register service fails', async () => {
      prisonService.getPrisons.mockRejectedValue('An error retrieving prison register')

      req.session.recipientForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: { prisonNumber: 'A1234BC' },
        prisonRegister: [{ value: '', text: '' }] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prison-number', expectedRenderArgs)
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
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      }
      req.session.recipientForm = { prisonNumber: 'A1234BC' }
      req.session.barcodeUser.token = 'some-token'
      mockNewContactValidator.mockReturnValue([])

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(recipientFormService.addRecipient).toHaveBeenCalledWith(expect.anything())
      expect(req.session.createNewContactByPrisonNumberForm).toBeUndefined()
      expect(req.session.recipientForm).toEqual({
        prisonNumber: 'A1234BC',
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      })
      expect(contactService.createContact).toHaveBeenCalledWith(
        'some-token',
        '127.0.0.1',
        'Fred Bloggs',
        'SKI',
        'A1234BC'
      )
    })

    it('should redirect to create-new-contact if there is an error adding the recipient', async () => {
      req.body = {
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      }
      req.session.recipientForm = { prisonNumber: 'A1234BC' }
      mockNewContactValidator.mockReturnValue([])
      recipientFormService.addRecipient.mockRejectedValue('some-error')

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: 'prisonId', text: 'There was a problem adding your new recipient. Please try again.' },
      ])
    })

    it('should redirect if requires prison number', async () => {
      recipientFormService.requiresPrisonNumber.mockReturnValue('some-redirect')

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it('should redirect to review-recipients given new contact is valid', async () => {
      req.body = {
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      }
      req.session.recipientForm = { prisonNumber: 'A1234BC' }
      req.session.barcodeUser.token = 'some-token'
      mockNewContactValidator.mockReturnValue([])
      contactService.createContact.mockRejectedValue('some-error')

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(recipientFormService.addRecipient).toHaveBeenCalledWith(expect.anything())
      expect(req.session.createNewContactByPrisonNumberForm).toBeUndefined()
      expect(req.session.recipientForm).toEqual({
        prisonNumber: 'A1234BC',
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      })
      expect(contactService.createContact).toHaveBeenCalledWith(
        'some-token',
        '127.0.0.1',
        'Fred Bloggs',
        'SKI',
        'A1234BC'
      )
    })
  })
})
