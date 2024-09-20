import type { Prison } from 'prisonTypes'

export default interface PrisonRegisterStore {
  setActivePrisons(activePrisons: Array<Prison>, durationDays: number): Promise<void>
  getActivePrisons(): Promise<Array<Prison>>
}
