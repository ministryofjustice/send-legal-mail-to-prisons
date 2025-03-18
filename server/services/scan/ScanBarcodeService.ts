import type { CheckBarcodeRequest } from 'sendLegalMailApiClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import HmppsAuthClient from '../../data/hmppsAuthClient'

export default class ScanBarcodeService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(hmppsToken: string, sourceIp: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, hmppsToken, null, sourceIp)
  }

  async verifyBarcode(barcode: string, user: string, sourceIp: string): Promise<unknown> {
    const checkBarcodeRequest: CheckBarcodeRequest = { barcode }
    return this.hmppsAuthClient.getSystemClientToken(user).then(hmppsToken =>
      ScanBarcodeService.restClient(hmppsToken, sourceIp).post({
        path: '/barcode/check',
        data: checkBarcodeRequest,
      }),
    )
  }

  async notifyMoreChecksRequested(barcode: string, user: string, sourceIp: string): Promise<unknown> {
    const checkBarcodeRequest: CheckBarcodeRequest = { barcode }
    return this.hmppsAuthClient.getSystemClientToken(user).then(hmppsToken =>
      ScanBarcodeService.restClient(hmppsToken, sourceIp).post({
        path: '/barcode/event/more-checks-requested',
        data: checkBarcodeRequest,
      }),
    )
  }
}
