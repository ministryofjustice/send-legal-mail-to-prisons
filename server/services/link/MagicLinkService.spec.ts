// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import TokenStore from '../../data/tokenStore'
import MagicLinkService from './MagicLinkService'
import config from '../../config'

jest.mock('../../data/hmppsAuthClient')

describe('Magic Link Service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let magicLinkService: MagicLinkService
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('requestLink', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('a-system-client-token')
      magicLinkService = new MagicLinkService(hmppsAuthClient)
    })

    it('should request a link', done => {
      mockedSendLegalMailApi.post('/link/email', { email: 'a.b@c.com' }).reply(201)

      magicLinkService
        .requestLink('a.b@c.com')
        .then(() => expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalled())
        .finally(() => done())
    })

    it('should fail to request a link given getSystemClientToken fails', done => {
      hmppsAuthClient.getSystemClientToken.mockRejectedValue('an error getting system client token')

      magicLinkService
        .requestLink('a.b@c.com')
        .catch(error => expect(error).toBe('an error getting system client token'))
        .finally(() => done())
    })
  })
})
