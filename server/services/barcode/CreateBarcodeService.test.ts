// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { toBuffer } from 'bwip-js'
import nock from 'nock'
import CreateBarcodeService from './CreateBarcodeService'
import config from '../../config'

jest.mock('bwip-js')
const mockBwipjsToBuffer = <jest.Mock<typeof toBuffer>>toBuffer

describe('CreateBarcodeService', () => {
  let createBarcodeService: CreateBarcodeService
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
    createBarcodeService = new CreateBarcodeService()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('createBarcode', () => {
    it('should call the create barcoe API', async () => {
      mockedSendLegalMailApi.post('/barcode').reply(201, { barcode: '123456789012' })

      createBarcodeService.createBarcode('some-token').then(barcode => {
        expect(barcode).toEqual('123456789012')
      })
    })
  })

  describe('generateBarcodeImage', () => {
    beforeEach(() => {
      mockBwipjsToBuffer.mockClear()
      createBarcodeService = new CreateBarcodeService()
    })

    it('should pass the barcode into the barcode generator', async () => {
      await createBarcodeService.generateBarcodeImage('123456789012')

      expect(mockBwipjsToBuffer).toHaveBeenCalledWith(
        expect.objectContaining({ text: '123456789012', alttext: '1234-5678-9012' })
      )
    })
  })
})
