import type { CjsmUserDetails } from 'sendLegalMailApiClient'
import RestClient from '../../data/restClient'
import config from '../../config'

export default class CjsmService {
  private static restClient(hmppsToken: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, hmppsToken, null)
  }

  async getUserDetails(slmToken: string): Promise<unknown> {
    return (await CjsmService.restClient(slmToken).get({
      path: `/cjsm/user/me`,
    })) as CjsmUserDetails
  }
}
