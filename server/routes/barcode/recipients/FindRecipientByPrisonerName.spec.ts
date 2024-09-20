import SuperTestWrapper from '../../fixtures/SuperTestWrapper'
import mockHmppsAuth from '../../fixtures/mock-hmpps-auth'
import assertThat from '../../fixtures/supertest-assertions'
import mockPrisonRegister from '../../fixtures/mock-prison-register'

describe('Find recipient by prisoner name', () => {
  const superTest = new SuperTestWrapper()

  beforeEach(() => {
    mockHmppsAuth()
    mockPrisonRegister()
  })

  afterEach(async () => {
    await superTest.cleanAll()
  })

  it(`should redirect to sign-in`, async () => {
    const response = await superTest.request //
      .get('/barcode/find-recipient/by-prisoner-name')

    assertThat(response).isOk().hasPageId('request-one-time-code')
  })

  it.only(`should show errors`, async () => {
    await superTest.authenticateAsLegalSenderUser()

    const response = await superTest.request //
      .post('/barcode/find-recipient/by-prisoner-name')
      .send({
        prisonerName: '',
      })

    assertThat(response).isOk().hasPageId('find-recipient-by-prisoner-name').hasError('full name')
  })

  it('should accept new contact name and redirect to create contact page', async () => {
    await superTest.authenticateAsLegalSenderUser()
    await superTest.mockContactNameNotFound('some-name')
    await superTest.request.get('/barcode/find-recipient/by-prison-number')
    await superTest.request.get('/barcode/find-recipient/by-prisoner-name')

    const response = await superTest.request //
      .post('/barcode/find-recipient/by-prisoner-name')
      .send({
        prisonerName: 'some-name',
      })

    assertThat(response).isOk().hasPageId('create-new-contact-by-prisoner-name')
  })

  it('should accept existing contact name and redirect to choose contact page', async () => {
    await superTest.authenticateAsLegalSenderUser()
    await superTest.mockContactNameExists('some-name')
    await superTest.request.get('/barcode/find-recipient/by-prison-number')
    await superTest.request.get('/barcode/find-recipient/by-prisoner-name')

    const response = await superTest.request //
      .post('/barcode/find-recipient/by-prisoner-name')
      .send({
        prisonerName: 'some-name',
      })

    assertThat(response).isOk().hasPageId('choose-contact')
  })
})
