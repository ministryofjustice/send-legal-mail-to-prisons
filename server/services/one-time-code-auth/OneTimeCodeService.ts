import HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'

export default class OneTimeCodeService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(hmppsToken: string, sourceIp: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, hmppsToken, null, sourceIp)
  }

  async requestOneTimeCode(_email: string, _sourceIp: string): Promise<unknown> {
    return null
  }

  async verifyOneTimeCode(_secret: string, _sourceIp: string): Promise<string> {
    return null
  }
}
