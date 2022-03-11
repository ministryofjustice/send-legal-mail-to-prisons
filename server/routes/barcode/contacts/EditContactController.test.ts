import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import EditContactController from './EditContactController'
import ContactService from '../../../services/contacts/ContactService'
import RecipientFormService from '../recipients/RecipientFormService'
import validateContact from './updateContactValidator'

jest.mock('./updateContactValidator')

const req = {
  session: { editContactForm: undefined, slmToken: 'some-token' } as SessionData,
  flash: jest.fn(),
  body: {},
  params: { contactId: 1 },
  ip: '127.0.0.1',
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const prisonRegisterService = {
  getActivePrisons: jest.fn(),
}

const contactService = {
  getContactById: jest.fn(),
  updateContact: jest.fn(),
}

const recipientService = {
  addContact: jest.fn(),
  updateContact: jest.fn(),
}

const aContact = {
  id: 1,
  prisonerName: 'some-name',
  prisonId: 'KTI',
  dob: '1990-01-19',
  prisonNumber: 'some-prison-number',
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

describe('EditContactController', () => {
  let editContactController: EditContactController

  beforeEach(() => {
    editContactController = new EditContactController(
      prisonRegisterService as unknown as PrisonRegisterService,
      contactService as unknown as ContactService,
      recipientService as unknown as RecipientFormService
    )
  })

  afterEach(() => {
    prisonRegisterService.getActivePrisons.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = { editContactForm: undefined, slmToken: 'some-token' } as SessionData
    req.flash.mockReset()
    req.params = { contactId: 1 }
  })

  describe('getEditContact', () => {
    beforeEach(() => {
      contactService.getContactById.mockReset()
      recipientService.addContact.mockReset()
    })

    it('should render contact details', async () => {
      prisonRegisterService.getActivePrisons.mockReturnValue([{ id: 'KTI', name: 'Kennet (HMP)' }])
      contactService.getContactById.mockReturnValue(aContact)

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getActivePrisons).toHaveBeenCalled()
      expect(contactService.getContactById).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/barcode/edit-contact-details', {
        errors: [],
        form: {
          contactId: 1,
          prisonerName: 'some-name',
          prisonId: 'KTI',
          prisonNumber: 'some-prison-number',
          dob: moment('1990-01-19', 'YYYY-MM-DD').toDate(),
          'dob-day': '19',
          'dob-month': '1',
          'dob-year': '1990',
        },
        prisonRegister: [
          { text: '', value: '' },
          { text: 'Kennet (HMP)', value: 'KTI', selected: true },
        ],
      })
    })

    it('should render contact details while editing', async () => {
      prisonRegisterService.getActivePrisons.mockReturnValue([{ id: 'KTI', name: 'Kennet (HMP)' }])
      req.session.editContactForm = anEditContactForm
      req.body['dob-day'] = '19'
      req.body['dob-month'] = '1'
      req.body['dob-year'] = '1990'

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getActivePrisons).toHaveBeenCalled()
      expect(contactService.getContactById).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/barcode/edit-contact-details', {
        errors: [],
        form: {
          contactId: 1,
          prisonerName: 'some-name',
          prisonId: 'KTI',
          prisonNumber: 'some-prison-number',
          dob: moment('1990-01-19', 'YYYY-MM-DD').toDate(),
          'dob-day': '19',
          'dob-month': '1',
          'dob-year': '1990',
        },
        prisonRegister: [
          { text: '', value: '' },
          { text: 'Kennet (HMP)', value: 'KTI', selected: true },
        ],
      })
    })

    it('should not select prison', async () => {
      prisonRegisterService.getActivePrisons.mockReturnValue([{ id: 'KTI', name: 'Kennet (HMP)' }])
      contactService.getContactById.mockReturnValue({ ...aContact, prisonId: '' })

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getActivePrisons).toHaveBeenCalled()
      expect(contactService.getContactById).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          prisonRegister: [
            { text: '', value: '' },
            { text: 'Kennet (HMP)', value: 'KTI', selected: false },
          ],
        })
      )
    })

    it('should return to review recipients if no contact number', async () => {
      req.params = { contactId: undefined }

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', expect.anything())
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })

    it('should return to review recipients if cannot find contact', async () => {
      contactService.getContactById.mockRejectedValue('some-error')

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', expect.anything())
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })

    it('should return to review recipients if cannot load active prisons', async () => {
      prisonRegisterService.getActivePrisons.mockImplementation(() => {
        throw new Error('some-error')
      })

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', expect.anything())
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })
  })

  describe('submitUpdateContact', () => {
    let mockValidateContact: jest.MockedFunction<typeof validateContact>

    beforeEach(() => {
      mockValidateContact = validateContact as jest.MockedFunction<typeof validateContact>
      contactService.updateContact.mockReset()
      recipientService.updateContact.mockReset()
    })

    it('should update recipient list and return to recipient review if saved', async () => {
      req.body = { ...anEditContactForm }
      mockValidateContact.mockReturnValue([])
      contactService.updateContact.mockReturnValue(aContact)

      await editContactController.submitUpdateContact(req as unknown as Request, res as unknown as Response)

      expect(contactService.updateContact).toHaveBeenCalledWith(
        'some-token',
        '127.0.0.1',
        anEditContactForm.prisonerName,
        anEditContactForm.prisonId,
        anEditContactForm.contactId,
        anEditContactForm.prisonNumber,
        anEditContactForm.dob
      )
      expect(recipientService.updateContact).not.toHaveBeenCalledWith(aContact)
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })

    it('should display errors if contact invalid', async () => {
      req.body = { ...anEditContactForm }
      mockValidateContact.mockReturnValue([{ href: 'some-field', text: 'some-error' }])

      await editContactController.submitUpdateContact(req as unknown as Request, res as unknown as Response)

      expect(mockValidateContact).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: 'some-field', text: 'some-error' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/edit-contact/1')
    })

    it('should return to review recipients with error if we fail to update contact', async () => {
      req.body = { ...anEditContactForm }
      mockValidateContact.mockReturnValue([])
      contactService.updateContact.mockRejectedValue({
        status: 400,
        data: { errorCode: { code: 'MALFORMED_REQUEST', userMessage: 'Bad request' } },
      })

      await editContactController.submitUpdateContact(req as unknown as Request, res as unknown as Response)

      expect(contactService.updateContact).toHaveBeenCalled()

      expect(recipientService.updateContact).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error updating the contact' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/review-recipients')
    })

    it('should display error if failed to update contact due to conflict', async () => {
      req.body = { ...anEditContactForm }
      mockValidateContact.mockReturnValue([])
      contactService.updateContact.mockRejectedValue({
        status: 409,
        data: { errorCode: { code: 'CONFLICT', userMessage: 'Prison number already exists' } },
      })

      await editContactController.submitUpdateContact(req as unknown as Request, res as unknown as Response)

      expect(contactService.updateContact).toHaveBeenCalled()
      expect(recipientService.updateContact).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.arrayContaining([expect.objectContaining({ href: '#prisonNumber' })])
      )
      expect(res.redirect).toHaveBeenCalledWith('/barcode/edit-contact/1')
    })
  })
})
