import RestClient from '../../data/restClient'
import config from '../../config'

export default class CreateBarcodeService {
  private static restClient(token: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, token)
  }

  async createBarcode(token: string): Promise<string> {
    return CreateBarcodeService.restClient(token)
      .postCreateBarcode({ path: `/barcode` })
      .then(response => {
        return response.toString()
      })
  }
}
