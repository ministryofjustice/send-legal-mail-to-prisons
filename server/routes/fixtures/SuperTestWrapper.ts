// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest'
// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import express from 'express'
import app from '../../index'
import config from '../../config'
import mockHmppsAuth from './mock-hmpps-auth'
import legalSenderJourneyAuthenticationStartPage from '../../middleware/legalSenderJourneyAuthenticationStartPage'

jest.mock('redis', () => jest.requireActual('redis-mock'))

export default class SuperTestWrapper {
  request: request.SuperAgentTest

  mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)

  constructor() {
    config.featureFlags.lsjOneTimeCodeAuthEnabled = true
    const application: express.Application = app()
    this.request = request.agent(application)
    this.request //
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .redirects(1)
  }

  authenticateAsLegalSenderUser = async () => {
    mockHmppsAuth()
    this.mockVerifyCode()
    this.mockCjsmUser()

    await this.request.post('/oneTimeCode/verify-code').send({ code: 'some-code' })
    nock.cleanAll()
  }

  unauthenticated = async () => {
    mockHmppsAuth()
    await this.request.get(`${legalSenderJourneyAuthenticationStartPage()}?force=true`) // log out legal sender user
    nock.cleanAll()
  }

  mockCjsmUser = () => {
    nock(config.apis.sendLegalMail.url).get('/cjsm/user/me').reply(200, {
      userId: 'some.user@company.com.cjsm.net',
      organisation: 'some-org',
      organisationType: 'some-type',
      townOrCity: 'some-town',
    })
  }

  mockVerifyCode = () => {
    nock(config.apis.sendLegalMail.url)
      .post('/oneTimeCode/verify', { code: 'some-code', sessionID: /.*/i })
      .reply(201, {
        token:
          'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
      })
  }

  mockVerifyLink = () => {
    nock(config.apis.sendLegalMail.url).post('/link/verify', { secret: 'some-secret' }).reply(201, {
      token:
        'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
    })
  }

  mockContactNameExists = (name: string) => {
    nock(config.apis.sendLegalMail.url)
      .get(`/contacts?name=${name}`)
      .reply(200, [
        {
          id: 1,
          prisonerName: name,
          prisonId: 'LEI',
          dob: '1990-01-02',
        },
      ])
  }

  mockContactNumberExists = (prisonNumber: string) => {
    nock(config.apis.sendLegalMail.url).get(`/contact/prisonNumber/${prisonNumber}`).reply(200, {
      id: 1,
      prisonerName: 'any name',
      prisonId: 'LEI',
      prisonNumber,
    })
  }

  cleanAll = async () => {
    nock.cleanAll()
  }
}
