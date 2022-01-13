import { Request } from 'express'
import validatePrisonNumber from './prisonNumberValidator'

describe('prisonNumberValidator', () => {
  const req = {
    flash: jest.fn(),
    body: { prisonNumber: undefined as string },
  }

  afterEach(() => {
    req.flash.mockReset()
    req.body = { prisonNumber: undefined as string }
  })

  Array.of('A1234BC', 'a1234bc', '  s1366pc', 'd1234pc  ', ' D4356cc   ').forEach(prisonNumber => {
    it(`should validate given valid prison number - '${prisonNumber}'`, () => {
      req.body.prisonNumber = prisonNumber

      const valid = validatePrisonNumber(req as unknown as Request)

      expect(valid).toBeTruthy()
      expect(req.flash).not.toHaveBeenCalled()
    })
  })

  Array.of(null, undefined, '').forEach(prisonNumber => {
    it(`should not validate given null/empty prison number - '${prisonNumber}'`, () => {
      req.body.prisonNumber = prisonNumber

      const valid = validatePrisonNumber(req as unknown as Request)

      expect(valid).toBeFalsy()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonNumber', text: 'Enter a prison number' }])
    })
  })

  Array.of('blah', 'A 1234 BC', 'a 1234 bc', 'a1234 bc', '1234ABC', 'AB1234A').forEach(prisonNumber => {
    it(`should not validate given invalid format prison number - '${prisonNumber}'`, () => {
      req.body.prisonNumber = prisonNumber

      const valid = validatePrisonNumber(req as unknown as Request)

      expect(valid).toBeFalsy()
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#prisonNumber', text: 'Enter the prison number in the correct format.' },
      ])
    })
  })
})
