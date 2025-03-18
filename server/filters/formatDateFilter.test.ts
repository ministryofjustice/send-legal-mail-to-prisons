import formatDateFilter from './formatDateFilter'

describe('formatDateFilter', () => {
  describe('should format date given different date patterns', () => {
    const sourceDate = '2001-12-15'
    Array.of(
      { pattern: 'DD-MM-YYYY', expected: '15-12-2001' },
      { pattern: 'DD MMM YYYY', expected: '15 Dec 2001' },
      { pattern: 'DD MMMM YYYY', expected: '15 December 2001' },
    ).forEach(spec => {
      it(`pattern: ${spec.pattern}, expected: ${spec.expected}`, () => {
        expect(formatDateFilter(sourceDate, spec.pattern)).toEqual(spec.expected)
      })
    })
  })

  describe('should not format date given invalid source dates', () => {
    Array.of(
      { sourceDate: null, expected: null },
      { sourceDate: undefined, expected: undefined },
      { sourceDate: 'not a date', expected: 'not a date' },
    ).forEach(spec => {
      it(`sourceDate: ${spec.sourceDate}, expected: ${spec.expected}`, () => {
        expect(formatDateFilter(spec.sourceDate, 'DD-MM-YYYY')).toEqual(spec.expected)
      })
    })
  })

  describe('should format date as ISO8601 given null date patterns', () => {
    const sourceDate = '2001-12-15'
    Array.of(
      { pattern: null, expected: '2001-12-15T00:00:00+00:00' },
      { pattern: undefined, expected: '2001-12-15T00:00:00+00:00' },
    ).forEach(spec => {
      it(`pattern: ${spec.pattern}, expected: ${spec.expected}`, () => {
        expect(formatDateFilter(sourceDate, spec.pattern)).toEqual(spec.expected)
      })
    })
  })
})
