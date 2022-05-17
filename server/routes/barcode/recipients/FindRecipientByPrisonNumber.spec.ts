import SuperTestWrapper from '../../fixtures/SuperTestWrapper'
import mockHmppsAuth from '../../fixtures/mock-hmpps-auth'
import assertThat from '../../fixtures/supertest-assertions'

describe('Find recipient by prison number', () => {
  const superTest = new SuperTestWrapper()

  beforeEach(() => {
    mockHmppsAuth()
  })

  afterEach(async () => {
    await superTest.cleanAll()
  })

  it(`should redirect to sign-in`, async () => {
    const response = await superTest.request //
      .get('/barcode/find-recipient/by-prison-number')

    assertThat(response).isOk().hasPageId('request-one-time-code')
  })

  it(`should show errors`, async () => {
    await superTest.authenticateAsLegalSenderUser()

    const response = await superTest.request //
      .post('/barcode/find-recipient/by-prison-number')
      .send({
        prisonNumber: '',
      })

    assertThat(response).isOk().hasPageId('find-recipient-by-prison-number').hasError('prison number')
  })

  it('should accept new contact number and redirect to create contact page', async () => {
    await superTest.authenticateAsLegalSenderUser()
    await superTest.mockContactNumberNotFound('A1234BC')
    await superTest.request.get('/barcode/find-recipient/by-prison-number')

    const response = await superTest.request //
      .post('/barcode/find-recipient/by-prison-number')
      .send({
        prisonNumber: 'A1234BC',
      })

    assertThat(response).isOk().hasPageId('create-new-contact-by-prison-number')
  })

  it('should accept existing contact number and redirect to review recipients page', async () => {
    await superTest.authenticateAsLegalSenderUser()
    await superTest.mockContactNumberExists('A1234BC')
    await superTest.request.get('/barcode/find-recipient/by-prison-number')

    const response = await superTest.request //
      .post('/barcode/find-recipient/by-prison-number')
      .send({
        prisonNumber: 'A1234BC',
      })

    assertThat(response).isOk().hasPageId('review-recipients')
  })
})
