import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import CreateContactController from './CreateContactController'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import config from '../../config'
import newContactValidator from './newContactValidator'

jest.mock('../../config')
jest.mock('./newContactValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const prisonRegisterService = {
  getActivePrisons: jest.fn(),
}

describe('CreateContactController', () => {
  let createContactController: CreateContactController

  beforeEach(() => {
    createContactController = new CreateContactController(prisonRegisterService as unknown as PrisonRegisterService)
  })

  afterEach(() => {
    prisonRegisterService.getActivePrisons.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
  })

  describe('getCreateNewRecipientView', () => {
    it('should create and return view given no active prison filtering', async () => {
      config.supportedPrisons = ''
      prisonRegisterService.getActivePrisons.mockResolvedValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.findRecipientForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: req.session.findRecipientForm,
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ACI', text: 'Altcourse (HMP)' },
          { value: 'ASI', text: 'Ashfield (HMP)' },
          { value: 'KTI', text: 'Kennet (HMP)' },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContactView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view given active prison filtering', async () => {
      config.supportedPrisons = 'ASI'
      prisonRegisterService.getActivePrisons.mockResolvedValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])

      req.session.findRecipientForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: req.session.findRecipientForm,
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ASI', text: 'Ashfield (HMP)' },
        ] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContactView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view with error given prison register service fails', async () => {
      prisonRegisterService.getActivePrisons.mockRejectedValue('An error retrieving prison register')

      req.session.findRecipientForm = { prisonNumber: 'A1234BC' }

      const expectedRenderArgs = {
        barcode: undefined as string,
        barcodeImageUrl: undefined as string,
        errors: [] as Array<Record<string, string>>,
        form: req.session.findRecipientForm,
        prisonRegister: [{ value: '', text: '' }] as Array<Record<string, string>>,
      }

      await createContactController.getCreateNewContactView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/create-new-contact', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should redirect to main find-recipient page given no findRecipientForm in the session', async () => {
      req.session.findRecipientForm = undefined

      await createContactController.getCreateNewContactView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })

  describe('submitCreateNewContact', () => {
    let mockNewContactValidator: jest.MockedFunction<typeof newContactValidator>

    beforeEach(() => {
      mockNewContactValidator = newContactValidator as jest.MockedFunction<typeof newContactValidator>
    })

    it('should redirect to review-recipients given new contact is validated', async () => {
      req.session.findRecipientForm = { prisonNumber: 'A1234BC', prisonerName: 'Fred Bloggs', prisonId: 'SKI' }
      mockNewContactValidator.mockReturnValue(true)

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })

    it('should redirect to create-new-contact given new contact is not validated', async () => {
      req.session.findRecipientForm = { prisonNumber: 'A1234BC', prisonerName: '', prisonId: 'SKI' }
      mockNewContactValidator.mockReturnValue(false)

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact')
    })

    it('should redirect to find-recipient given no findRecipientForm in the session', async () => {
      req.session.findRecipientForm = undefined

      await createContactController.submitCreateNewContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })
})
