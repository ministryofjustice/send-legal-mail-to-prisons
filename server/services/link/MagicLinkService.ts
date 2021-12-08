import HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import { VerifyLinkResponse } from '../../@types/sendLegalMailApiClientTypes'

export default class MagicLinkService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, token)
  }

  async requestLink(email: string): Promise<unknown> {
    return this.hmppsAuthClient.getSystemClientToken().then(token =>
      MagicLinkService.restClient(token).post({
        path: `/link/email`,
        data: { email },
      })
    )
  }

  async verifyLink(secret: string): Promise<string> {
    return this.hmppsAuthClient.getSystemClientToken().then(token =>
      MagicLinkService.restClient(token)
        .post({
          path: `/link/verify`,
          data: { secret },
        })
        .then(apiResponse => {
          const verifyLinkResponse = apiResponse as VerifyLinkResponse
          return verifyLinkResponse.token
        })
    )
  }
}
