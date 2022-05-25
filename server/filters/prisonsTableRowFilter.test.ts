import prisonsTableRowsFilter from './prisonsTableRowsFilter'

describe('prisonsTableRowFilter', () => {
  it('should render table rows', () => {
    const prisons = ['ABC', 'CDE']

    const tableRows = prisonsTableRowsFilter(prisons)

    expect(tableRows).toEqual([
      [
        { text: 'ABC' },
        { text: 'ABC' },
        expect.objectContaining({ html: expect.stringContaining('/supported-prisons/remove/ABC') }),
      ],
      [
        { text: 'CDE' },
        { text: 'CDE' },
        expect.objectContaining({ html: expect.stringContaining('/supported-prisons/remove/CDE') }),
      ],
    ])
  })
})
