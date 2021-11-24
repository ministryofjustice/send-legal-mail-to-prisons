import { Request } from 'express'
import type { RequestLinkForm } from 'forms'
import validate from './RequestLinkValidator'

describe('RequestLinkValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
    session: { requestLinkForm: {} },
  } as Request

  const validForm: RequestLinkForm = {
    email: 'an.email@domain.com',
  }

  describe('validate RequestLinkForm', () => {
    it('should validate given valid email address', async () => {
      const form = { ...validForm }
      const valid = validate(form, req)

      expect(valid).toBe(true)
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('should not validate given invalid email address', async () => {
      const form = { email: 'invalid-email' }
      const valid = validate(form, req)

      expect(valid).toBe(false)
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#email', text: 'Enter an email address in the correct format' },
      ])
    })

    it('should not validate given empty form', async () => {
      const form = {}
      const valid = validate(form, req)

      expect(valid).toBe(false)
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#email', text: 'Enter an email address in the correct format' },
      ])
    })
  })
})
