// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import config from '../../config'
import mockHmppsAuth from '../fixtures/mock-hmpps-auth'
import assertThat from '../fixtures/supertest-assertions'
import SuperTestWrapper from '../fixtures/SuperTestWrapper'

describe('Request Link', () => {
  const superTest = new SuperTestWrapper()
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockHmppsAuth()
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should render page to request a link', async () => {
    const response = await superTest.request //
      .get('/link/request-link')

    assertThat(response).isOk().hasPageId('request-link').hasNoErrors()
  })

  it('should redirect to email-sent page', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com.cjsm.net' }).reply(201)

    const response = await superTest.request //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com.cjsm.net' })

    assertThat(response).isOk().hasPageId('email-sent').hasNoErrors()
  })

  it('should redirect to request-link page with errors given non CJSM address', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com' }).reply(400, {
      status: 400,
      errorCode: {
        code: 'INVALID_CJSM_EMAIL',
        userMessage: `Enter an email address which ends with 'cjsm.net'`,
      },
    })

    const response = await superTest.request //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com' })

    assertThat(response).isOk().hasPageId('request-link').hasError('email address in the correct format')
  })

  it('should redirect to request-link page with errors given email address too long', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com' }).reply(400, {
      status: 400,
      errorCode: {
        code: 'EMAIL_TOO_LONG',
        userMessage: `The email address can have a maximum length of 254`,
      },
    })

    const response = await superTest.request //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com' })

    assertThat(response).isOk().hasPageId('request-link').hasError('email address in the correct format')
  })

  it('should redirect to request-link page with errors given unhandled API failure', async () => {
    mockedSendLegalMailApi.post('/link/email', { email: 'user@aardvark.com' }).reply(404)

    const response = await superTest.request //
      .post('/link/request-link')
      .send({ email: 'user@aardvark.com' })

    assertThat(response).isOk().hasPageId('request-link').hasError('error generating your sign in link')
  })

  it('should redirect to request-link page with errors given validation errors', async () => {
    const response = await superTest.request //
      .post('/link/request-link')
      .send({ email: 'an invalid email address' })

    assertThat(response).isOk().hasPageId('request-link').hasError('email address in the correct format')
  })
})
