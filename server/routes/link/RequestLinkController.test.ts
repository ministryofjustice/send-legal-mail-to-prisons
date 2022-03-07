import request from 'supertest'
import express from 'express'
import cheerio from 'cheerio'
import nock from 'nock'
import app from '../../index'
import config from '../../config'
import mockHmppsAuth from '../fixtures/mock-hmpps-auth'

jest.mock('redis', () => jest.requireActual('redis-mock'))

describe('RequestLinkController', () => {
  const application: express.Application = app()
  let agent: request.SuperAgentTest

  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockHmppsAuth()
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
    agent = request.agent(application)
    agent.set('Content-Type', 'application/x-www-form-urlencoded').redirects(1)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should render page to request a link', async () => {
    const response = await agent //
      .get('/link/request-link')

    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.text)
    expect($('#request-link').length).toBe(1)
    expect($('.govuk-error-summary__list').length).toBe(0)
  })

  it('should redirect to email-sent page', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com.cjsm.net' }).reply(201)

    const response = await agent //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com.cjsm.net' })

    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.text)
    expect($('#email-sent').length).toBe(1)
    expect($('.govuk-error-summary__list').length).toBe(0)
  })

  it('should redirect to request-link page with errors given non CJSM address', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com' }).reply(400, {
      status: 400,
      errorCode: {
        code: 'INVALID_CJSM_EMAIL',
        userMessage: `Enter an email address which ends with 'cjsm.net'`,
      },
    })

    const response = await agent //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com' })

    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.text)
    expect($('#request-link').length).toBe(1)
    expect($('.govuk-error-summary__list').length).toBe(1)
    expect($('.govuk-error-summary__list').text()).toContain('email address in the correct format')
  })

  it('should redirect to request-link page with errors given email address too long', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com' }).reply(400, {
      status: 400,
      errorCode: {
        code: 'EMAIL_TOO_LONG',
        userMessage: `The email address can have a maximum length of 254`,
      },
    })

    const response = await agent //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com' })

    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.text)
    expect($('#request-link').length).toBe(1)
    expect($('.govuk-error-summary__list').length).toBe(1)
    expect($('.govuk-error-summary__list').text()).toContain('email address in the correct format')
  })

  it('should redirect to request-link page with errors given unhandled API failure', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com' }).reply(404)

    const response = await agent //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com' })

    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.text)
    expect($('#request-link').length).toBe(1)
    expect($('.govuk-error-summary__list').length).toBe(1)
    expect($('.govuk-error-summary__list').text()).toContain('error generating your sign in link')
  })

  it('should redirect to request-link page with errors given validation errors', async () => {
    const response = await agent //
      .post('/link/request-link')
      .send({ email: 'an invalid email address' })

    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.text)
    expect($('#request-link').length).toBe(1)
    expect($('.govuk-error-summary__list').length).toBe(1)
    expect($('.govuk-error-summary__list').text()).toContain('email address in the correct format')
  })
})
