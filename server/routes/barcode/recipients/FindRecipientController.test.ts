import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import type { Contact } from 'sendLegalMailApiClient'
import FindRecipientController from './FindRecipientController'
import prisonNumberValidator from '../validators/prisonNumberValidator'
import prisonerNameValidator from '../validators/prisonerNameValidator'
import RecipientFormService from './RecipientFormService'
import ContactService from '../../../services/contacts/ContactService'

jest.mock('../validators/prisonNumberValidator')
jest.mock('../validators/prisonerNameValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
  ip: '127.0.0.1',
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const recipientFormService = {
  resetForm: jest.fn(),
  addContact: jest.fn(),
}

const contactService = {
  searchContacts: jest.fn(),
  getContactByPrisonNumber: jest.fn(),
}

const aContact = (): Contact => {
  return {
    id: 1,
    prisonerName: 'John Smith',
    prisonId: 'LEI',
    prisonNumber: 'A1234BC',
  }
}

describe('FindRecipientController', () => {
  const findRecipientController = new FindRecipientController(
    recipientFormService as unknown as RecipientFormService,
    contactService as unknown as ContactService
  )

  afterEach(() => {
    recipientFormService.resetForm.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
  })

  describe('submitFindByPrisonNumber', () => {
    let mockPrisonNumberValidator: jest.MockedFunction<typeof prisonNumberValidator>

    beforeEach(() => {
      mockPrisonNumberValidator = prisonNumberValidator as jest.MockedFunction<typeof prisonNumberValidator>
    })

    it('should show errors given prison number is invalid', async () => {
      req.body = { prisonNumber: 'A1234BC' }
      req.session.recipientForm = {}
      mockPrisonNumberValidator.mockReturnValue(['some-error'])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonNumber', text: 'some-error' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prison-number')
    })

    it('should redirect to create-new-contact if no contact found', async () => {
      req.session.recipientForm = {}
      req.body = { prisonNumber: 'A1234BC' }
      req.session.slmToken = 'some-token'
      mockPrisonNumberValidator.mockReturnValue([])
      contactService.getContactByPrisonNumber.mockReturnValue(undefined)

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(contactService.getContactByPrisonNumber).toHaveBeenCalledWith('some-token', '127.0.0.1', 'A1234BC')
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
    })

    it('should redirect to review-recipients if contact is found', async () => {
      req.session.recipientForm = {}
      req.body = { prisonNumber: 'A1234BC' }
      mockPrisonNumberValidator.mockReturnValue([])
      contactService.getContactByPrisonNumber.mockReturnValue(aContact())

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(recipientFormService.addContact).toHaveBeenCalledWith(expect.anything(), aContact())
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })

    it('should redirect to create contact if get contact errors', async () => {
      req.session.recipientForm = {}
      req.body = { prisonNumber: 'A1234BC' }
      mockPrisonNumberValidator.mockReturnValue([])
      contactService.getContactByPrisonNumber.mockRejectedValue('some-error')

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'There was a problem searching your saved contacts - please create again.' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
    })

    it('should uppercase and trim the prison number', async () => {
      req.session.recipientForm = {}
      req.body = { prisonNumber: ' a1234bc ' }
      mockPrisonNumberValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.session.recipientForm.prisonNumber).toEqual('A1234BC')
    })
  })

  describe('submitFindByPrisonerName', () => {
    let mockPrisonerNameValidator: jest.MockedFunction<typeof prisonerNameValidator>

    beforeEach(() => {
      mockPrisonerNameValidator = prisonerNameValidator as jest.MockedFunction<typeof prisonerNameValidator>
    })

    it('should show errors given prisoner name is invalid', async () => {
      req.session.recipientForm = {}
      req.body = { prisonerName: '' }
      mockPrisonerNameValidator.mockReturnValue(['some-error'])

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonerName', text: 'some-error' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prisoner-name')
    })

    it('should redirect to create-new-contact if no contacts found', async () => {
      req.session.recipientForm = {}
      req.body = { prisonerName: 'John Smith' }
      mockPrisonerNameValidator.mockReturnValue([])
      contactService.searchContacts.mockReturnValue([])

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    })

    it('should redirect to choose contact if some contacts found', async () => {
      req.session.recipientForm = {}
      req.body = { prisonerName: 'John Smith' }
      mockPrisonerNameValidator.mockReturnValue([])
      contactService.searchContacts.mockReturnValue([aContact()])

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/choose-contact')
      expect(req.session.recipientForm.contacts).toEqual([aContact()])
      expect(req.session.recipientForm.prisonerName).toEqual('John Smith')
      expect(req.session.recipientForm.searchName).toEqual('John Smith')
    })

    it('should redirect to create contact if contact search errors', async () => {
      req.session.recipientForm = {}
      req.body = { prisonerName: 'John Smith' }
      mockPrisonerNameValidator.mockReturnValue([])
      contactService.searchContacts.mockRejectedValue('some-error')

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'There was a problem searching your saved contacts - please create again.' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
      expect(req.session.recipientForm.contacts).toBeUndefined()
    })

    it('should trim the prisoner name', async () => {
      req.session.recipientForm = {}
      req.body = { prisonerName: ' John Smith ' }
      mockPrisonerNameValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(req.session.recipientForm.prisonerName).toEqual('John Smith')
    })
  })
})
