import type { PrisonAddress } from 'prisonTypes'
import config from '../../../config'

export default function filterSupportedPrisons(activePrisons: Array<PrisonAddress>): Array<PrisonAddress> {
  if (!config.supportedPrisons || config.supportedPrisons === '') {
    return activePrisons
  }

  const supportedPrisons: Array<string> = config.supportedPrisons
    .split(',')
    .map(prisonId => prisonId.trim().toUpperCase())
  return activePrisons.filter(prison => supportedPrisons.includes(prison.agencyCode.toUpperCase()))
}
