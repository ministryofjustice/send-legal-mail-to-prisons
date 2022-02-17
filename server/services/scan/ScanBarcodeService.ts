import type { CheckBarcodeRequest } from 'sendLegalMailApiClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import HmppsAuthClient from '../../data/hmppsAuthClient'

export default class ScanBarcodeService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(hmppsToken: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, hmppsToken)
  }

  async verifyBarcode(barcode: string, user: string): Promise<unknown> {
    const checkBarcodeRequest: CheckBarcodeRequest = { barcode }
    return this.hmppsAuthClient.getSystemClientToken(user).then(hmppsToken =>
      ScanBarcodeService.restClient(hmppsToken).update({
        path: '/barcode/check',
        data: checkBarcodeRequest,
      })
    )
  }

  async notifyMoreChecksRequested(barcode: string, user: string): Promise<unknown> {
    const checkBarcodeRequest: CheckBarcodeRequest = { barcode }
    return this.hmppsAuthClient.getSystemClientToken(user).then(hmppsToken =>
      ScanBarcodeService.restClient(hmppsToken).update({
        path: '/barcode/event/more-checks-requested',
        data: checkBarcodeRequest,
      })
    )
  }
}
