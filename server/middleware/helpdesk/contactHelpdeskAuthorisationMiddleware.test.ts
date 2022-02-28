import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import contactHelpdeskAuthorisationMiddleware from './contactHelpdeskAuthorisationMiddleware'

function createToken(authorities: string[]) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

describe('contactHelpdeskAuthorisationMiddleware', () => {
  const req = { originalUrl: '/scan-barcode/contact-helpdesk' } as unknown as Request
  const next = jest.fn()

  function createResWithToken({ authorities }: { authorities: string[] }): Response {
    return {
      locals: {
        user: {
          token: createToken(authorities),
        },
      },
      redirect: (redirectUrl: string) => {
        return redirectUrl
      },
    } as unknown as Response
  }

  function createUnauthenticatedRes(): Response {
    return {
      locals: {},
      redirect: (redirectUrl: string) => {
        return redirectUrl
      },
    } as unknown as Response
  }

  it('should return next given user has an authorised role', () => {
    const res = createResWithToken({ authorities: ['SOME_REQUIRED_ROLE'] })

    const authorisationResponse = contactHelpdeskAuthorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })

  it('should redirect to authError given user has no authorised roles', () => {
    const res = createResWithToken({ authorities: [] })

    const authorisationResponse = contactHelpdeskAuthorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(authorisationResponse).toEqual('/authError')
  })

  it('should redirect to authError given user is not authenticated', () => {
    const res = createUnauthenticatedRes()

    const authorisationResponse = contactHelpdeskAuthorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(authorisationResponse).toEqual('/authError')
  })
})
