import type { PrisonAddress } from 'prisonTypes'
import filterSupportedPrisons from './filterSupportedPrisons'
import config from '../../../config'

jest.mock('../../../config')

describe('filterSupportedPrisons', () => {
  const prisons: Array<PrisonAddress> = [
    { agencyCode: 'AAA', agyDescription: 'A prison' },
    { agencyCode: 'BBB', agyDescription: 'Another prison' },
  ]

  it('should return all active prisons if no config restriction', () => {
    const filteredPrisons = filterSupportedPrisons(prisons)

    expect(filteredPrisons).toStrictEqual(prisons)
  })

  it('should return all active prisons if empty config restriction', () => {
    config.supportedPrisons = ''

    const filteredPrisons = filterSupportedPrisons(prisons)

    expect(filteredPrisons).toStrictEqual(prisons)
  })

  it('should filter a single prison', () => {
    config.supportedPrisons = 'AAA'

    const filteredPrisons = filterSupportedPrisons(prisons)

    expect(filteredPrisons).toEqual([{ agencyCode: 'AAA', agyDescription: 'A prison' }])
  })

  it('should filter multiple prisons', () => {
    config.supportedPrisons = 'AAA, BBB'

    const filteredPrisons = filterSupportedPrisons(prisons)

    expect(filteredPrisons).toEqual(prisons)
  })
})
