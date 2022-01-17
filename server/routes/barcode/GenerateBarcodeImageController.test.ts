import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import GenerateBarcodeImageController from './GenerateBarcodeImageController'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const createBarcodeService = {
  generateBarcode: jest.fn(),
}

describe('GenerateBarcodeImageController', () => {
  let generateBarcodeImageController: GenerateBarcodeImageController

  beforeEach(() => {
    generateBarcodeImageController = new GenerateBarcodeImageController(
      createBarcodeService as unknown as CreateBarcodeService
    )
  })

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
    req.session = {} as SessionData
    createBarcodeService.generateBarcode.mockReset()
  })

  describe('getGenerateImageView', () => {
    it('should create the image and call the view', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      createBarcodeService.generateBarcode.mockReturnValue({
        barcode: '123456789012',
        barcodeImageDataUrl: 'barcode-address-image-url',
      })

      const expectedRenderArgs = {
        barcodeImageUrl: 'barcode-address-image-url',
        barcodeImageName: 'John-Smith-A1234BC.png',
      }

      await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/generate-barcode-image', expectedRenderArgs)
    })

    it('should throw an error if barcode creation service fails', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      createBarcodeService.generateBarcode.mockRejectedValue('Any error returned from barcode creation service')

      await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'There was an error generating the barcode, please try again' },
      ])
    })

    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })
  })
})
