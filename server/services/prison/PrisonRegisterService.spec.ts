// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import PrisonRegisterService from './PrisonRegisterService'
import config from '../../config'

describe('Magic Link Service', () => {
  let prisonRegisterService: PrisonRegisterService
  let mockedPrisonRegisterApi: nock.Scope

  beforeEach(() => {
    mockedPrisonRegisterApi = nock(config.apis.prisonRegister.url)
    prisonRegisterService = new PrisonRegisterService()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getActivePrisons', () => {
    it('should make the request to the prison register without an authorization header', done => {
      nock(config.apis.prisonRegister.url, {
        badheaders: ['authorization'],
      })
        .get('/prisons')
        .reply(200, [])

      prisonRegisterService.getActivePrisons().then(() => done())
    })

    it('should get all active prisons from the prison register', done => {
      mockedPrisonRegisterApi.get('/prisons').reply(200, [
        { prisonId: 'ALI', prisonName: 'Albany (HMP)', active: false },
        { prisonId: 'AKI', prisonName: 'Acklington (HMP)', active: false },
        { prisonId: 'KTI', prisonName: 'Kennet (HMP)', active: true },
        { prisonId: 'ACI', prisonName: 'Altcourse (HMP)', active: true },
        { prisonId: 'ASI', prisonName: 'Ashfield (HMP)', active: true },
      ])

      prisonRegisterService.getActivePrisons().then(activePrisons => {
        expect(activePrisons).toStrictEqual([
          { id: 'KTI', name: 'Kennet (HMP)' },
          { id: 'ACI', name: 'Altcourse (HMP)' },
          { id: 'ASI', name: 'Ashfield (HMP)' },
        ])
        done()
      })
    })
  })
})
