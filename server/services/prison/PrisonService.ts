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

  async getPrison(prisonId: string): Promise<Prison> {
    return this.prisonRegisterService.getPrison(prisonId)
  }

  async getPrisonNameOrId(prisonId: string): Promise<string> {
    return this.prisonRegisterService.getPrisonNameOrId(prisonId)
  }

  async getSupportedPrisons(): Promise<Array<Prison>> {
    const [prisons, supportedPrisonCodes] = await Promise.all([
      this.prisonRegisterService.getActivePrisonsFromPrisonRegister(),
      this.supportedPrisonsService.getSupportedPrisons(),
    ])
    return this.supportedPrisons(prisons, supportedPrisonCodes.supportedPrisons)
  }

  async getPrisonsBySupported(): Promise<PrisonsBySupported> {
    const [prisons, supportedPrisonCodes] = await Promise.all([
      this.prisonRegisterService.getActivePrisonsFromPrisonRegister(),
      this.supportedPrisonsService.getSupportedPrisons(),
    ])
    return {
      supportedPrisons: this.supportedPrisons(prisons, supportedPrisonCodes.supportedPrisons),
      unsupportedPrisons: this.unsupportedPrisons(prisons, supportedPrisonCodes.supportedPrisons),
    }
  }

  async addSupportedPrison(userToken: string, prisonId: string): Promise<unknown> {
    return this.supportedPrisonsService.addSupportedPrison(userToken, prisonId)
  }

  async removeSupportedPrison(userToken: string, prisonId: string): Promise<unknown> {
    return this.supportedPrisonsService.removeSupportedPrison(userToken, prisonId)
  }

  private supportedPrisons(allPrisons: Array<Prison>, supportedPrisonCodes: Array<string>): Array<Prison> {
    return allPrisons.filter(prison => supportedPrisonCodes.includes(prison.id))
  }

  private unsupportedPrisons(allPrisons: Array<Prison>, supportedPrisonCodes: Array<string>): Array<Prison> {
    return allPrisons.filter(prison => !supportedPrisonCodes.includes(prison.id))
  }
}
