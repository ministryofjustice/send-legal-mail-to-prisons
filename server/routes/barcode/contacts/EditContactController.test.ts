import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'
import EditContactController from './EditContactController'

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
}

describe('EditContactController', () => {
  let editContactController: EditContactController

  beforeEach(() => {
    editContactController = new EditContactController(prisonRegisterService as unknown as PrisonRegisterService)
  })

  afterEach(() => {
    prisonRegisterService.getActivePrisons.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
  })

  describe('getCreateNewRecipientView', () => {
    it('should render active prisons', async () => {
      prisonRegisterService.getActivePrisons.mockReturnValue([{ id: 'KTI', name: 'Kennet (HMP)' }])

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getActivePrisons).toHaveBeenCalled()
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

    it('should render if cannot load active prisons', async () => {
      prisonRegisterService.getActivePrisons.mockImplementation(() => {
        throw new Error('some-error')
      })

      await editContactController.getEditContact(req as unknown as Request, res as unknown as Response)

      expect(prisonRegisterService.getActivePrisons).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          prisonRegister: [{ text: '', value: '' }],
        })
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error retrieving the list of prisons' }])
    })
  })
})
