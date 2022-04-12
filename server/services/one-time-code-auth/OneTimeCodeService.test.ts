// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import config from '../../config'
import TokenStore from '../../data/cache/TokenStore'
import OneTimeCodeService from './OneTimeCodeService'

jest.mock('../../data/hmppsAuthClient')

describe('One Time Code Service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let oneTimeCodeService: OneTimeCodeService
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)

    hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getSystemClientToken.mockResolvedValue('a-system-client-token')
    oneTimeCodeService = new OneTimeCodeService(hmppsAuthClient)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('requestOneTimeCode', () => {
    it('should request a one time code', done => {
      mockedSendLegalMailApi.post('/oneTimeCode/email', { email: 'a.b@c.com', sessionID: '12345678' }).reply(201)

      oneTimeCodeService.requestOneTimeCode('a.b@c.com', '12345678', '127.0.0.1').then(() => {
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalled()
        done()
      })
    })

    it('should fail to request a one time code given getSystemClientToken fails', done => {
      hmppsAuthClient.getSystemClientToken.mockRejectedValue('an error getting system client token')

      oneTimeCodeService.requestOneTimeCode('a.b@c.com', '12345678', '127.0.0.1').catch(error => {
        expect(error).toBe('an error getting system client token')
        done()
      })
    })
  })

  describe('verifyOneTimeCode', () => {
    it('should verify a one time code', done => {
      mockedSendLegalMailApi
        .post('/oneTimeCode/verify', { code: 'ABCD', sessionID: '12345678' })
        .reply(200, { token: 'a-valid-jwt' })

      oneTimeCodeService.verifyOneTimeCode('ABCD', '12345678', '127.0.0.1').then(token => {
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalled()
        expect(token).toEqual('a-valid-jwt')
        done()
      })
    })

    it('should fail to verify a one time code given getSystemClientToken fails', done => {
      hmppsAuthClient.getSystemClientToken.mockRejectedValue('an error getting system client token')

      oneTimeCodeService.verifyOneTimeCode('ABCD', '12345678', '127.0.0.1').catch(error => {
        expect(error).toBe('an error getting system client token')
        done()
      })
    })
  })
})
