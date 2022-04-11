import type { OneTimeCodeRequest } from 'sendLegalMailApiClient'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'

export default class OneTimeCodeService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(hmppsToken: string, sourceIp: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, hmppsToken, null, sourceIp)
  }

  async requestOneTimeCode(email: string, sessionID: string, sourceIp: string): Promise<unknown> {
    const oneTimeCodeRequest: OneTimeCodeRequest = { email, sessionID }
    return this.hmppsAuthClient.getSystemClientToken().then(hmppsToken =>
      OneTimeCodeService.restClient(hmppsToken, sourceIp).post({
        path: `/oneTimeCode/email`,
        data: oneTimeCodeRequest,
      })
    )
  }

  async verifyOneTimeCode(_secret: string, _sourceIp: string): Promise<string> {
    return null
  }
}
