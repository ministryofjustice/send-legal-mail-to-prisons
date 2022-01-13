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
}

const createBarcodeService = {
  createBarcode: jest.fn(),
  generateBarcodeImage: jest.fn(),
  generateAddressAndBarcodeImage: jest.fn(),
}

describe('getGenerateImageView', () => {
  let generateBarcodeImageController: GenerateBarcodeImageController

  beforeEach(() => {
    generateBarcodeImageController = new GenerateBarcodeImageController(
      createBarcodeService as unknown as CreateBarcodeService
    )
  })

  afterEach(() => {
    res.render.mockReset()
    req.session = {} as SessionData
    createBarcodeService.createBarcode.mockReset()
    createBarcodeService.generateBarcodeImage.mockReset()
    createBarcodeService.generateAddressAndBarcodeImage.mockReset()
  })

  it('should create the image and call the view', async () => {
    createBarcodeService.createBarcode.mockResolvedValue('123456789012')
    createBarcodeService.generateBarcodeImage.mockResolvedValue(Buffer.from('barcode-image'))
    createBarcodeService.generateAddressAndBarcodeImage.mockReturnValue('barcode-address-image-url')

    const expectedRenderArgs = {
      barcode: '123456789012',
      barcodeImageUrl: 'barcode-address-image-url',
      barcodeImageName: 'John-Smith-A1234BC.png',
    }

    await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

    expect(res.render).toHaveBeenCalledWith('pages/barcode/generate-barcode-image', expectedRenderArgs)
  })

  it('should throw an error if barcode creation service fails', async () => {
    createBarcodeService.createBarcode.mockRejectedValue('Any error returned from barcode creation service')

    await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

    expect(res.render).toHaveBeenCalledWith('pages/barcode/review-recipients', {
      errors: [{ text: 'There was an error generating the barcode, please try again' }],
    })
  })

  it('should throw an error if barcode image generation fails', async () => {
    createBarcodeService.createBarcode.mockResolvedValue('123456789012')
    createBarcodeService.generateBarcodeImage.mockRejectedValue('Any error returned from barcode image generation')

    await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

    expect(res.render).toHaveBeenCalledWith('pages/barcode/review-recipients', {
      errors: [{ text: 'There was an error generating the barcode, please try again' }],
    })
  })
})
