import SuperTestWrapper from '../../fixtures/SuperTestWrapper'
import assertThat from '../../fixtures/supertest-assertions'

describe('Select envelope size', () => {
  const superTest = new SuperTestWrapper()

  beforeEach(async () => {
    await superTest.authenticateAsLegalSenderUser()
  })

  it('should redirect to request a link given user is not authenticated', async () => {
    await superTest.unauthenticated()

    const response = await superTest.request //
      .get('/barcode/pdf/select-envelope-size')

    assertThat(response).isOk().hasPageId('request-link').hasNoErrors()
  })

  it('should redirect to find recipient by prison number given no recipients have been added', async () => {
    superTest.request.redirects(2) // two redirects happen with this request/response

    const response = await superTest.request //
      .get('/barcode/pdf/select-envelope-size')

    assertThat(response).isOk().hasPageId('find-recipient-by-prison-number').hasNoErrors()
  })
})
