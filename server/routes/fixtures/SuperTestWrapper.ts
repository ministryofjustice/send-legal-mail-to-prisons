// eslint-disable-next-line import/no-extraneous-dependencies
import request, { Test } from 'supertest'
// eslint-disable-next-line import/no-extraneous-dependencies
import TestAgent from 'supertest/lib/agent'
// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import express from 'express'
import { promisify } from 'util'
import app from '../../index'
import config from '../../config'
import mockHmppsAuth from './mock-hmpps-auth'
import legalSenderJourneyAuthenticationStartPage from '../../middleware/legalSenderJourneyAuthenticationStartPage'

jest.mock('redis', () => {
  const redisMock = jest.requireActual('redis-mock')
  const enhancedRedisMock = {
    ...redisMock,
    createClient: () => {
      const client = redisMock.createClient()
      return {
        connect: jest.fn().mockResolvedValue(undefined).mockRejectedValue(undefined),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        // hSet: promisify(client.hset).bind(client),
        // hGet: promisify(client.hget).bind(client),
        // hDel: promisify(client.hdel).bind(client),
        // flushAll: promisify(client.flushall).bind(client),
        // setEx: promisify(client.setex).bind(client),
        // expire: promisify(client.expire).bind(client),
        // mGet: promisify(client.mget).bind(client),
        // pSetEx: (key: string, ms: number, value: string) => setEx(key, ms / 1000, value),
        on: jest.fn().mockReturnValue(new Error()),
        // Add additional functions as needed...
      }
    },
  }

  return enhancedRedisMock
})

export default class SuperTestWrapper {
  request: TestAgent<Test>

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
  }

  unauthenticated = async () => {
    mockHmppsAuth()
    await this.request.get(`${legalSenderJourneyAuthenticationStartPage()}?force=true`) // log out legal sender user
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

  mockContactNameNotFound = (name: string) => {
    nock(config.apis.sendLegalMail.url).get(`/contacts?name=${name}`).reply(404)
  }

  mockContactNumberExists = (prisonNumber: string) => {
    nock(config.apis.sendLegalMail.url).get(`/contact/prisonNumber/${prisonNumber}`).reply(200, {
      id: 1,
      prisonerName: 'any name',
      prisonId: 'LEI',
      prisonNumber,
    })
  }

  mockContactNumberNotFound = (prisonNumber: string) => {
    nock(config.apis.sendLegalMail.url).get(`/contact/prisonNumber/${prisonNumber}`).reply(404)
  }

  cleanAll = async () => {
    nock.cleanAll()
  }
}
