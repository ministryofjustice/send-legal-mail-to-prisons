import validateProblemDetail from './problemDetailValidator'

describe('problemDetailValidator', () => {
  Array.of(`Something bad happened which meant I couldn't continue with ...`).forEach(name => {
    it(`should validate given a valid name - ${name}`, () => {
      const errors = validateProblemDetail(name)

      expect(errors).toStrictEqual([])
    })
  })

  Array.of(null, undefined, '').forEach(problemDetail => {
    it(`should not validate given null/empty problem detail - '${problemDetail}'`, () => {
      const errors = validateProblemDetail(problemDetail)

      expect(errors).toStrictEqual(['Enter details of the problem you experienced'])
    })
  })

  it(`should not validate a problem detail that is too long'`, () => {
    const errors = validateProblemDetail('a'.repeat(501))

    expect(errors).toStrictEqual(['Details must be 500 characters or less'])
  })
})
