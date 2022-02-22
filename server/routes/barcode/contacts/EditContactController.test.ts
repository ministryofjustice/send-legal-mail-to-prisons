import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import EditContactController from './EditContactController'
import ContactService from '../../../services/contacts/ContactService'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
  params: { contactId: 1 },
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
}

const aContact = {
  id: 1,
  prisonerName: 'some-name',
  prisonId: 'KTI',
  dob: '1990-01-19',
  prisonNumber: 'some-prison-number',
}

describe('EditContactController', () => {
  let editContactController: EditContactController

  beforeEach(() => {
    editContactController = new EditContactController(
      prisonRegisterService as unknown as PrisonRegisterService,
      contactService as unknown as ContactService
    )
  })

  afterEach(() => {
    prisonRegisterService.getActivePrisons.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
    req.params = { contactId: 1 }
  })

  describe('getCreateNewRecipientView', () => {
    it('should render contact details', async () => {
      prisonRegisterService.getActivePrisons.mockReturnValue([{ id: 'KTI', name: 'Kennet (HMP)' }])
      contactService.getContactById.mockReturnValue(aContact)

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getActivePrisons).toHaveBeenCalled()
      expect(contactService.getContactById).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/barcode/edit-contact-details', {
        errors: [],
        form: {
          id: 1,
          name: 'some-name',
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
})
