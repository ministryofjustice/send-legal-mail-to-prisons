import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import moment from 'moment'
import GenerateBarcodeImageController from './GenerateBarcodeImageController'
import CreateBarcodeService from '../../../services/barcode/CreateBarcodeService'

const req = {
  session: { barcodeUser: { token: 'some-token' } } as SessionData,
  flash: jest.fn(),
}

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const createBarcodeService = {
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
    req.session = { barcodeUser: { token: 'some-token' } } as SessionData
    createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockReset()
    createBarcodeService.addBarcodeValuesToRecipients.mockReset()
  })

  describe('getGenerateImageView', () => {
    it('should redirect to find-recipient given no recipients in the session', async () => {
      req.session.recipients = undefined

      await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

      expect(res.redirect).toHaveBeenCalledWith('/barcode/find-recipient')
    })

    describe('Single recipient', () => {
      it('should create the image and call the view', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockResolvedValue([
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '123456789012',
          },
        ])
        createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockResolvedValue('barcode-address-image-url')

        const expectedRenderArgs = {
          barcodeImages: [
            {
              barcodeImageUrl: 'barcode-address-image-url',
              barcodeImageName: `SendLegalMail-John-Smith-${moment().format('YYYY-MM-DD')}.png`,
              recipientName: 'John Smith',
            },
          ],
        }

        await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

        expect(res.render).toHaveBeenCalledWith('pages/barcode/generate-barcode-image', expectedRenderArgs)
      })

      it('should render errors if generating barcode value from the API fails', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockRejectedValue('An error returned from barcode API')

        await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: 'There was an error generating the barcode, please try again' },
        ])
      })

      it('should render errors if generating barcode data url image fails', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockResolvedValue([
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '123456789012',
          },
        ])
        createBarcodeService.generateAddressAndBarcodeDataUrlImage.mockRejectedValue('Error generating image')

        await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: 'There was an error generating the barcode, please try again' },
        ])
      })
    })

    describe('Multiple recipients', () => {
      it('should create the image and call the view', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockResolvedValue([
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '123456789012',
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '999988887777',
          },
        ])
        createBarcodeService.generateAddressAndBarcodeDataUrlImage
          .mockResolvedValueOnce('john-smith-barcode-image-url')
          .mockResolvedValueOnce('john-doe-barcode-image-url')

        const expectedRenderArgs = {
          barcodeImages: [
            {
              barcodeImageUrl: 'john-smith-barcode-image-url',
              barcodeImageName: `SendLegalMail-John-Smith-${moment().format('YYYY-MM-DD')}.png`,
              recipientName: 'John Smith',
            },
            {
              barcodeImageUrl: 'john-doe-barcode-image-url',
              barcodeImageName: `SendLegalMail-John-Doe-${moment().format('YYYY-MM-DD')}.png`,
              recipientName: 'John Doe',
            },
          ],
        }

        await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

        expect(res.render).toHaveBeenCalledWith('pages/barcode/generate-barcode-image', expectedRenderArgs)
      })

      it('should render errors if generating barcode value from the API fails for any recipient', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockRejectedValue('An error returned from barcode API')

        await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: 'There was an error generating the barcode, please try again' },
        ])
      })

      it('should render errors if generating barcode data url image fails for the 2nd recipient', async () => {
        req.session.recipients = [
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
          },
        ]
        createBarcodeService.addBarcodeValuesToRecipients.mockResolvedValue([
          {
            prisonerName: 'John Smith',
            prisonNumber: 'A1234BC',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '123456789012',
          },
          {
            prisonerName: 'John Doe',
            prisonNumber: 'J3344JD',
            prison: { addressName: 'HMP Somewhere', postalCode: 'AA1 1AA' },
            barcodeValue: '999988887777',
          },
        ])
        createBarcodeService.generateAddressAndBarcodeDataUrlImage
          .mockResolvedValueOnce('john-smith-barcode-image-url')
          .mockRejectedValueOnce('Error generating image')

        await generateBarcodeImageController.getGenerateImageView(req as unknown as Request, res as unknown as Response)

        expect(res.redirect).toHaveBeenCalledWith('/barcode/choose-barcode-option')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: 'There was an error generating the barcode, please try again' },
        ])
      })
    })
  })
})
