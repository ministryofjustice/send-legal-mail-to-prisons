import SuperTestWrapper from '../../fixtures/SuperTestWrapper'
import assertThat from '../../fixtures/supertest-assertions'

jest.mock('../../../data/cache/TokenStore')

describe('Select envelope size', () => {
  const superTest = new SuperTestWrapper()

  afterEach(async () => {
    await superTest.cleanAll()
  })

  it('should redirect to request one time code given user is not authenticated', async () => {
    await superTest.unauthenticated()

    const response = await superTest.request //
      .get('/barcode/pdf/select-envelope-size')

    assertThat(response).isOk().hasPageId('request-one-time-code').hasNoErrors()
  })

  it('should redirect to find recipient by prison number given no recipients have been added', async () => {
    await superTest.authenticateAsLegalSenderUser()
    superTest.request.redirects(2) // two redirects happen with this request/response

    const response = await superTest.request //
      .get('/barcode/pdf/select-envelope-size')

    assertThat(response).isOk().hasPageId('find-recipient-by-prison-number').hasNoErrors()
  })
})
