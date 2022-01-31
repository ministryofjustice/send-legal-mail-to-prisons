import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import CreateContactByPrisonNumberController from './CreateContactByPrisonNumberController'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import config from '../../../config'
import newContactValidator from './newContactByPrisonNumberValidator'
import { PrisonAddress } from '../../../@types/prisonTypes'
import ContactService from '../../../services/contacts/ContactService'

jest.mock('../../../config')
jest.mock('./newContactByPrisonNumberValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const prisonRegisterService = {
  getActivePrisons: jest.fn(),
  getPrisonAddress: jest.fn(),
}

const contactService = {
  createContact: jest.fn(),
}

describe('CreateContactByPrisonNumberController', () => {
  let createContactController: CreateContactByPrisonNumberController

  beforeEach(() => {
    createContactController = new CreateContactByPrisonNumberController(
      prisonRegisterService as unknown as PrisonRegisterService,
      contactService as unknown as ContactService
    )
  })

  afterEach(() => {
    prisonRegisterService.getActivePrisons.mockReset()
    prisonRegisterService.getPrisonAddress.mockReset()
    contactService.createContact.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
  })

  describe('getCreateNewRecipientView', () => {
    it('should redirect to find recipient if prison number form does not exist', async () => {
      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to find recipient if prison number not in form', async () => {
      req.session.findRecipientByPrisonNumberForm = {}

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should create and return view given no active prison filtering', async () => {
      config.supportedPrisons = ''
      // TODO reinstate mockResolvedValue when we switch back to Prison Register - see PrisonRegisterService#getActivePrisons
      prisonRegisterService.getActivePrisons.mockReturnValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.findRecipientByPrisonNumberForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: req.session.findRecipientByPrisonNumberForm,
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
      // TODO reinstate mockResolvedValue when we switch back to Prison Register - see PrisonRegisterService#getActivePrisons
      prisonRegisterService.getActivePrisons.mockReturnValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.findRecipientByPrisonNumberForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: req.session.findRecipientByPrisonNumberForm,
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ASI', text: 'Ashfield (HMP)', selected: false },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prison-number', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    // TODO Reinstate this test when we switch back to using Prison Register - see PrisonRegisterService#getActivePrisons
    it.skip('should create and return view with error given prison register service fails', async () => {
      prisonRegisterService.getActivePrisons.mockRejectedValue('An error retrieving prison register')

      req.session.findRecipientByPrisonNumberForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: req.session.findRecipientByPrisonNumberForm,
        prisonRegister: [{ value: '', text: '' }] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact-by-prison-number', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should redirect to main find-recipient page given no findRecipientForm in the session', async () => {
      req.session.findRecipientByPrisonNumberForm = undefined

      await createContactController.getCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })

  describe('submitCreateNewContact', () => {
    let mockNewContactValidator: jest.MockedFunction<typeof newContactValidator>

    beforeEach(() => {
      mockNewContactValidator = newContactValidator as jest.MockedFunction<typeof newContactValidator>
    })

    it('should redirect to review-recipients given new contact is validated and prison address is resolved', async () => {
      req.body = {
        prisonNumber: 'A1234BC',
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      }
      req.session.findRecipientByPrisonNumberForm = { ...req.body }
      req.session.slmToken = 'some-token'
      mockNewContactValidator.mockReturnValue([])
      const prisonAddress: PrisonAddress = {
        agencyCode: 'CKI',
        agyDescription: 'Cookham Wood (YOI)',
        flat: null,
        premise: 'HMP COOKHAM WOOD',
        street: null,
        locality: null,
        countyCode: 'KENT',
        area: 'Rochester Kent',
        postalCode: 'ME1 3LU',
      }
      prisonRegisterService.getPrisonAddress.mockResolvedValue(prisonAddress)
      const expectedRecipients = [{ prisonAddress, prisonNumber: 'A1234BC', prisonerName: 'Fred Bloggs' }]

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(req.session.recipients).toStrictEqual(expectedRecipients)
      expect(req.session.findRecipientByPrisonNumberForm).toBeUndefined()
      expect(req.session.createNewContactByPrisonNumberForm).toBeUndefined()
      expect(contactService.createContact).toHaveBeenCalledWith('some-token', 'Fred Bloggs', 'SKI', 'A1234BC')
    })

    it('should redirect to create-new-contact given new contact is validated but prison address is not resolved', async () => {
      req.body = {
        prisonNumber: 'A1234BC',
        prisonerName: 'Fred Bloggs',
        prisonId: 'SKI',
      }
      req.session.findRecipientByPrisonNumberForm = { ...req.body }
      mockNewContactValidator.mockReturnValue([])
      prisonRegisterService.getPrisonAddress.mockRejectedValue(new Error(`PrisonAddress for prison SKI not found`))

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: 'prisonId', text: 'There was a problem getting the address for the selected prison' },
      ])
    })

    it('should redirect to create-new-contact given new contact is not validated', async () => {
      req.body = { prisonNumber: 'A1234BC', prisonerName: '', prisonId: 'SKI' }
      req.session.findRecipientByPrisonNumberForm = { ...req.body }
      mockNewContactValidator.mockReturnValue([{ href: '#prisonId', text: 'Select a prison name' }])

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'Select a prison name' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
    })

    it('should redirect to find-recipient given no findRecipientForm in the session', async () => {
      req.session.findRecipientByPrisonNumberForm = undefined

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })
})
