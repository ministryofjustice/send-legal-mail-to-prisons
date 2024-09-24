/* eslint-disable import/no-extraneous-dependencies */
import request, { Test } from 'supertest'
import TestAgent from 'supertest/lib/agent'
import nock from 'nock'
/* eslint-enable import/no-extraneous-dependencies */
import express from 'express'
import app from '../../index'
import config from '../../config'
import mockHmppsAuth from './mock-hmpps-auth'
import legalSenderJourneyAuthenticationStartPage from '../../middleware/legalSenderJourneyAuthenticationStartPage'

jest.mock('../../data/redisClient', () => {
  return {
    createRedisClient: () => {
      return {
        connect: jest.fn().mockResolvedValue(undefined).mockRejectedValue(undefined),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn().mockReturnValue(new Error()),
        isOpen: true,
      }
    },
  }
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
          'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4YmJlZmMyMS05ZmE4LTQzYmEtYWE5Mi02M2NlNDAwYzFkZDYiLCJzdWIiOiJwYXVsLnNvbGVja2lAZGlnaXRhbC5qdXN0aWNlLmdvdi51ay5janNtLm5ldCIsImV4cCI6MTcyNzIyMjQwMCwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TTE1fQ1JFQVRFX0JBUkNPREUiXSwiY2xpZW50X2lkIjoic2VuZC1sZWdhbC1tYWlsIiwidXNlcl9uYW1lIjoicGF1bC5zb2xlY2tpQGRpZ2l0YWwuanVzdGljZS5nb3YudWsuY2pzbS5uZXQifQ.2OSD0yH8JB42KdR-GVdGXWTRZKiD2i-vIMgZybD8mqcBCqVwYhP4UuLWGjaa2RSr9yvjXP6-DsaFZvvZ05vl482JfougMlzd_3v6uDvebCR0o8QJWw-aidee7q-uNVJQianvtsrsPjiETzW--m90KxsH34u0iBC5MECuT-O37l6XAWtvqXZCHUJ9x-Jay51E4ayPa-n4G8xoHdWQeBxKAPIQiu7UaPFYaogELfYKBhs5pnfGkmiouHtzfJFzUWZXTINX9tFEvE5TtfV5ZdkjS5aS57TX14p4iqGg1xZu0RTu7ImegpwkoxllfdOjrjGTN5L13S-kSczWZdnvuLepnFS6aS_j-Fz_UzSlJlprH4GpOcJCh0wbE6p3_5t9qCfHcgt1apx17rrIThl0R7EPYcUS7eS1mfi1Zp5t-cMsfJlb8eMX3vnnfWkV2pad61uRXA6_8id40yGkXq11K08O-WxH85H4EK1Yk-ihLnd2WSra1nuvhN6dbaPb88b9Gdvz',
      })
  }

  mockVerifyLink = () => {
    nock(config.apis.sendLegalMail.url).post('/link/verify', { secret: 'some-secret' }).reply(201, {
      token:
        'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4YmJlZmMyMS05ZmE4LTQzYmEtYWE5Mi02M2NlNDAwYzFkZDYiLCJzdWIiOiJwYXVsLnNvbGVja2lAZGlnaXRhbC5qdXN0aWNlLmdvdi51ay5janNtLm5ldCIsImV4cCI6MTcyNzIyMjQwMCwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TTE1fQ1JFQVRFX0JBUkNPREUiXSwiY2xpZW50X2lkIjoic2VuZC1sZWdhbC1tYWlsIiwidXNlcl9uYW1lIjoicGF1bC5zb2xlY2tpQGRpZ2l0YWwuanVzdGljZS5nb3YudWsuY2pzbS5uZXQifQ.2OSD0yH8JB42KdR-GVdGXWTRZKiD2i-vIMgZybD8mqcBCqVwYhP4UuLWGjaa2RSr9yvjXP6-DsaFZvvZ05vl482JfougMlzd_3v6uDvebCR0o8QJWw-aidee7q-uNVJQianvtsrsPjiETzW--m90KxsH34u0iBC5MECuT-O37l6XAWtvqXZCHUJ9x-Jay51E4ayPa-n4G8xoHdWQeBxKAPIQiu7UaPFYaogELfYKBhs5pnfGkmiouHtzfJFzUWZXTINX9tFEvE5TtfV5ZdkjS5aS57TX14p4iqGg1xZu0RTu7ImegpwkoxllfdOjrjGTN5L13S-kSczWZdnvuLepnFS6aS_j-Fz_UzSlJlprH4GpOcJCh0wbE6p3_5t9qCfHcgt1apx17rrIThl0R7EPYcUS7eS1mfi1Zp5t-cMsfJlb8eMX3vnnfWkV2pad61uRXA6_8id40yGkXq11K08O-WxH85H4EK1Yk-ihLnd2WSra1nuvhN6dbaPb88b9Gdvz',
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
