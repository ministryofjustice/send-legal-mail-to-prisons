import nock from 'nock'
import type { CjsmUserDetails } from 'sendLegalMailApiClient'
import CjsmService from './CjsmService'
import config from '../../config'

describe('CjsmService', () => {
  const cjsmService: CjsmService = new CjsmService()
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const expectedResponse: CjsmUserDetails = {
        userId: 'some.email@company.com.cjsm.net',
        organisation: 'some-org',
        organisationType: 'some-type',
        townOrCity: 'some-town',
      }
      mockedSendLegalMailApi.get('/cjsm/user/me').reply(200, expectedResponse)

      const userDetails = await cjsmService.getUserDetails('some-token')

      expect(userDetails).toStrictEqual(expectedResponse)
    })

    it('should return not found', () => {
      const expectedError = {
        status: 404,
        errorCode: {
          code: 'NOT_FOUND',
          userMessage: 'User details not found',
        },
      }
      mockedSendLegalMailApi.get('/cjsm/user/me').reply(404, expectedError)

      return cjsmService.getUserDetails('some-token').catch(async error => {
        await expect(JSON.parse(error.text)).toStrictEqual(expectedError)
      })
    })
  })
})
