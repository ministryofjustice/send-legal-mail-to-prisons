import type { Prison } from 'prisonTypes'
import prisonsTableRowsFilter from './prisonsTableRowsFilter'

describe('prisonsTableRowFilter', () => {
  it('should render table rows', () => {
    const prisons = [
      { id: 'ABC', name: 'Prison ABC' },
      { id: 'CDE', name: 'Prison CDE' },
    ] as Array<Prison>

    const tableRows = prisonsTableRowsFilter(prisons)

    expect(tableRows).toEqual([
      [
        { text: 'ABC' },
        { text: 'Prison ABC' },
        expect.objectContaining({ html: expect.stringContaining('/supported-prisons/remove/ABC') }),
      ],
      [
        { text: 'CDE' },
        { text: 'Prison CDE' },
        expect.objectContaining({ html: expect.stringContaining('/supported-prisons/remove/CDE') }),
      ],
    ])
  })
})
