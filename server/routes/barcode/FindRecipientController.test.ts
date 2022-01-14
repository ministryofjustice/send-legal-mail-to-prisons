import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import FindRecipientController from './FindRecipientController'
import prisonNumberValidator from './prisonNumberValidator'

jest.mock('../../config')
jest.mock('./prisonNumberValidator')

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
      mockPrisonNumberValidator.mockReturnValue(true)

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact')
    })

    it('should redirect to find-recipient given prison number is validated', async () => {
      mockPrisonNumberValidator.mockReturnValue(false)

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should uppercase and trim the prison number', async () => {
      req.body.prisonNumber = ' a1234bc '
      mockPrisonNumberValidator.mockReturnValue(true)

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.body.prisonNumber).toEqual('A1234BC')
    })
  })
})
