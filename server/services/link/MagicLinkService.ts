import type { MagicLinkRequest, VerifyLinkRequest, VerifyLinkResponse } from 'sendLegalMailApiClient'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'

export default class MagicLinkService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(hmppsToken: string, sourceIp: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, hmppsToken, null, sourceIp)
  }

  async requestLink(email: string, sourceIp: string): Promise<unknown> {
    const magicLinkRequest: MagicLinkRequest = { email }
    return this.hmppsAuthClient.getSystemClientToken().then(hmppsToken =>
      MagicLinkService.restClient(hmppsToken, sourceIp).post({
        path: `/link/email`,
        data: magicLinkRequest,
      })
    )
  }

  async verifyLink(secret: string, sourceIp: string): Promise<string> {
    const verifyLinkRequest: VerifyLinkRequest = { secret }
    return this.hmppsAuthClient.getSystemClientToken().then(hmppsToken =>
      MagicLinkService.restClient(hmppsToken, sourceIp)
        .post({
          path: `/link/verify`,
          data: verifyLinkRequest,
        })
        .then(apiResponse => {
          const verifyLinkResponse = apiResponse as VerifyLinkResponse
          return verifyLinkResponse.token
        })
    )
  }
}
