import type { Prison } from 'prisonTypes'
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
    let activePrisons: Array<Prison>
    try {
      activePrisons = await this.getActivePrisons()
    } catch (error) {
      return error
    }
    return activePrisons.sort((prison1: Prison, prison2: Prison) => (prison1.name < prison2.name ? -1 : 1))
  }

  async getPrison(prisonId: string): Promise<Prison> {
    const prisons: Array<Prison> = await this.getActivePrisons()
    return prisons.find(prison => prison.id === prisonId)
  }

  /**
   * Returns the name of the prison for the specified prisonId
   * or simply the prisonId if the prison cannot be found by it's ID
   */
  async getPrisonNameOrId(prisonId: string): Promise<string> {
    const prison: Prison = await this.getPrison(prisonId)
    return prison?.addressName || prisonId
  }

  private async retrieveAndCacheActivePrisons(): Promise<Array<Prison>> {
    // Retrieve prisons from the service and put the active ones in the redis store.
    const prisonDtos = (await PrisonRegisterService.restClient().get({ path: '/prisons' })) as Array<PrisonDto>
    const activePrisons: Array<Prison> = prisonDtos
      .filter(prison => prison.active === true)
      .map(prison => {
        const address = prison.addresses[0]
        return {
          id: prison.prisonId,
          name: prison.prisonName,
          addressName: this.reformatPrisonName(prison.prisonName),
          ...this.buildAddressFields(address),
        }
      })
    this.prisonRegisterStore.setActivePrisons(activePrisons)
    return activePrisons
  }

  private async getActivePrisons(): Promise<Array<Prison>> {
    // Retrieve the prisons from the redis store if they exist there, else get them from the service and cache them
    let activePrisons: Array<Prison>
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
