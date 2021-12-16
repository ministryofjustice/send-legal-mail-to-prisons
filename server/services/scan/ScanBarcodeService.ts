import RestClient from '../../data/restClient'
import config from '../../config'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import { CheckBarcodeRequest } from '../../@types/sendLegalMailApiClientTypes'

export default class ScanBarcodeService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, token)
  }

  async verifyBarcode(barcode: string, user: string): Promise<unknown> {
    const checkBarcodeRequest: CheckBarcodeRequest = { barcode }
    return this.hmppsAuthClient.getSystemClientToken(user).then(token =>
      ScanBarcodeService.restClient(token).post({
        path: '/barcode/check',
        data: checkBarcodeRequest,
      })
    )
  }
}
