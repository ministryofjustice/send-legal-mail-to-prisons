// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import TokenStore from '../../data/tokenStore'
import ScanBarcodeService from './ScanBarcodeService'
import config from '../../config'

jest.mock('../../data/hmppsAuthClient')

describe('Scan Barcode Service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let scanBarcodeService: ScanBarcodeService
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)

    hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue('a-user-token')
    scanBarcodeService = new ScanBarcodeService(hmppsAuthClient)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('verifyBarcode', () => {
    it('should verify a barcode', done => {
      mockedSendLegalMailApi.post('/barcode/check', { barcode: '123456789012' }).reply(200)

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id').then(() => {
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith('a-user-id')
        done()
      })
    })

    it('should fail to verify a barcode given getSystemClientToken fails', done => {
      hmppsAuthClient.getSystemClientToken.mockRejectedValue('an error getting user client token')

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id').catch(error => {
        expect(error).toBe('an error getting user client token')
        done()
      })
    })

    it('should fail to verify a barcode given API returns duplicate barcode error', done => {
      const errorResponse = {
        status: 400,
        errorCode: {
          code: 'DUPLICATE',
          userMessage: 'Someone scanned this barcode at 9:11 am on 8 December 2021 at LEI. It may be an illegal copy.',
          scannedDate: '2021-12-08T09:11:23Z',
          scannedLocation: 'LEI',
          createdBy: 'Aardvark Lawyers',
        },
      }
      mockedSendLegalMailApi.post('/barcode/check', { barcode: '123456789012' }).reply(400, errorResponse)

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id').catch(error => {
        expect(error).toStrictEqual(errorResponse)
        done()
      })
    })
  })
})
