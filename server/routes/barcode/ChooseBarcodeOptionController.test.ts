import { SessionData } from 'express-session'
import { Request, Response } from 'express'
import ChooseBarcodeOptionController from './ChooseBarcodeOptionController'
import validateBarcodeOption from './barcodeOptionValidator'

jest.mock('../../config')
jest.mock('./barcodeOptionValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  body: {},
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

describe('ChooseBarcodeOptionController', () => {
  let chooseBarcodeOptionController: ChooseBarcodeOptionController

  beforeEach(() => {
    chooseBarcodeOptionController = new ChooseBarcodeOptionController()
  })

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    req.flash.mockReset()
  })

  describe('getChooseBarcodeOptionView', () => {
    it('should return to find recipient if we have no recipients', async () => {
      await chooseBarcodeOptionController.getChooseBarcodeOptionView(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    it('should render new page', async () => {
      req.session.recipients = []

      await chooseBarcodeOptionController.getChooseBarcodeOptionView(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.render).toHaveBeenCalledWith('pages/barcode/choose-barcode-option', { form: {}, errors: [] })
    })

    it('should render new page with errors', async () => {
      req.session.recipients = []
      req.session.chooseBarcodeOptionForm = {}
      req.flash.mockReturnValue([{ href: '#href', text: 'some-error' }])

      await chooseBarcodeOptionController.getChooseBarcodeOptionView(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.render).toHaveBeenCalledWith('pages/barcode/choose-barcode-option', {
        form: {},
        errors: [{ href: '#href', text: 'some-error' }],
      })
    })
  })

  describe('submitChooseBarcodeOption', () => {
    let mockValidateBarcodeOption: jest.MockedFunction<typeof validateBarcodeOption>

    beforeEach(() => {
      mockValidateBarcodeOption = validateBarcodeOption as jest.MockedFunction<typeof validateBarcodeOption>
    })

    it(`should go back to the form if it wasn't actually submitted`, async () => {
      await chooseBarcodeOptionController.submitChooseBarcodeOption(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
    })

    it(`should go back to the form if it's invalid`, async () => {
      req.body = {}
      mockValidateBarcodeOption.mockReturnValue(false)

      await chooseBarcodeOptionController.submitChooseBarcodeOption(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
    })

    it('should redirect to barcode image page if form is valid', async () => {
      req.body = { barcodeOption: 'image' }
      mockValidateBarcodeOption.mockReturnValue(true)

      await chooseBarcodeOptionController.submitChooseBarcodeOption(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.redirect).toHaveBeenCalledWith('/barcode/generate-barcode-image')
    })
  })
})
