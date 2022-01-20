// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { toBuffer } from 'bwip-js'
import nock from 'nock'
import CreateBarcodeService from './CreateBarcodeService'
import config from '../../config'

jest.mock('bwip-js')
const mockBwipjsToBuffer = <jest.Mock<typeof toBuffer>>toBuffer

describe('CreateBarcodeService', () => {
  const createBarcodeService = new CreateBarcodeService()
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
    mockBwipjsToBuffer.mockClear()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('generateBarcodeValue', () => {
    it('should generate a new barcode value', async () => {
      mockedSendLegalMailApi.post('/barcode').reply(201, { barcode: '123456789012' })

      const barcodeValue = await createBarcodeService.generateBarcodeValue('some-token')

      expect(barcodeValue).toBe('123456789012')
    })

    it('should throw error if calling the API returns error', async () => {
      mockedSendLegalMailApi.post('/barcode').reply(400, 'something bad happened')

      await expect(createBarcodeService.generateBarcodeValue('some-token')).rejects.toStrictEqual(
        expect.objectContaining({ status: 400, text: 'something bad happened' })
      )
    })
  })

  describe('generateAddressAndBarcodeDataUrlImage', () => {
    it('should generate an address and barcode data url image', async () => {
      const recipient = {
        prisonNumber: 'A1234BC',
        prisonerName: 'John Smith',
        prisonAddress: {
          premise: 'HMP BRINSFORD',
          street: 'New Road',
          locality: 'Featherstone',
          area: 'Featherstone Wolverhampton',
          postalCode: 'WV10 7PY',
        },
        barcodeValue: '123456789012',
      }
      mockBwipjsToBuffer.mockReturnValue(Buffer.from('barcode-image'))

      const barcodeImageDataUrl = await createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient)

      expect(barcodeImageDataUrl).toContain('data:image/png;base64,')
      expect(mockBwipjsToBuffer).toHaveBeenCalledWith(
        expect.objectContaining({ text: '123456789012', alttext: '1234-5678-9012' })
      )
    })
  })

  describe('addBarcodeValuesToRecipients', () => {
    it('should add barcode values to recipients', async () => {
      const recipients = [
        {
          prisonNumber: 'A1234BC',
          prisonerName: 'John Smith',
          prisonAddress: {
            premise: 'HMP BRINSFORD',
            postalCode: 'WV10 7PY',
          },
        },
        {
          prisonNumber: 'A5566JD',
          prisonerName: 'Jane Doe',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
          barcodeValue: '121212121212',
        },
        {
          prisonNumber: 'Q9876TY',
          prisonerName: 'Fred Bloggs',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
        },
      ]

      mockedSendLegalMailApi
        .post('/barcode')
        .reply(201, { barcode: '123456789012' })
        .post('/barcode')
        .reply(201, { barcode: '098765432109' })

      const recipientsWithBarcodes = await createBarcodeService.addBarcodeValuesToRecipients(recipients, 'some-token')

      expect(recipientsWithBarcodes).toStrictEqual([
        {
          prisonNumber: 'A1234BC',
          prisonerName: 'John Smith',
          prisonAddress: {
            premise: 'HMP BRINSFORD',
            postalCode: 'WV10 7PY',
          },
          barcodeValue: '123456789012',
        },
        {
          prisonNumber: 'A5566JD',
          prisonerName: 'Jane Doe',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
          barcodeValue: '121212121212',
        },
        {
          prisonNumber: 'Q9876TY',
          prisonerName: 'Fred Bloggs',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
          barcodeValue: '098765432109',
        },
      ])
    })
  })
})
