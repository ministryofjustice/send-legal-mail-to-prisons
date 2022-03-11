// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import type { CheckBarcodeResponse } from 'sendLegalMailApiClient'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import TokenStore from '../../data/cache/TokenStore'
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
    it('should verify a barcode given API returns a CheckBarcodeResponse', done => {
      const checkBarcodeResponse: CheckBarcodeResponse = { createdBy: 'Aarvark Lawyers' }
      mockedSendLegalMailApi.post('/barcode/check', { barcode: '123456789012' }).reply(200, checkBarcodeResponse)

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id', '127.0.0.1').then(response => {
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith('a-user-id')
        expect(response).toStrictEqual(checkBarcodeResponse)
        done()
      })
    })

    it('should fail to verify a barcode given getSystemClientToken fails', done => {
      hmppsAuthClient.getSystemClientToken.mockRejectedValue('an error getting user client token')

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id', '127.0.0.1').catch(error => {
        expect(error).toBe('an error getting user client token')
        done()
      })
    })

    it('should fail to verify a barcode given API returns an ErrorResponse', done => {
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

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id', '127.0.0.1').catch(error => {
        expect(JSON.parse(error.text)).toStrictEqual(errorResponse)
        done()
      })
    })

    it('should fail to verify a barcode given API returns an error without an ErrorResponse body', done => {
      mockedSendLegalMailApi.post('/barcode/check', { barcode: '123456789012' }).reply(404)

      scanBarcodeService.verifyBarcode('123456789012', 'a-user-id', '127.0.0.1').catch(error => {
        expect(error.status).toBe(404)
        done()
      })
    })
  })

  describe('notifyMoreChecksRequested', () => {
    it('should notify that more checks are required for a barcode', done => {
      mockedSendLegalMailApi.post('/barcode/event/more-checks-requested', { barcode: '123456789012' }).reply(201)

      scanBarcodeService.notifyMoreChecksRequested('123456789012', 'a-user-id', '127.0.0.1').then(() => {
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith('a-user-id')
        done()
      })
    })

    it('should fail to notify that more checks are required for a barcode given getSystemClientToken fails', done => {
      hmppsAuthClient.getSystemClientToken.mockRejectedValue('an error getting user client token')

      scanBarcodeService.notifyMoreChecksRequested('123456789012', 'a-user-id', '127.0.0.1').catch(error => {
        expect(error).toBe('an error getting user client token')
        done()
      })
    })

    it('should fail to notify that more checks are required for a barcode given API returns an error without an ErrorResponse body', done => {
      mockedSendLegalMailApi.post('/barcode/event/more-checks-requested', { barcode: '123456789012' }).reply(404)

      scanBarcodeService.notifyMoreChecksRequested('123456789012', 'a-user-id', '127.0.0.1').catch(error => {
        expect(error.status).toBe(404)
        done()
      })
    })
  })
})
