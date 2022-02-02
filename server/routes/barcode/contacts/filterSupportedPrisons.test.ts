import type { Prison } from 'prisonTypes'
import filterSupportedPrisons from './filterSupportedPrisons'
import config from '../../../config'

jest.mock('../../../config')

describe('filterSupportedPrisons', () => {
  const prisons: Array<Prison> = [
    { id: 'AAA', name: 'A prison' },
    { id: 'BBB', name: 'Another prison' },
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

    expect(filteredPrisons).toEqual([{ id: 'AAA', name: 'A prison' }])
  })

  it('should filter multiple prisons', () => {
    config.supportedPrisons = 'AAA, BBB'

    const filteredPrisons = filterSupportedPrisons(prisons)

    expect(filteredPrisons).toEqual(prisons)
  })
})
