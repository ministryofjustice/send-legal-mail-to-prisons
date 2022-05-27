import type { Prison } from 'prisonTypes'
import PrisonRegisterService from './PrisonRegisterService'
import SupportedPrisonsService from './SupportedPrisonsService'

export type PrisonsBySupported = {
  supportedPrisons: Array<Prison>
  unsupportedPrisons: Array<Prison>
}

export default class PrisonService {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly supportedPrisonsService: SupportedPrisonsService
  ) {}

  async getPrisons(): Promise<Array<Prison>> {
    return this.prisonRegisterService.getActivePrisonsFromPrisonRegister()
  }

  async getSupportedPrisons(authToken: string): Promise<Array<Prison>> {
    const [prisons, supportedPrisonCodes] = await Promise.all([
      this.prisonRegisterService.getActivePrisonsFromPrisonRegister(),
      this.supportedPrisonsService.getSupportedPrisons(authToken),
    ])
    return this.supportedPrisons(prisons, supportedPrisonCodes.supportedPrisons)
  }

  async getPrisonsBySupported(authToken: string): Promise<PrisonsBySupported> {
    const [prisons, supportedPrisonCodes] = await Promise.all([
      this.prisonRegisterService.getActivePrisonsFromPrisonRegister(),
      this.supportedPrisonsService.getSupportedPrisons(authToken),
    ])
    return {
      supportedPrisons: this.supportedPrisons(prisons, supportedPrisonCodes.supportedPrisons),
      unsupportedPrisons: this.unsupportedPrisons(prisons, supportedPrisonCodes.supportedPrisons),
    }
  }

  private supportedPrisons(allPrisons: Array<Prison>, supportedPrisonCodes: Array<string>): Array<Prison> {
    return allPrisons.filter(prison => supportedPrisonCodes.includes(prison.id))
  }

  private unsupportedPrisons(allPrisons: Array<Prison>, supportedPrisonCodes: Array<string>): Array<Prison> {
    return allPrisons.filter(prison => !supportedPrisonCodes.includes(prison.id))
  }
}
