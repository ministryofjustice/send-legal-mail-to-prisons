import nock from 'nock'
import SupportedPrisonsService from './SupportedPrisonsService'
import config from '../../config'

describe('SupportedPrisonService', () => {
  let supportedPrisonsService: SupportedPrisonsService
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
    supportedPrisonsService = new SupportedPrisonsService()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getSupportedPrisons', () => {
    it('should return supported prisons', async () => {
      mockedSendLegalMailApi //
        .get('/prisons')
        .reply(200, ['ABC', 'CDE'])

      const prisons = await supportedPrisonsService.getSupportedPrisons()

      expect(prisons).toStrictEqual(['ABC', 'CDE'])
      expect(mockedSendLegalMailApi.isDone()).toBe(true)
    })

    it('should pass on any errors', async () => {
      mockedSendLegalMailApi //
        .get('/prisons')
        .reply(499, 'some-error')

      await supportedPrisonsService.getSupportedPrisons().catch(error => {
        expect(error.status).toBe(499)
        expect(mockedSendLegalMailApi.isDone()).toBe(true)
      })
    })
  })

  describe('addSupportedPrison', () => {
    it('should send the user token and prisonId', async () => {
      mockedSendLegalMailApi
        .matchHeader('authorization', 'Bearer some-user-token')
        .post('/prisons/some-prison')
        .reply(201)

      await supportedPrisonsService.addSupportedPrison('some-user-token', 'some-prison')

      expect(mockedSendLegalMailApi.isDone()).toBe(true)
    })

    it('should pass on error if prisonId not found', async () => {
      mockedSendLegalMailApi
        .matchHeader('authorization', 'Bearer some-user-token')
        .post('/prisons/some-prison')
        .reply(404)

      await supportedPrisonsService.addSupportedPrison('some-user-token', 'some-prison').catch(error => {
        expect(error.status).toBe(404)
        expect(mockedSendLegalMailApi.isDone()).toBe(true)
      })
    })
  })

  describe('removeSupportedPrison', () => {
    it('should send the user token and prisonId', async () => {
      mockedSendLegalMailApi
        .matchHeader('authorization', 'Bearer some-user-token')
        .delete('/prisons/some-prison')
        .reply(200)

      await supportedPrisonsService.removeSupportedPrison('some-user-token', 'some-prison')

      expect(mockedSendLegalMailApi.isDone()).toBe(true)
    })

    it('should pass on error if prisonId not found', async () => {
      mockedSendLegalMailApi
        .matchHeader('authorization', 'Bearer some-user-token')
        .delete('/prisons/some-prison')
        .reply(404)

      await supportedPrisonsService.removeSupportedPrison('some-user-token', 'some-prison').catch(error => {
        expect(error.status).toBe(404)
        expect(mockedSendLegalMailApi.isDone()).toBe(true)
      })
    })
  })
})
