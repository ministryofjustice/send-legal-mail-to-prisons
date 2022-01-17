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

  describe('generateBarcode', () => {
    it('should generate a barcode', async () => {
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
      }
      mockedSendLegalMailApi.post('/barcode').reply(201, { barcode: '123456789012' })
      mockBwipjsToBuffer.mockReturnValue(Buffer.from('barcode-image'))

      const barcodeData = await createBarcodeService.generateBarcode('some-token', recipient)

      expect(barcodeData.barcode).toEqual('123456789012')
      expect(barcodeData.barcodeImageDataUrl).toContain('data:image/png;base64,')
      expect(mockBwipjsToBuffer).toHaveBeenCalledWith(
        expect.objectContaining({ text: '123456789012', alttext: '1234-5678-9012' })
      )
    })
  })
})
