import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import type { PrisonAddress } from 'prisonTypes'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import ContactService from '../../../services/contacts/ContactService'
import ChooseContactController from './ChooseContactController'
import { Contact } from '../../../@types/sendLegalMailApiClientTypes'

jest.mock('../../../config')

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
  getPrisonAddress: jest.fn(),
}

const contactService = {
  searchContacts: jest.fn(),
}

const aContact = (): Contact => {
  return {
    id: 1,
    prisonerName: 'John Smith',
    prisonId: 'LEI',
  }
}

const aPrisonAddress = (): PrisonAddress => {
  return {
    premise: 'HMP Leeds',
  }
}

describe('ChooseContactController', () => {
  let chooseContactController: ChooseContactController

  beforeEach(() => {
    chooseContactController = new ChooseContactController(
      contactService as unknown as ContactService,
      prisonRegisterService as unknown as PrisonRegisterService
    )
  })

  afterEach(() => {
    prisonRegisterService.getPrisonAddress.mockReset()
    contactService.searchContacts.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
    req.body = {}
  })

  describe('getChooseContact', () => {
    it('should redirect to find recipient if prisoner name form does not exist', async () => {
      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to find recipient if prisoner name not in form', async () => {
      req.session.findRecipientByPrisonerNameForm = {}

      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to find recipient if there are no contacts in session', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith' }

      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prisoner-name')
    })

    it('should redirect to find recipient if the contact list is empty', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [] }

      await chooseContactController.getChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prisoner-name')
    })

    it('should display the view', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [aContact()] }
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
    it('should redirect to find recipient if prisoner name form does not exist', async () => {
      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should redirect to find recipient if there are no contacts to choose from', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith' }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prisoner-name')
    })

    it('should redirect to find recipient if the contact list is empty', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [] }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prisoner-name')
    })

    it('should show errors if contact not selected', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [aContact()] }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#contactOption', text: 'Select an option' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/choose-contact')
    })

    it(`should show error if we can't find the prison address`, async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [aContact()] }
      req.session.chooseContactForm = { contactId: '1' }
      req.session.contactSearchResults = [aContact()]
      prisonRegisterService.getPrisonAddress.mockRejectedValue('some error')

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getPrisonAddress).toHaveBeenCalledWith('LEI')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'There was a problem getting the address for the selected prison. Please try again.' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/choose-contact')
    })

    it('should redirect to create new contact if selected', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [aContact()] }
      req.session.chooseContactForm = { contactId: '-1' }

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    })

    it('should add recipient if existing contact selected', async () => {
      req.session.findRecipientByPrisonerNameForm = { prisonerName: 'John Smith', contacts: [aContact()] }
      req.session.chooseContactForm = { contactId: '1' }
      req.session.contactSearchResults = [aContact()]
      prisonRegisterService.getPrisonAddress.mockReturnValue(aPrisonAddress())

      await chooseContactController.submitChooseContact(req as unknown as Request, res as unknown as Response)

      const recipient = req.session.recipients.find(rec => rec.prisonerName === 'John Smith')

      expect(recipient).toBeTruthy()
      expect(prisonRegisterService.getPrisonAddress).toHaveBeenCalledWith('LEI')
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
      expect(req.session.findRecipientByPrisonerNameForm).toBeUndefined()
      expect(req.session.createNewContactByPrisonerNameForm).toBeUndefined()
    })
  })
})
