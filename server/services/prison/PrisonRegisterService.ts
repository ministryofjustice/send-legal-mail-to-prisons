import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'
import RestClient from '../../data/restClient'
import { PrisonDto } from '../../@types/prisonRegisterApiClientTypes'
import { Prison } from '../../@types/prisonTypes'

export default class PrisonRegisterService {
  constructor(private readonly prisonRegisterStore: PrisonRegisterStore) {}

  private static restClient(): RestClient {
    return new RestClient('Prison Register API Client', config.apis.prisonRegister)
  }

  async getActivePrisons(): Promise<Array<Prison>> {
    try {
      const activePrisons = await this.prisonRegisterStore.getActivePrisons()
      return activePrisons || this.retrieveAndCacheActivePrisons()
    } catch (error) {
      return this.retrieveAndCacheActivePrisons()
    }
  }

  private async retrieveAndCacheActivePrisons(): Promise<Array<Prison>> {
    try {
      // Active Prisons were not returned from the redis store. Retrieve them from the service and put them in the redis store.
      const prisonDtos = (await PrisonRegisterService.restClient().get({ path: '/prisons' })) as Array<PrisonDto>
      const activePrisons = prisonDtos
        .filter(prison => prison.active === true)
        .map(prisonDto => {
          return {
            id: prisonDto.prisonId,
            name: prisonDto.prisonName,
          }
        })
      this.prisonRegisterStore.setActivePrisons(activePrisons)
      return activePrisons
    } catch (error) {
      // There was an error calling the Prison Register API - return the error so it will be handled as part of the promise chain
      return error
    }
  }
}
