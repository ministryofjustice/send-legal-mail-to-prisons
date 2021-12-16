import HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'

export default class CreateBarcodeService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, token)
  }

  async createBarcode(): Promise<string> {
    return this.hmppsAuthClient.getSystemClientToken().then(token =>
      CreateBarcodeService.restClient(token)
        .post({ path: `/barcode` })
        .then(response => {
          return response.toString()
        })
    )
  }
}
