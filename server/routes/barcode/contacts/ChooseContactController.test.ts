import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import type { Contact } from 'sendLegalMailApiClient'
import ChooseContactController from './ChooseContactController'
import RecipientFormService from '../recipients/RecipientFormService'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const contactService = {
  searchContacts: jest.fn(),
}

const recipientFormService = {
  requiresName: jest.fn(),
  requiresContacts: jest.fn(),
  addContact: jest.fn(),
}

const aContact = (): Contact => {
  return {
    id: 1,
    prisonerName: 'John Smith',
    prisonId: 'LEI',
  }
}

describe('ChooseContactController', () => {
  let chooseContactController: ChooseContactController

  beforeEach(() => {
    chooseContactController = new ChooseContactController(recipientFormService as unknown as RecipientFormService)
  })

  afterEach(() => {
    recipientFormService.requiresName.mockReset()
    recipientFormService.requiresContacts.mockReset()
    recipientFormService.addContact.mockReset()
    contactService.searchContacts.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
    req.body = {}
  })

  describe('getChooseContact', () => {
    it('should redirect if requires name', async () => {
      recipientFormService.requiresName.mockReturnValue('some-redirect')

      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it('should redirect if requires contacts', async () => {
      recipientFormService.requiresContacts.mockReturnValue('some-redirect')

      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it('should display the view', async () => {
      req.session.recipientForm = { prisonerName: 'John Smith', searchName: 'John Smith', contacts: [aContact()] }
      const expectedRenderArgs = {
        form: {},
        searchName: 'John Smith',
        contacts: [aContact()],
        errors: [] as Array<Record<string, string>>,
      }

      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/choose-contact', expectedRenderArgs)
    })
  })

  describe('submitChooseContact', () => {
    it('should redirect if requires name', async () => {
      recipientFormService.requiresName.mockReturnValue('some-redirect')

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it('should redirect if requires contacts', async () => {
      recipientFormService.requiresContacts.mockReturnValue('some-redirect')

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('some-redirect')
    })

    it('should show errors if contact not selected', async () => {
      req.session.recipientForm = { prisonerName: 'John Smith', contacts: [aContact()] }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#contactOption', text: 'Select an option' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/choose-contact')
    })

    it(`should show error from adding the contact`, async () => {
      req.session.recipientForm = { prisonerName: 'John Smith', contacts: [aContact()] }
      req.body = { contactId: '1' }
      recipientFormService.addContact.mockRejectedValue('some-error')

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(recipientFormService.addContact).toHaveBeenCalledWith(expect.anything(), aContact())
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'There was a problem adding your contact. Please try again.' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/choose-contact')
    })

    it('should redirect to create new contact if selected', async () => {
      req.session.recipientForm = { prisonerName: 'John Smith', contacts: [aContact()] }
      req.body = { contactId: '-1' }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    })

    it('should add recipient if existing contact selected', async () => {
      req.session.recipientForm = { prisonerName: 'John Smith', contacts: [aContact()] }
      req.body = { contactId: '1' }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(recipientFormService.addContact).toHaveBeenCalledWith(expect.anything(), aContact())
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(req.session.chooseContactForm).toBeUndefined()
    })
  })
})
