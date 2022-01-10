import { Request, Response } from 'express'
import type { FindRecipientForm } from 'forms'
import { SessionData } from 'express-session'
import FindRecipientController from './FindRecipientController'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}
const response = {
  render: jest.fn(),
}

const prisonRegisterService = {
  getActivePrisons: jest.fn(),
}

describe('FindRecipientController', () => {
  let findRecipientController: FindRecipientController

  beforeEach(() => {
    findRecipientController = new FindRecipientController(prisonRegisterService as unknown as PrisonRegisterService)
  })

  afterEach(() => {
    prisonRegisterService.getActivePrisons.mockReset()
    response.render.mockReset()
    req.session = {} as SessionData
  })

  describe('getFindRecipientView', () => {
    it('should create and return view', async () => {
      prisonRegisterService.getActivePrisons.mockResolvedValue([
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ])
      req.session.barcode = '123456789012'
      req.session.barcodeImageUrl = 'http://url/image.png'

      const expectedRenderArgs = {
        barcode: '123456789012',
        barcodeImageUrl: 'http://url/image.png',
        errors: [] as Array<Record<string, string>>,
        form: {} as FindRecipientForm,
        prisonRegister: [
          { value: '', text: '' },
          { value: 'ACI', text: 'Altcourse (HMP)' },
          { value: 'ASI', text: 'Ashfield (HMP)' },
          { value: 'KTI', text: 'Kennet (HMP)' },
        ] as Array<Record<string, string>>,
      }
      await findRecipientController.getFindRecipientView(req as unknown as Request, response as unknown as Response)

      expect(response.render).toHaveBeenCalledWith('pages/barcode/find-recipient', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors')
    })

    it('should create and return view with error given prison register service fails', async () => {
      prisonRegisterService.getActivePrisons.mockRejectedValue('An error retrieving prison register')
      req.session.barcode = '123456789012'
      req.session.barcodeImageUrl = 'http://url/image.png'

      const expectedRenderArgs = {
        barcode: '123456789012',
        barcodeImageUrl: 'http://url/image.png',
        errors: [] as Array<Record<string, string>>,
        form: {} as FindRecipientForm,
        prisonRegister: [{ value: '', text: '' }] as Array<Record<string, string>>,
      }
      await findRecipientController.getFindRecipientView(req as unknown as Request, response as unknown as Response)

      expect(response.render).toHaveBeenCalledWith('pages/barcode/find-recipient', expectedRenderArgs)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error retrieving the list of prisons' }])
      expect(req.flash).toHaveBeenCalledWith('errors')
    })
  })
})
