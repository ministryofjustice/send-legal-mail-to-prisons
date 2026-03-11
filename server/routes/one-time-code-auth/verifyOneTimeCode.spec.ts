// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import config from '../../config'
import mockHmppsAuth from '../fixtures/mock-hmpps-auth'
import assertThat from '../fixtures/supertest-assertions'
import SuperTestWrapper from '../fixtures/SuperTestWrapper'

jest.mock('../../data/cache/TokenStore')

describe('Verify One Time Code Integration Tests', () => {
  const superTest = new SuperTestWrapper()
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockHmppsAuth()
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
  })

  afterEach(async () => {
    await superTest.cleanAll()
  })

  describe('verifyOneTimeCode - sad path', () => {
    it('should redirect to request-code if no code passed', async () => {
      superTest.request.redirects(2)
      const response = await superTest.request //
        .post('/oneTimeCode/verify-code')

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('code from your email')
    })

    it('should show error and redirect if the code is incorrect', async () => {
      superTest.request.redirects(2)
      mockedSendLegalMailApi
        .post('/oneTimeCode/verify', { code: 'some-code', sessionID: /.*/i })
        .reply(404, { errorCode: { code: 'OTC_NOT_FOUND' } })

      const response = await superTest.request //
        .post('/oneTimeCode/verify-code')
        .send({ code: 'some-code' })

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('code we emailed you')
    })

    it('should show error and redirect if the token verification fails', async () => {
      mockedSendLegalMailApi //
        .post('/oneTimeCode/verify', { code: 'some-code', sessionID: /.*/i })
        .reply(201, {
          token:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJhLm4ub3RoZXIudXNlckBkaWdpdGFsLmp1c3RpY2UuZ292LnVrIiwiZXhwIjo0Nzg3NTY5NzIxfQ==.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        })

      const response = await superTest.request //
        .post('/oneTimeCode/verify-code')
        .send({ code: 'some-code' })

      assertThat(response).isOk().hasPageId('request-one-time-code').hasError('code you used is no longer valid')
    })
  })

  describe('verify one time code - happy path', () => {
    it('should render find recipient by prison number', async () => {
      superTest.mockVerifyCode()
      superTest.mockCjsmUser()
      superTest.request.redirects(2) // two redirects happen with this request/response
      mockedSendLegalMailApi //
        .post('/oneTimeCode/verify', { code: 'some-code', sessionID: /.*/i })
        .reply(201, {
          token:
            'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
        })

      const response = await superTest.request //
        .post('/oneTimeCode/verify-code')
        .send({ code: 'some-code' })

      assertThat(response).isOk().hasPageId('find-recipient-by-prison-number').hasNoErrors()
    })
  })
})
