import formatErrors from './errorFormatter'

describe('formatErrors', () => {
  it('should handle no errors', () => {
    expect(formatErrors('', [])).toEqual([])
  })

  it('should handle a single error', () => {
    expect(formatErrors('field', ['field in error'])).toEqual([{ href: '#field', text: 'field in error' }])
  })

  it('should handle multiple errors', () => {
    expect(formatErrors('field', ['field in error', 'second error'])).toEqual([
      { href: '#field', text: 'field in error' },
      { href: '#field', text: 'second error' },
    ])
  })
})
