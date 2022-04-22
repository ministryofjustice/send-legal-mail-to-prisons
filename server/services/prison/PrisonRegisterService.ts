import type { Prison, PrisonAddress } from 'prisonTypes'
import type { PrisonDto } from 'prisonRegisterApiClient'
import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'
import RestClient from '../../data/restClient'
import prisonAddressData from './prisonAddressData.json'

export default class PrisonRegisterService {
  constructor(private readonly prisonRegisterStore: PrisonRegisterStore) {}

  private static restClient(): RestClient {
    return new RestClient('Prison Register API Client', config.apis.prisonRegister)
  }

  async getActivePrisonsFromPrisonRegister(): Promise<Array<Prison>> {
    let activePrisons: Array<PrisonDto>
    try {
      activePrisons = await this.getActivePrisonDtos()
    } catch (error) {
      return error
    }

    return activePrisons.map(prisonDto => {
      return {
        id: prisonDto.prisonId,
        name: prisonDto.prisonName,
      }
    })
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

  /**
   * Returns the name of the prison (`premise` field from the PrisonAddress) for the specified prisonId
   * or simply the prisonId if the prison cannot be found by it's ID
   */
  getPrisonNameOrId(prisonId: string): string {
    const prisonAddress = prisonAddressData.find(row => row.agencyCode === prisonId)
    return prisonAddress?.premise || prisonId
  }

  private async retrieveAndCacheActivePrisons(): Promise<Array<PrisonDto>> {
    // Retrieve prisons from the service and put the active ones in the redis store.
    const prisonDtos = (await PrisonRegisterService.restClient().get({ path: '/prisons' })) as Array<PrisonDto>
    const activePrisons = prisonDtos.filter(prison => prison.active === true)
    this.prisonRegisterStore.setActivePrisons(activePrisons)
    return activePrisons
  }

  private async getActivePrisonDtos(): Promise<Array<PrisonDto>> {
    // Retrieve the prisons from the redis store if they exist there, else get them from the service and cache them
    let activePrisons: Array<PrisonDto>
    try {
      activePrisons = await this.prisonRegisterStore.getActivePrisons()
    } catch (error) {
      // no op
    }
    if (!activePrisons) {
      activePrisons = await this.retrieveAndCacheActivePrisons()
    }
    return activePrisons
  }

  private strictCastToPrisonAddress(source: {
    agencyCode?: string
    flat?: string
    premise?: string
    street?: string
    locality?: string
    countyCode?: string
    area?: string
    postalCode?: string
  }): PrisonAddress {
    return {
      agencyCode: source.agencyCode,
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
