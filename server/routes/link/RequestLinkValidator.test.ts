import { Request } from 'express'
import type { RequestLinkForm } from 'forms'
import validate from './RequestLinkValidator'

describe('RequestLinkValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
    session: { requestLinkForm: {} },
  } as Request

  const validForm: RequestLinkForm = {
    email: 'an.email@domain.com.cjsm.net',
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

    it('should allow all special characters in the email', () => {
      const validEmailAddress = `a!l#l$t%h&e’s*p+e/c=i?a\`l'c{h|a}r~a^c-ters@some-domain.com.cjsm.net`
      const valid = validate({ email: validEmailAddress }, req)

      expect(valid).toBe(true)
    })

    it('should require cjsm.net at the end of the email', () => {
      const invalidEmailAddress = `a!l#l$t%h&e’s*p+e/c=i?a\`l'c{h|a}r~a^c-ters@some-domain.com`
      const valid = validate({ email: invalidEmailAddress }, req)

      expect(valid).toBe(false)
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
