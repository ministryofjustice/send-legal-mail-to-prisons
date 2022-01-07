// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import PrisonRegisterService from './PrisonRegisterService'
import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'

const prisonRegisterStore = {
  setActivePrisons: jest.fn(),
  getActivePrisons: jest.fn(),
}

describe('Prison Register Service', () => {
  let prisonRegisterService: PrisonRegisterService
  let mockedPrisonRegisterApi: nock.Scope

  beforeEach(() => {
    mockedPrisonRegisterApi = nock(config.apis.prisonRegister.url)
    prisonRegisterService = new PrisonRegisterService(prisonRegisterStore as unknown as PrisonRegisterStore)
  })

  afterEach(() => {
    nock.cleanAll()
    prisonRegisterStore.getActivePrisons.mockReset()
    prisonRegisterStore.setActivePrisons.mockReset()
  })

  describe('getActivePrisons', () => {
    it('should make the request to the prison register without an authorization header', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      nock(config.apis.prisonRegister.url, {
        badheaders: ['authorization'],
      })
        .get('/prisons')
        .reply(200, [])

      await prisonRegisterService.getActivePrisons()
    })

    it('should get all active prisons from the prison register given they are not in the redis store', async () => {
      prisonRegisterStore.getActivePrisons.mockResolvedValue(null)
      mockedPrisonRegisterApi.get('/prisons').reply(200, [
        { prisonId: 'ALI', prisonName: 'Albany (HMP)', active: false },
        { prisonId: 'AKI', prisonName: 'Acklington (HMP)', active: false },
        { prisonId: 'KTI', prisonName: 'Kennet (HMP)', active: true },
        { prisonId: 'ACI', prisonName: 'Altcourse (HMP)', active: true },
        { prisonId: 'ASI', prisonName: 'Ashfield (HMP)', active: true },
      ])

      const expectedActivePrisons = [
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const activePrisons = await prisonRegisterService.getActivePrisons()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(expectedActivePrisons)
    })

    it('should get all active prisons from the prison register given reading from redis throws an error', async () => {
      prisonRegisterStore.getActivePrisons.mockRejectedValue('some error reading from redis')
      mockedPrisonRegisterApi.get('/prisons').reply(200, [
        { prisonId: 'ALI', prisonName: 'Albany (HMP)', active: false },
        { prisonId: 'AKI', prisonName: 'Acklington (HMP)', active: false },
        { prisonId: 'KTI', prisonName: 'Kennet (HMP)', active: true },
        { prisonId: 'ACI', prisonName: 'Altcourse (HMP)', active: true },
        { prisonId: 'ASI', prisonName: 'Ashfield (HMP)', active: true },
      ])

      const expectedActivePrisons = [
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
      ]

      const activePrisons = await prisonRegisterService.getActivePrisons()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(expectedActivePrisons)
    })

    it('should get all active prisons from the prison register store given they are already in the redis store', async () => {
      const expectedActivePrisons = [
        { id: 'KTI', name: 'Kennet (HMP)' },
        { id: 'ASI', name: 'Ashfield (HMP)' },
        { id: 'ACI', name: 'Altcourse (HMP)' },
      ]
      prisonRegisterStore.getActivePrisons.mockResolvedValue(expectedActivePrisons)

      const activePrisons = await prisonRegisterService.getActivePrisons()

      expect(activePrisons).toStrictEqual(expectedActivePrisons)
      expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
    })
  })
})
