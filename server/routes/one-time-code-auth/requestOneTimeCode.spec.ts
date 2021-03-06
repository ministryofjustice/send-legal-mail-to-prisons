// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import config from '../../config'
import mockHmppsAuth from '../fixtures/mock-hmpps-auth'
import assertThat from '../fixtures/supertest-assertions'
import SuperTestWrapper from '../fixtures/SuperTestWrapper'

jest.mock('../../config')

describe('Request One Time Code Integration Test', () => {
  const superTest = new SuperTestWrapper()
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockHmppsAuth()
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
    config.smoketest = { msjSecret: undefined, lsjSecret: undefined }
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Legal sender journey', () => {
    it('should render page to request a code', async () => {
      const response = await superTest.request //
        .get('/oneTimeCode/request-code')

      assertThat(response).isOk().hasPageId('request-one-time-code').hasNoErrors()
    })

    it('should redirect to email-sent page', async () => {
      mockedSendLegalMailApi
        .post('/oneTimeCode/email', { email: 'user@aardvark.com.cjsm.net', sessionID: /.*/i })
        .reply(201)

      const response = await superTest.request //
        .post('/oneTimeCode/request-code')
        .send({ email: 'user@aardvark.com.cjsm.net' })

      assertThat(response).isOk().hasPageId('one-time-code-email-sent').hasNoErrors()
    })

    it('should redirect to request-code page with errors given non CJSM address', async () => {
      mockedSendLegalMailApi.post('/oneTimeCode/email', { email: 'user@aardvark.com', sessionID: /.*/i }).reply(400, {
        status: 400,
        errorCode: {
          code: 'INVALID_CJSM_EMAIL',
          userMessage: `Enter an email address which ends with 'cjsm.net'`,
        },
      })

      const response = await superTest.request //
        .post('/oneTimeCode/request-code')
        .send({ email: 'user@aardvark.com' })

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('email address in the correct format')
    })

    it('should redirect to request-code page with errors given email address too long', async () => {
      mockedSendLegalMailApi.post('/oneTimeCode/email', { email: 'user@aardvark.com', sessionID: /.*/i }).reply(400, {
        status: 400,
        errorCode: {
          code: 'EMAIL_TOO_LONG',
          userMessage: `The email address can have a maximum length of 254`,
        },
      })

      const response = await superTest.request //
        .post('/oneTimeCode/request-code')
        .send({ email: 'user@aardvark.com' })

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('email address in the correct format')
    })

    it('should redirect to request-code page with errors given unhandled API failure', async () => {
      mockedSendLegalMailApi
        .post('/oneTimeCode/email', { email: 'user@aardvark.com.cjsm.net', sessionID: /.*/i })
        .reply(404)

      const response = await superTest.request //
        .post('/oneTimeCode/request-code')
        .send({ email: 'user@aardvark.com.cjsm.net' })

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('error generating your sign in code')
    })

    it('should redirect to request-code page with errors given validation errors', async () => {
      const response = await superTest.request //
        .post('/oneTimeCode/request-code')
        .send({ email: 'an invalid email address' })

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('email address in the correct format')
    })
  })

  describe('Smoke test', () => {
    it('should redirect smoke test to find recipient', async () => {
      config.smoketest = { msjSecret: undefined, lsjSecret: 'lsj-secret' }
      superTest.request.redirects(2) // two redirects happen with this request/response
      mockedSendLegalMailApi.post('/oneTimeCode/verify', { code: 'lsj-secret', sessionID: /.*/i }).reply(201, {
        token:
          'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
      })
      superTest.mockCjsmUser()

      const response = await superTest.request //
        .post('/oneTimeCode/request-code')
        .send({ email: 'lsj-secret' })

      assertThat(response).isOk().hasPageId('find-recipient-by-prison-number').hasNoErrors()
    })
  })
})
