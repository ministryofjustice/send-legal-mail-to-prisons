import type { Prison } from 'prisonTypes'
import config from '../../../config'

export default function filterSupportedPrisons(activePrisons: Array<Prison>): Array<Prison> {
  if (!config.supportedPrisons || config.supportedPrisons === '') {
    return activePrisons
  }

  const supportedPrisons: Array<string> = config.supportedPrisons
    .split(',')
    .map(prisonId => prisonId.trim().toUpperCase())
  return activePrisons.filter(prison => supportedPrisons.includes(prison.id.toUpperCase()))
}
