import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'
import RestClient from '../../data/restClient'
import { PrisonDto } from '../../@types/prisonRegisterApiClientTypes'
import { Prison, PrisonAddress } from '../../@types/prisonTypes'
import prisonAddressData from './prisonAddressData.json'

export default class PrisonRegisterService {
  constructor(private readonly prisonRegisterStore: PrisonRegisterStore) {}

  private static restClient(): RestClient {
    return new RestClient('Prison Register API Client', config.apis.prisonRegister)
  }

  async getActivePrisonsFromPrisonRegister(): Promise<Array<Prison>> {
    try {
      const activePrisons = await this.prisonRegisterStore.getActivePrisons()
      return activePrisons || this.retrieveAndCacheActivePrisons()
    } catch (error) {
      return this.retrieveAndCacheActivePrisons()
    }
  }

  // TODO due to bad data quality we are ignoring Prison Register for now - the plan is for Prison Register to be updated with our data when they have added the addresses on https://dsdmoj.atlassian.net/browse/HAAR-32
  getActivePrisons(): Array<Prison> {
    return prisonAddressData
      .map(
        (prisonAddress: PrisonAddress) =>
          ({ id: prisonAddress.agencyCode, name: prisonAddress.agyDescription } as Prison)
      )
      .sort((prison1: Prison, prison2: Prison) => (prison1.name < prison2.name ? -1 : 1))
  }

  async getPrisonAddress(prisonId: string): Promise<PrisonAddress> {
    const prisonAddress = prisonAddressData.find(row => row.agencyCode === prisonId)
    return prisonAddress
      ? Promise.resolve(this.strictCastToPrisonAddress(prisonAddress))
      : Promise.reject(new Error(`PrisonAddress for prison ${prisonId} not found`))
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

  private strictCastToPrisonAddress(source: {
    flat?: string
    premise?: string
    street?: string
    locality?: string
    countyCode?: string
    area?: string
    postalCode?: string
  }): PrisonAddress {
    return {
      flat: source.flat,
      premise: source.premise,
      street: source.street,
      locality: source.locality,
      countyCode: source.countyCode,
      area: source.area,
      postalCode: source.postalCode,
    }
  }
}
