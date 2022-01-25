import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import GenerateBarcodeImageController from './GenerateBarcodeImageController'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
}

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const createBarcodeService = {
  generateBarcodeValue: jest.fn(),
  generateAddressAndBarcodeDataUrlImage: jest.fn(),
  addBarcodeValuesToRecipients: jest.fn(),
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
    createBarcodeService.generateBarcodeValue.mockReset()
    createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockReset()
    createBarcodeService.addBarcodeValuesToRecipients.mockReset()
  })

  describe('getGenerateImageView', () => {
    it('should create the image and call the view', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      createBarcodeService.addBarcodeValuesToRecipients.mockReturnValue([
        { prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {}, barcodeValue: '123456789012' },
      ])
      createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockReturnValue('barcode-address-image-url')

      const expectedRenderArgs = {
        barcodeImages: [
          {
            barcodeImageUrl: 'barcode-address-image-url',
            barcodeImageName: `John-Smith-A1234BC-${moment().format('DD-MM-YYYY')}.png`,
          },
        ],
      }

      await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/barcode/generate-barcode-image', expectedRenderArgs)
    })

    it('should render errors if generating barcode value from the API fails', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      createBarcodeService.generateBarcodeValue.mockRejectedValue('Any error returned from barcode API')

      await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'There was an error generating the barcode, please try again' },
      ])
    })

    it('should render errors if generating barcode data url image fails', async () => {
      req.session.recipients = [{ prisonerName: 'John Smith', prisonNumber: 'A1234BC', prisonAddress: {} }]
      createBarcodeService.generateBarcodeValue.mockReturnValue('123456789012')
      createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockRejectedValue('Error generating image')

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
