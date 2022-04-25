import type { Prison, PrisonAddress } from 'prisonTypes'
import type { PrisonDto, AddressDto } from 'prisonRegisterApiClient'
import config from '../../config'
import PrisonRegisterStore from '../../data/cache/PrisonRegisterStore'
import RestClient from '../../data/restClient'

export default class PrisonRegisterService {
  constructor(private readonly prisonRegisterStore: PrisonRegisterStore) {}

  private static restClient(): RestClient {
    return new RestClient('Prison Register API Client', config.apis.prisonRegister)
  }

  async getActivePrisonsFromPrisonRegister(): Promise<Array<Prison>> {
    let activePrisons: Array<PrisonAddress>
    try {
      activePrisons = await this.getActivePrisonDtos()
    } catch (error) {
      return error
    }

    return activePrisons
      .map(prison => {
        return {
          id: prison.agencyCode,
          name: prison.agyDescription,
        }
      })
      .sort((prison1: Prison, prison2: Prison) => (prison1.name < prison2.name ? -1 : 1))
  }

  async getPrisonAddress(prisonId: string): Promise<PrisonAddress> {
    const prisons: Array<PrisonAddress> = await this.getActivePrisonDtos()
    return prisons.find(prison => prison.agencyCode === prisonId)
  }

  /**
   * Returns the name of the prison (`premise` field from the PrisonAddress) for the specified prisonId
   * or simply the prisonId if the prison cannot be found by it's ID
   */
  async getPrisonNameOrId(prisonId: string): Promise<string> {
    const prison: PrisonAddress = await this.getPrisonAddress(prisonId)
    return prison?.premise || prisonId
  }

  private async retrieveAndCacheActivePrisons(): Promise<Array<PrisonAddress>> {
    // Retrieve prisons from the service and put the active ones in the redis store.
    const prisonDtos = (await PrisonRegisterService.restClient().get({ path: '/prisons' })) as Array<PrisonDto>
    const activePrisons: Array<PrisonAddress> = prisonDtos
      .filter(prison => prison.active === true)
      .map(prison => {
        const address = prison.addresses[0]
        return {
          agencyCode: prison.prisonId,
          agyDescription: prison.prisonName,
          premise: this.reformatPrisonName(prison.prisonName),
          ...this.buildAddressFields(address),
        }
      })
    this.prisonRegisterStore.setActivePrisons(activePrisons)
    return activePrisons
  }

  private async getActivePrisonDtos(): Promise<Array<PrisonAddress>> {
    // Retrieve the prisons from the redis store if they exist there, else get them from the service and cache them
    let activePrisons: Array<PrisonAddress>
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

  /**
   * Takes a prison name in the format '<name> (<type>)' and returns as '<type> <name>'
   * eg: 'Ashfield (HMP)' is returned as 'HMP Ashfield'
   */
  private reformatPrisonName(prisonName: string): string {
    const pattern = /^(.+?) \((.+?)\)/ // 1st matching group will be the prison name, 2nd matching group will be the type from within the brackets
    const matches = pattern.exec(prisonName)
    if (matches && matches.length > 1) {
      return `${matches[2]} ${matches[1]}`
    }
    return prisonName
  }

  private buildAddressFields(address: AddressDto): { street: string; locality: string; postalCode: string } {
    const locality = address.addressLine2 ? `${address.addressLine2}, ${address.town}` : address.town
    return {
      street: address.addressLine1,
      locality,
      postalCode: address.postcode,
    }
  }
}
