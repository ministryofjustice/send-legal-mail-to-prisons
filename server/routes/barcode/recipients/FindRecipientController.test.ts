import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import FindRecipientController from './FindRecipientController'
import prisonNumberValidator from '../validators/prisonNumberValidator'

jest.mock('../validators/prisonNumberValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: { prisonNumber: '' },
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

describe('FindRecipientController', () => {
  const findRecipientController = new FindRecipientController()

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
  })

  describe('submitFindByPrisonNumber', () => {
    let mockPrisonNumberValidator: jest.MockedFunction<typeof prisonNumberValidator>

    beforeEach(() => {
      mockPrisonNumberValidator = prisonNumberValidator as jest.MockedFunction<typeof prisonNumberValidator>
    })

    it('should redirect to create-new-contact given prison number is validated', async () => {
      mockPrisonNumberValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
    })

    it('should redirect to find-recipient/by-prison-number given prison number is validated', async () => {
      mockPrisonNumberValidator.mockReturnValue(['Enter a prison number'])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonNumber', text: 'Enter a prison number' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prison-number')
    })

    it('should uppercase and trim the prison number', async () => {
      req.body.prisonNumber = ' a1234bc '
      mockPrisonNumberValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.body.prisonNumber).toEqual('A1234BC')
    })
  })
})
