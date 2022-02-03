import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import FindRecipientController from './FindRecipientController'
import prisonNumberValidator from '../validators/prisonNumberValidator'
import prisonerNameValidator from '../validators/prisonerNameValidator'

jest.mock('../validators/prisonNumberValidator')
jest.mock('../validators/prisonerNameValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
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
      req.session.recipientForm = {}
      req.body = { prisonNumber: 'A1234BC' }
      mockPrisonNumberValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prison-number')
    })

    it('should redirect to find-recipient/by-prison-number given prison number is validated', async () => {
      req.session.recipientForm = {}
      mockPrisonNumberValidator.mockReturnValue(['Enter a prison number'])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonNumber', text: 'Enter a prison number' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prison-number')
    })

    it('should uppercase and trim the prison number', async () => {
      req.session.recipientForm = {}
      req.body = { prisonNumber: ' a1234bc ' }
      mockPrisonNumberValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonNumber(req as unknown as Request, res as unknown as Response)

      expect(req.session.recipientForm.prisonNumber).toEqual('A1234BC')
    })
  })

  describe('getFindByPrisonerName', () => {
    it('should clear down the recipient form', async () => {
      req.session.recipientForm = { prisonNumber: 'A1234BC' }

      await findRecipientController.getFindRecipientByPrisonerNameView(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(req.session.recipientForm).toEqual({})
    })
  })

  describe('submitFindByPrisonerName', () => {
    let mockPrisonerNameValidator: jest.MockedFunction<typeof prisonerNameValidator>

    beforeEach(() => {
      mockPrisonerNameValidator = prisonerNameValidator as jest.MockedFunction<typeof prisonerNameValidator>
    })

    it('should redirect to create-new-contact given prisoner name is validated', async () => {
      req.session.recipientForm = {}
      req.body = { prisonerName: 'John Smith' }
      mockPrisonerNameValidator.mockReturnValue([])

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    })

    it('should redirect to find-recipient/by-prisoner-name given prisoner name is validated', async () => {
      req.session.recipientForm = {}
      mockPrisonerNameValidator.mockReturnValue(['Enter a prisoner name'])

      await findRecipientController.submitFindByPrisonerName(req as unknown as Request, res as unknown as Response)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonerName', text: 'Enter a prisoner name' }])
      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient/by-prisoner-name')
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
